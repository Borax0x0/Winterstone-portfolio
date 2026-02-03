import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import RoomUnit from '@/models/RoomUnit'; // Import RoomUnit

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
        const unitId = searchParams.get('unit'); // Specific Unit ID

        if (!roomSlug) {
            return NextResponse.json({ error: 'Room slug is required' }, { status: 400 });
        }

        // Convert slug to room name
        const roomName = ROOM_SLUG_TO_NAME[roomSlug.toLowerCase()];

        if (!roomName) {
            return NextResponse.json({ error: 'Invalid room slug' }, { status: 400 });
        }

        // --- SPECIFIC UNIT AVAILABILITY ---
        if (unitId) {
            // 1. Find bookings strictly for this unit
            const bookings = await Booking.find({
                roomName: roomName,
                status: { $in: ['Confirmed', 'Pending'] },
                assignedUnit: unitId
            }).select('checkIn checkOut');

            // 2. Generate blocked dates
            const blockedDates: string[] = [];
            bookings.forEach((booking) => {
                const checkIn = new Date(booking.checkIn);
                const checkOut = new Date(booking.checkOut);
                const current = new Date(checkIn);
                while (current < checkOut) {
                    blockedDates.push(current.toISOString().split('T')[0]);
                    current.setDate(current.getDate() + 1);
                }
            });

            return NextResponse.json({
                room: roomSlug,
                unit: unitId,
                blockedDates: [...new Set(blockedDates)],
                inventory: 1, // Single unit logic
            });
        }

        // --- AGGREGATE AVAILABILITY (Old Logic) ---
        // 1. Get Total Inventory for this room type
        let totalInventory = await RoomUnit.countDocuments({ roomTypeSlug: roomSlug, isActive: true });
        
        // Fallback: If no units are defined in DB yet, assume 1 (Single Inventory Mode)
        // Or assume 3 as per user request if we want to hardcode for now, but better to rely on DB
        if (totalInventory === 0) {
            totalInventory = 1; 
        }

        // 2. Find all bookings for this room type
        const bookings = await Booking.find({
            roomName: roomName,
            status: { $in: ['Confirmed', 'Pending'] },
        }).select('checkIn checkOut');

        // 3. Count bookings per date
        const dateCounts: Record<string, number> = {};

        bookings.forEach((booking) => {
            const checkIn = new Date(booking.checkIn);
            const checkOut = new Date(booking.checkOut);

            const current = new Date(checkIn);
            while (current < checkOut) {
                const dateStr = current.toISOString().split('T')[0];
                dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
                current.setDate(current.getDate() + 1);
            }
        });

        // 4. Identify blocked dates (where count >= inventory)
        const blockedDates = Object.entries(dateCounts)
            .filter(([_, count]) => count >= totalInventory)
            .map(([date]) => date);

        return NextResponse.json({
            room: roomSlug,
            blockedDates: blockedDates,
            inventory: totalInventory,
            count: blockedDates.length,
        });

    } catch (error: unknown) {
        console.error('Error fetching availability:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch availability';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
