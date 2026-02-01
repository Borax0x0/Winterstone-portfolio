import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';

interface SessionUser {
    email?: string | null;
    role?: string;
}

interface Params {
    params: Promise<{
        id: string;
    }>;
}

// PUT update booking (admin only, or owner for cancellation)
export async function PUT(request: Request, props: Params) {
    const params = await props.params;
    try {
        const session = await auth();
        
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();

        // Get the existing booking
        const existingBooking = await Booking.findById(params.id);
        if (!existingBooking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        const userRole = (session.user as SessionUser).role;
        const isAdmin = userRole ? ['admin', 'superadmin'].includes(userRole) : false;
        const isOwner = existingBooking.email.toLowerCase() === session.user.email?.toLowerCase();

        // Only admin can update, or owner can cancel their own booking
        if (!isAdmin && !isOwner) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // If owner (non-admin), they can only cancel
        if (isOwner && !isAdmin) {
            if (body.status && body.status !== 'Cancelled') {
                return NextResponse.json({ error: 'You can only cancel your booking' }, { status: 403 });
            }
            // Only allow status change to Cancelled
            body.status = 'Cancelled';
            delete body.guestName;
            delete body.roomName;
            delete body.checkIn;
            delete body.checkOut;
            delete body.totalAmount;
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            params.id,
            body,
            { new: true, runValidators: true }
        );

        return NextResponse.json(updatedBooking);
    } catch (error) {
        console.error('Failed to update booking:', error);
        return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
    }
}

// DELETE booking (admin only)
export async function DELETE(request: Request, props: Params) {
    const params = await props.params;
    try {
        const session = await auth();
        
        // Only admin can delete bookings
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const userRole = (session.user as SessionUser).role;
        if (!userRole || !['admin', 'superadmin'].includes(userRole)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const deletedBooking = await Booking.findByIdAndDelete(params.id);

        if (!deletedBooking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.error('Failed to delete booking:', error);
        return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
    }
}
