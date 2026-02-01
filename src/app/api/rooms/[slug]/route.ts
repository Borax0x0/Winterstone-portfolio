import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Room from '@/models/Room';

// GET single room by slug (public)
export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        await dbConnect();
        
        const room = await Room.findOne({ slug: slug.toLowerCase() });
        
        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }
        
        return NextResponse.json(room);
    } catch (error) {
        console.error('Failed to fetch room:', error);
        return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 });
    }
}

// PUT update room (admin only)
export async function PUT(
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
        const body = await request.json();

        // Don't allow changing the slug through PUT (use separate endpoint if needed)
        delete body.slug;
        
        const room = await Room.findOneAndUpdate(
            { slug: slug.toLowerCase() },
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        return NextResponse.json(room);
    } catch (error) {
        console.error('Failed to update room:', error);
        return NextResponse.json({ error: 'Failed to update room' }, { status: 400 });
    }
}

// DELETE room (admin only)
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

        const room = await Room.findOneAndDelete({ slug: slug.toLowerCase() });

        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Room deleted successfully' });
    } catch (error) {
        console.error('Failed to delete room:', error);
        return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
    }
}
