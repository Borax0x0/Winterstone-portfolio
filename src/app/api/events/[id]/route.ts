import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';

interface Params {
    params: Promise<{
        id: string;
    }>;
}

export async function PUT(request: Request, props: Params) {
    const params = await props.params;
    try {
        await dbConnect();
        const body = await request.json();

        const updatedEvent = await Event.findByIdAndUpdate(
            params.id,
            body,
            { new: true, runValidators: true } // Return the updated document
        );

        if (!updatedEvent) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        return NextResponse.json(updatedEvent);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
    }
}

export async function DELETE(request: Request, props: Params) {
    const params = await props.params;
    try {
        await dbConnect();

        const deletedEvent = await Event.findByIdAndDelete(params.id);

        if (!deletedEvent) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Event deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
    }
}
