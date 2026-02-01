// Script to create a superadmin user
// Run with: node scripts/create-superadmin.mjs
//
// Required environment variables:
//   SUPERADMIN_EMAIL    - Email for the superadmin account
//   SUPERADMIN_PASSWORD - Password for the superadmin account (use a strong password!)
//   SUPERADMIN_NAME     - Display name for the superadmin (optional)
//
// Example:
//   SUPERADMIN_EMAIL=admin@example.com SUPERADMIN_PASSWORD=SecurePass123! SUPERADMIN_NAME="Admin User" node scripts/create-superadmin.mjs

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function createSuperadmin() {
    // Read credentials from environment variables
    const email = process.env.SUPERADMIN_EMAIL;
    const password = process.env.SUPERADMIN_PASSWORD;
    const name = process.env.SUPERADMIN_NAME || 'Superadmin';

    // Validate required credentials
    if (!email || !password) {
        console.error('Error: Missing required environment variables.');
        console.error('Please set SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD.');
        console.error('');
        console.error('Example usage:');
        console.error('  SUPERADMIN_EMAIL=admin@example.com SUPERADMIN_PASSWORD=SecurePass123! node scripts/create-superadmin.mjs');
        process.exit(1);
    }

    if (password.length < 8) {
        console.error('Error: Password must be at least 8 characters long.');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if already exists
        const existing = await mongoose.connection.db.collection('users').findOne({ email });
        if (existing) {
            // Update to superadmin AND rehash password with bcryptjs
            const hashedPassword = await bcrypt.hash(password, 10);
            await mongoose.connection.db.collection('users').updateOne(
                { email },
                { $set: { role: 'superadmin', password: hashedPassword } }
            );
            console.log('User upgraded to superadmin:', email);
        } else {
            // Create new superadmin
            const hashedPassword = await bcrypt.hash(password, 10);
            await mongoose.connection.db.collection('users').insertOne({
                email,
                password: hashedPassword,
                name,
                role: 'superadmin',
                emailVerified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log('Superadmin created:', email);
        }

        await mongoose.disconnect();
        console.log('Done!');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createSuperadmin();
