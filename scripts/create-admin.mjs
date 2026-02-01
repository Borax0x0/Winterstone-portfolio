// Script to create an admin user
// Run with: node scripts/create-admin.mjs
//
// Required environment variables:
//   ADMIN_EMAIL    - Email for the admin account
//   ADMIN_PASSWORD - Password for the admin account (use a strong password!)
//   ADMIN_NAME     - Display name for the admin (optional)
//
// Example:
//   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=SecurePass123! node scripts/create-admin.mjs

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
config({ path: join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI not found. Make sure .env.local exists with MONGODB_URI set.');
    process.exit(1);
}

// Read credentials from environment variables
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
const adminName = process.env.ADMIN_NAME || 'Admin';

// Validate required credentials
if (!adminEmail || !adminPassword) {
    console.error('Error: Missing required environment variables.');
    console.error('Please set ADMIN_EMAIL and ADMIN_PASSWORD.');
    console.error('');
    console.error('Example usage:');
    console.error('  ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=SecurePass123! node scripts/create-admin.mjs');
    process.exit(1);
}

if (adminPassword.length < 8) {
    console.error('Error: Password must be at least 8 characters long.');
    process.exit(1);
}

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['guest', 'admin'], default: 'guest' },
    emailVerified: { type: Boolean, default: false },
    verificationToken: String,
    tokenExpiry: Date,
}, { timestamps: true });

async function createAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const User = mongoose.models.User || mongoose.model('User', UserSchema);

        // Check if admin exists
        const existing = await User.findOne({ email: adminEmail });
        if (existing) {
            console.log('Admin user already exists');
            await mongoose.disconnect();
            return;
        }

        // Create admin
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await User.create({
            email: adminEmail,
            password: hashedPassword,
            name: adminName,
            role: 'admin',
            emailVerified: true, // Pre-verified for admin
        });

        console.log('Admin user created successfully!');
        console.log('Email:', adminEmail);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createAdmin();
