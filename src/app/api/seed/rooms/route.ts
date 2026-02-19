import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import RoomUnit from '@/models/RoomUnit';

const ROOM_UNITS = [
    // Zen Nest — 201, 202, 203
    {
        name: 'Room 201',
        roomTypeSlug: 'zen-nest',
        shortDescription: 'Ground-floor garden retreat with direct courtyard access.',
        image: '/zen-room-1.jpg',
        features: ['Garden View', 'Ground Floor', 'Queen Bed'],
        isActive: true,
    },
    {
        name: 'Room 202',
        roomTypeSlug: 'zen-nest',
        shortDescription: 'Mid-floor sanctuary with forest canopy views and quiet surroundings.',
        image: '/zen-room-2.jpg',
        features: ['Forest View', 'Soundproofed', 'Queen Bed'],
        isActive: true,
    },
    {
        name: 'Room 203',
        roomTypeSlug: 'zen-nest',
        shortDescription: 'Top-floor Zen suite with a private balcony facing misty hills.',
        image: '/zen-room-3.jpg',
        features: ['Private Balcony', 'Hill View', 'King Bed'],
        isActive: true,
    },

    // Sunlit Studio — 301, 302, 303
    {
        name: 'Room 301',
        roomTypeSlug: 'sunlit-studio',
        shortDescription: 'East-facing studio drenched in morning golden light.',
        image: '/sunlit-room-1.jpg',
        features: ['East Facing', 'Morning Light', 'King Bed'],
        isActive: true,
    },
    {
        name: 'Room 302',
        roomTypeSlug: 'sunlit-studio',
        shortDescription: 'Corner studio with angled windows and a sunny reading nook.',
        image: '/sunlit-room-2.jpg',
        features: ['Corner Unit', 'Reading Nook', 'Queen Bed'],
        isActive: true,
    },
    {
        name: 'Room 303',
        roomTypeSlug: 'sunlit-studio',
        shortDescription: 'Airy studio suite with a skylight and open-plan layout.',
        image: '/sunlit-room-3.jpg',
        features: ['Skylight', 'Open Plan', 'King Bed'],
        isActive: true,
    },

    // Skyline Haven — 304, 305, 306
    {
        name: 'Room 304',
        roomTypeSlug: 'skyline-haven',
        shortDescription: 'Valley-facing haven with panoramic views and morning mist.',
        image: '/skyline-room-1.jpg',
        features: ['Valley View', 'Private Balcony', 'King Bed'],
        isActive: true,
    },
    {
        name: 'Room 305',
        roomTypeSlug: 'skyline-haven',
        shortDescription: 'Mountain-view suite with snow-capped peak sightlines.',
        image: '/skyline-room-2.jpg',
        features: ['Mountain View', 'Heated Floors', 'King Bed'],
        isActive: true,
    },
    {
        name: 'Room 306',
        roomTypeSlug: 'skyline-haven',
        shortDescription: 'Corner suite with wrap-around Himalayan views and a lounger.',
        image: '/skyline-room-3.jpg',
        features: ['Wrap-Around View', 'Lounge Area', 'King Bed'],
        isActive: true,
    },
];

export async function POST() {
    // Safety check — only allow in development
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
    }

    try {
        await dbConnect();

        // Clear existing units to avoid duplicates
        await RoomUnit.deleteMany({});

        // Insert all units
        const created = await RoomUnit.insertMany(ROOM_UNITS);

        return NextResponse.json({
            success: true,
            message: `Seeded ${created.length} room units`,
            rooms: created.map(r => ({ name: r.name, slug: r.roomTypeSlug })),
        });
    } catch (error) {
        console.error('Seed failed:', error);
        return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
    }
}
