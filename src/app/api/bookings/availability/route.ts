import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';

// Map room slugs to room names
const ROOM_SLUG_TO_NAME: Record<string, string> = {
    'skyline-haven': 'Skyline Haven',
    'zen-nest': 'Zen Nest',
    'sunlit-studio': 'Sunlit Studio',
};

/**
 * GET /api/bookings/availability
 * 
 * Returns all blocked dates for a specific room.
 * Query params: room (slug like "skyline-haven")
 */
export async function GET(request: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const roomSlug = searchParams.get('room');

        if (!roomSlug) {
            return NextResponse.json({ error: 'Room slug is required' }, { status: 400 });
        }

        // Convert slug to room name
        const roomName = ROOM_SLUG_TO_NAME[roomSlug.toLowerCase()];

        if (!roomName) {
            return NextResponse.json({ error: 'Invalid room slug' }, { status: 400 });
        }

        // Find all bookings for this room (confirmed or pending)
        const bookings = await Booking.find({
            roomName: roomName,
            status: { $in: ['Confirmed', 'Pending'] }, // Match exact case from model
        }).select('checkIn checkOut');

        // Generate array of all blocked dates
        const blockedDates: string[] = [];

        bookings.forEach((booking) => {
            const checkIn = new Date(booking.checkIn);
            const checkOut = new Date(booking.checkOut);

            // Add each date from check-in to check-out (exclusive of checkout)
            const current = new Date(checkIn);
            while (current < checkOut) {
                blockedDates.push(current.toISOString().split('T')[0]);
                current.setDate(current.getDate() + 1);
            }
        });

        const uniqueDates = [...new Set(blockedDates)];

        return NextResponse.json({
            room: roomSlug,
            blockedDates: uniqueDates,
            count: uniqueDates.length,
        });

    } catch (error: any) {
        console.error('Error fetching availability:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
