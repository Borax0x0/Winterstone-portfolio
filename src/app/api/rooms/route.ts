import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Room from '@/models/Room';

interface SessionUser {
    email?: string | null;
    role?: string;
}

// GET all rooms (public)
export async function GET() {
    try {
        await dbConnect();
        
        // Get all active rooms, sorted by displayOrder
        const rooms = await Room.find({ isActive: true }).sort({ displayOrder: 1 });
        return NextResponse.json(rooms);
    } catch (error) {
        console.error('Failed to fetch rooms:', error);
        return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
    }
}

// POST create new room (admin only)
export async function POST(request: Request) {
    try {
        const session = await auth();
        
        // Check if user is admin or superadmin
        const userRole = (session?.user as SessionUser | undefined)?.role;
        if (!session?.user || !userRole || !['admin', 'superadmin'].includes(userRole)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();

        // Validate required fields
        const { slug, name, price, description, heroImage } = body;
        if (!slug || !name || !price || !description || !heroImage) {
            return NextResponse.json(
                { error: 'Missing required fields: slug, name, price, description, heroImage' },
                { status: 400 }
            );
        }

        // Check if slug already exists
        const existing = await Room.findOne({ slug: slug.toLowerCase() });
        if (existing) {
            return NextResponse.json({ error: 'Room with this slug already exists' }, { status: 400 });
        }

        // Get the highest displayOrder and add 1
        const lastRoom = await Room.findOne().sort({ displayOrder: -1 });
        const displayOrder = lastRoom ? lastRoom.displayOrder + 1 : 0;

        // Create room
        const room = await Room.create({
            ...body,
            slug: slug.toLowerCase(),
            displayOrder,
        });

        return NextResponse.json(room, { status: 201 });
    } catch (error) {
        console.error('Failed to create room:', error);
        return NextResponse.json({ error: 'Failed to create room' }, { status: 400 });
    }
}
