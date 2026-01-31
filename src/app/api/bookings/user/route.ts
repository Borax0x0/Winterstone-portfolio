import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';

// GET /api/bookings/user?email=xxx
export async function GET(request: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
        }

        // Find all bookings for this email, sorted by newest first
        const bookings = await Booking.find({ email: email.toLowerCase() })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(bookings);
    } catch (error: any) {
        console.error('Error fetching user bookings:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
