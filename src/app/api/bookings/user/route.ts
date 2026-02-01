import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';

// GET /api/bookings/user - Get current user's bookings
export async function GET() {
    try {
        const session = await auth();
        
        // Must be logged in
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Get bookings for the logged-in user only (no email param needed - uses session)
        const bookings = await Booking.find({ email: session.user.email.toLowerCase() })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(bookings);
    } catch (error: unknown) {
        console.error('Error fetching user bookings:', error);
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }
}
