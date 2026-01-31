import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import { INITIAL_BOOKINGS } from '@/lib/mockData';

export async function GET() {
    try {
        await dbConnect();

        // Auto-Seed
        const count = await Booking.countDocuments();
        if (count === 0) {
            await Booking.insertMany(INITIAL_BOOKINGS);
        }

        // Fetch all bookings sorted by createdAt desc
        const bookings = await Booking.find({}).sort({ createdAt: -1 });
        return NextResponse.json(bookings);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        // Create new booking
        const booking = await Booking.create(body);

        return NextResponse.json(booking, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create booking' }, { status: 400 });
    }
}
