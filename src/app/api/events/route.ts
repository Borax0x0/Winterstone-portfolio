import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import { INITIAL_EVENTS } from '@/lib/mockData';

export async function GET() {
    try {
        await dbConnect();

        // Auto-Seed Logic: If no events exist, insert the mock data
        const count = await Event.countDocuments();
        if (count === 0) {
            await Event.insertMany(INITIAL_EVENTS);
        }

        // Fetch all events
        // We don't sort here because the frontend handles the split (Upcoming/Past) logic
        // But we could sort by date just to be organized
        const events = await Event.find({}).sort({ date: 1 });
        return NextResponse.json(events);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        // Create new event
        const event = await Event.create(body);

        return NextResponse.json(event, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create event' }, { status: 400 });
    }
}
