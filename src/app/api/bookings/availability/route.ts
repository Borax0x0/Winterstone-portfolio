import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import RoomUnit from '@/models/RoomUnit';

// All known names per room type — website name + every OTA alias eZee sends
const ROOM_ALIASES: Record<string, string[]> = {
    'skyline-haven':  ['Skyline Haven', 'Superior Deluxe', 'SUPER DELUXE', 'Super Deluxe'],
    'zen-nest':       ['Zen Nest', 'Standard Double', 'STANDARD DOUBLE'],
    'sunlit-studio':  ['Sunlit Studio', 'Deluxe Room', 'Deluxe Double', 'DELUXE ROOM', 'DELUXE DOUBLE'],
};

/**
 * GET /api/bookings/availability
 *
 * Returns all blocked dates for a specific room type.
 * OTA bookings (eZee-synced) are included via alias matching.
 * Query params:
 *   room  — slug like "skyline-haven"  (required)
 *   unit  — RoomUnit _id               (optional, for specific-unit view)
 */
export async function GET(request: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const roomSlug = searchParams.get('room');
        const unitId = searchParams.get('unit');

        if (!roomSlug) {
            return NextResponse.json({ error: 'Room slug is required' }, { status: 400 });
        }

        const aliases = ROOM_ALIASES[roomSlug.toLowerCase()];

        if (!aliases) {
            return NextResponse.json({ error: 'Invalid room slug' }, { status: 400 });
        }

        // Keep a canonical name for unit-mode queries (first alias = website name)
        const roomName = aliases[0];

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

        // --- AGGREGATE AVAILABILITY ---
        // 1. Get total inventory for this room type
        let totalInventory = await RoomUnit.countDocuments({ roomTypeSlug: roomSlug, isActive: true });
        if (totalInventory === 0) totalInventory = 1;

        // 2. Find all active bookings for this room type — including OTA aliases
        const bookings = await Booking.find({
            roomName: { $in: aliases },
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
