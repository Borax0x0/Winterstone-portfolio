import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { uploadToS3 } from '@/lib/s3';

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

        // Upload to S3
        const imageUrl = await uploadToS3(file, 'events');

        return NextResponse.json({
            message: 'Image uploaded successfully',
            imageUrl
        }, { status: 201 });

    } catch (error) {
        console.error('Failed to upload event image:', error);
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }
}
