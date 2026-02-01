import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';

// GET all events (public - anyone can view events)
export async function GET() {
    try {
        await dbConnect();

        // Fetch all events sorted by date
        const events = await Event.find({}).sort({ date: 1 });
        return NextResponse.json(events);
    } catch (error) {
        console.error('Failed to fetch events:', error);
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
}

// POST create event (admin only)
export async function POST(request: Request) {
    try {
        const session = await auth();
        
        // Only admin/superadmin can create events
        if (!session?.user || !['admin', 'superadmin'].includes((session.user as any).role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();

        // Create new event
        const event = await Event.create(body);

        return NextResponse.json(event, { status: 201 });
    } catch (error) {
        console.error('Failed to create event:', error);
        return NextResponse.json({ error: 'Failed to create event' }, { status: 400 });
    }
}
