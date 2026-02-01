// Script to seed the database with initial room data
// Run with: node scripts/seed-rooms.mjs

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const RoomSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    amenities: [{ type: String }],
    heroImage: { type: String, required: true },
    gallery: [{ type: String }],
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
}, { timestamps: true });

const initialRooms = [
    {
        slug: "skyline-haven",
        name: "Skyline Haven",
        price: 8500,
        heroImage: "/skyline-main.jpg",
        gallery: ["/skyline-1.jpg", "/skyline-2.jpg", "/bath-1.jpg"],
        description: "Perched high above the valley, the Skyline Haven is designed for the observer. Step out onto your private balcony to witness the mist rolling over the Himalayas. The interior blends warm wood tones with modern luxury.",
        amenities: ["Private Mountain Balcony", "Valley View", "King Size Bed", "Heated Floors", "Work Desk", "High-Speed Wi-Fi"],
        isActive: true,
        displayOrder: 0,
    },
    {
        slug: "zen-nest",
        name: "Zen Nest",
        price: 6500,
        heroImage: "/zen-main.jpg",
        gallery: ["/zen-1.jpg", "/zen-2.jpg", "/bath-2.jpg"],
        description: "A sanctuary dedicated to mindfulness. The Zen Nest features designated space for yoga, meditation, and stillness. Minimalist decor and soft ambient lighting allow you to disconnect from the noise and reconnect with yourself.",
        amenities: ["Yoga & Meditation Space", "Soundproofing", "Meditation Cushions", "Herbal Tea Station", "Dimmable Lighting", "Queen Bed"],
        isActive: true,
        displayOrder: 1,
    },
    {
        slug: "sunlit-studio",
        name: "Sunlit Studio",
        price: 7200,
        heroImage: "/sunlit-main.jpg",
        gallery: ["/sunlit-1.jpg", "/sunlit-2.jpg", "/bath-1.jpg"],
        description: "Bathed in natural light, the Sunlit Studio blurs the line between indoors and out. Located on the ground floor for easy access, the massive front-facing windows frame the pine forest, bringing the golden hour directly to your bedside.",
        amenities: ["Floor-to-Ceiling Windows", "Ground Floor Access", "Sitting Area", "Natural Light", "Rain Shower", "Smart TV"],
        isActive: true,
        displayOrder: 2,
    },
];

async function seedRooms() {
    if (!process.env.MONGODB_URI) {
        console.error('Error: MONGODB_URI not found in environment variables.');
        process.exit(1);
    }

    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!\n');

        const Room = mongoose.model('Room', RoomSchema);

        // Check if rooms already exist
        const existingCount = await Room.countDocuments();
        if (existingCount > 0) {
            console.log(`Found ${existingCount} existing rooms.`);
            const answer = process.argv[2];
            if (answer !== '--force') {
                console.log('Use --force flag to delete existing rooms and reseed.');
                console.log('Example: node scripts/seed-rooms.mjs --force\n');
                await mongoose.disconnect();
                return;
            }
            console.log('Force flag detected. Deleting existing rooms...');
            await Room.deleteMany({});
            console.log('Existing rooms deleted.\n');
        }

        // Insert rooms
        console.log('Seeding rooms...');
        for (const roomData of initialRooms) {
            const room = await Room.create(roomData);
            console.log(`  Created: ${room.name} (${room.slug})`);
        }

        console.log('\nSeeding complete!');
        console.log(`Total rooms: ${initialRooms.length}`);

        await mongoose.disconnect();
        console.log('Done!');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

seedRooms();
