import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';

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

        const updatedBooking = await Booking.findByIdAndUpdate(
            params.id,
            body,
            { new: true, runValidators: true }
        );

        if (!updatedBooking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        return NextResponse.json(updatedBooking);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
    }
}

export async function DELETE(request: Request, props: Params) {
    const params = await props.params;
    try {
        await dbConnect();

        const deletedBooking = await Booking.findByIdAndDelete(params.id);

        if (!deletedBooking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
    }
}
