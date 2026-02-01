import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Room from '@/models/Room';
import { writeFile, unlink, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

// POST upload image (admin only)
export async function POST(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const session = await auth();
        
        // Check if user is admin or superadmin
        if (!session?.user || !['admin', 'superadmin'].includes((session.user as any).role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { slug } = await params;
        await dbConnect();

        // Check if room exists
        const room = await Room.findOne({ slug: slug.toLowerCase() });
        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        const formData = await request.formData();
        const file = formData.get('image') as File;
        const imageType = formData.get('type') as string; // 'hero' or 'gallery'

        if (!file) {
            return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Allowed: JPEG, PNG, WebP' },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File too large. Max size: 5MB' },
                { status: 400 }
            );
        }

        // Create rooms directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), 'public', 'rooms', slug);
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // Generate unique filename
        const ext = file.name.split('.').pop();
        const timestamp = Date.now();
        const filename = `${imageType === 'hero' ? 'hero' : `gallery-${timestamp}`}.${ext}`;
        const filepath = path.join(uploadDir, filename);

        // Write file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Build the public URL
        const imageUrl = `/rooms/${slug}/${filename}`;

        // Update room in database
        if (imageType === 'hero') {
            room.heroImage = imageUrl;
        } else {
            room.gallery.push(imageUrl);
        }
        await room.save();

        return NextResponse.json({
            message: 'Image uploaded successfully',
            imageUrl,
            room
        }, { status: 201 });
    } catch (error) {
        console.error('Failed to upload image:', error);
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }
}

// DELETE remove image (admin only)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const session = await auth();
        
        // Check if user is admin or superadmin
        if (!session?.user || !['admin', 'superadmin'].includes((session.user as any).role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { slug } = await params;
        await dbConnect();

        const { imageUrl } = await request.json();

        if (!imageUrl) {
            return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
        }

        // Check if room exists
        const room = await Room.findOne({ slug: slug.toLowerCase() });
        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        // Don't allow deleting hero image (must be replaced instead)
        if (room.heroImage === imageUrl) {
            return NextResponse.json(
                { error: 'Cannot delete hero image. Upload a new one to replace it.' },
                { status: 400 }
            );
        }

        // Remove from gallery array
        room.gallery = room.gallery.filter((img: string) => img !== imageUrl);
        await room.save();

        // Try to delete the actual file (best effort, don't fail if it doesn't exist)
        try {
            const filepath = path.join(process.cwd(), 'public', imageUrl);
            if (existsSync(filepath)) {
                await unlink(filepath);
            }
        } catch (fileError) {
            console.warn('Could not delete file:', fileError);
        }

        return NextResponse.json({
            message: 'Image removed successfully',
            room
        });
    } catch (error) {
        console.error('Failed to delete image:', error);
        return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
    }
}
