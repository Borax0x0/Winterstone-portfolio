import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

interface SessionUser {
    email?: string | null;
    role?: string;
}

// POST upload event image (admin only)
export async function POST(request: Request) {
    try {
        const session = await auth();
        
        // Check if user is admin
        const userRole = (session?.user as SessionUser | undefined)?.role;
        if (!session?.user || !userRole || !['admin', 'superadmin'].includes(userRole)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('image') as File;

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

        // Create events directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), 'public', 'events');
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // Generate unique filename
        const ext = file.name.split('.').pop();
        const timestamp = Date.now();
        // Sanitize filename to be safe
        const safeName = file.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `event-${timestamp}-${safeName}.${ext}`;
        const filepath = path.join(uploadDir, filename);

        // Write file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Return the public URL
        const imageUrl = `/events/${filename}`;

        return NextResponse.json({
            message: 'Image uploaded successfully',
            imageUrl
        }, { status: 201 });

    } catch (error) {
        console.error('Failed to upload event image:', error);
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }
}
