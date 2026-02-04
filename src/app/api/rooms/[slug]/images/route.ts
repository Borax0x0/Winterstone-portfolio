import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Room from '@/models/Room';
import { uploadToS3, deleteFromS3 } from '@/lib/s3';

interface SessionUser {
    email?: string | null;
    role?: string;
}

// POST upload image (admin only)
export async function POST(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const session = await auth();
        
        // Check if user is admin or superadmin
        const userRole = (session?.user as SessionUser | undefined)?.role;
        if (!session?.user || !userRole || !['admin', 'superadmin'].includes(userRole)) {
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

        // Upload to S3
        const folder = `rooms/${slug}`;
        const imageUrl = await uploadToS3(file, folder);

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
        const userRole = (session?.user as SessionUser | undefined)?.role;
        if (!session?.user || !userRole || !['admin', 'superadmin'].includes(userRole)) {
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

        // Delete from S3
        await deleteFromS3(imageUrl);

        return NextResponse.json({
            message: 'Image removed successfully',
            room
        });
    } catch (error) {
        console.error('Failed to delete image:', error);
        return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
    }
}
