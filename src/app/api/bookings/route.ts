import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';

interface SessionUser {
    email?: string | null;
    role?: string;
}

// GET all bookings (admin only)
export async function GET(request: Request) {
    try {
        const session = await auth();
        
        // Only admin/superadmin can view all bookings
        const userRole = (session?.user as SessionUser | undefined)?.role;
        if (!session?.user || !userRole || !['admin', 'superadmin'].includes(userRole)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const skip = (page - 1) * limit;

        await dbConnect();

        // Fetch all bookings sorted by createdAt desc
        const bookings = await Booking.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit);
        const total = await Booking.countDocuments({});
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({ bookings, totalPages, page, total });
    } catch (error) {
        console.error('Failed to fetch bookings:', error);
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }
}

// POST create booking (authenticated users only)
export async function POST(request: Request) {
    try {
        const session = await auth();
        
        // Guest Checkout is enabled, no session required.
        // We allow booking with the provided email, regardless of session status.
        await dbConnect();
        const body = await request.json();

        // Create new booking
        const booking = await Booking.create({
            ...body,
            email: body.email?.toLowerCase() || (session?.user?.email?.toLowerCase() ?? ''),
        });

        return NextResponse.json(booking, { status: 201 });
    } catch (error) {
        console.error('Failed to create booking:', error);
        return NextResponse.json({ error: 'Failed to create booking' }, { status: 400 });
    }
}
