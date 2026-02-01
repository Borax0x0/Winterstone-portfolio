import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';

// GET all bookings (admin only)
export async function GET() {
    try {
        const session = await auth();
        
        // Only admin/superadmin can view all bookings
        if (!session?.user || !['admin', 'superadmin'].includes((session.user as any).role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Fetch all bookings sorted by createdAt desc
        const bookings = await Booking.find({}).sort({ createdAt: -1 });
        return NextResponse.json(bookings);
    } catch (error) {
        console.error('Failed to fetch bookings:', error);
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }
}

// POST create booking (authenticated users only)
export async function POST(request: Request) {
    try {
        const session = await auth();
        
        // Must be logged in to create a booking
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();

        // Ensure the booking email matches the logged-in user (prevent booking for others)
        if (body.email && body.email.toLowerCase() !== session.user.email?.toLowerCase()) {
            // Allow admins to create bookings for anyone
            if (!['admin', 'superadmin'].includes((session.user as any).role)) {
                return NextResponse.json({ error: 'Cannot create booking for another user' }, { status: 403 });
            }
        }

        // Create new booking
        const booking = await Booking.create({
            ...body,
            email: body.email?.toLowerCase() || session.user.email?.toLowerCase(),
        });

        return NextResponse.json(booking, { status: 201 });
    } catch (error) {
        console.error('Failed to create booking:', error);
        return NextResponse.json({ error: 'Failed to create booking' }, { status: 400 });
    }
}
