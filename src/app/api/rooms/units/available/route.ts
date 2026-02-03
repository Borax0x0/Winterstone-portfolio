import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import RoomUnit from '@/models/RoomUnit';
import Booking from '@/models/Booking';

// Map room slugs to room names (Keep consistent with other files)
const ROOM_SLUG_TO_NAME: Record<string, string> = {
    'skyline-haven': 'Skyline Haven',
    'zen-nest': 'Zen Nest',
    'sunlit-studio': 'Sunlit Studio',
};

// POST /api/rooms/units/available
// Body: { roomSlug, checkIn, checkOut }
export async function POST(request: Request) {
    try {
        await dbConnect();
        const { roomSlug, checkIn, checkOut } = await request.json();

        if (!roomSlug || !checkIn || !checkOut) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const roomName = ROOM_SLUG_TO_NAME[roomSlug.toLowerCase()];
        if (!roomName) {
            return NextResponse.json({ error: 'Invalid room slug' }, { status: 400 });
        }

        // 1. Get ALL Units for this room type
        const allUnits = await RoomUnit.find({ 
            roomTypeSlug: roomSlug, 
            isActive: true 
        }).sort({ name: 1 });

        if (allUnits.length === 0) {
            return NextResponse.json([]); // No units defined
        }

        // 2. Get ALL Bookings for this room overlapping the dates
        const queryStart = new Date(checkIn);
        const queryEnd = new Date(checkOut);

        const bookings = await Booking.find({
            roomName: roomName,
            status: { $in: ['Confirmed', 'Pending'] },
            $or: [
                // Overlap logic: (StartA <= EndB) and (EndA >= StartB)
                {
                    checkIn: { $lt: queryEnd.toISOString().split('T')[0] },
                    checkOut: { $gt: queryStart.toISOString().split('T')[0] }
                }
            ]
        }).select('assignedUnit');

        // 3. Calculate Availability
        const assignedUnitIds = new Set<string>();
        let floatingBookingCount = 0;

        bookings.forEach(b => {
            if (b.assignedUnit) {
                assignedUnitIds.add(b.assignedUnit);
            } else {
                floatingBookingCount++;
            }
        });

        // Filter units that are NOT explicitly assigned
        let availableUnits = allUnits.filter(u => !assignedUnitIds.has(u._id.toString()));

        // Handle floating bookings (reduce availability pool)
        // If we have 5 available units but 2 floating bookings, we can only offer 3 specific units.
        if (floatingBookingCount > 0) {
            // Remove 'floatingBookingCount' items from the available list
            // We remove from the END to keep 101, 102 available if possible
            availableUnits = availableUnits.slice(0, Math.max(0, availableUnits.length - floatingBookingCount));
        }

        return NextResponse.json(availableUnits);

    } catch (error) {
        console.error('Failed to fetch available units:', error);
        return NextResponse.json({ error: 'Failed to fetch units' }, { status: 500 });
    }
}
