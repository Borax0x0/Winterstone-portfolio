/**
 * Script to check all users and optionally promote one to superadmin
 * Usage: node scripts/check-users.mjs [email-to-promote]
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const UserSchema = new mongoose.Schema({
    email: String,
    name: String,
    role: String,
    emailVerified: Boolean,
    createdAt: Date,
});

async function main() {
    const emailToPromote = process.argv[2];

    console.log('\n Connecting to MongoDB...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!\n');

    const User = mongoose.model('User', UserSchema);

    // List all users
    const users = await User.find({}).select('email name role emailVerified createdAt');

    console.log('ALL USERS IN DATABASE:');
    console.log('─'.repeat(80));
    console.log(`${'EMAIL'.padEnd(35)} ${'NAME'.padEnd(20)} ${'ROLE'.padEnd(12)} VERIFIED`);
    console.log('─'.repeat(80));

    users.forEach(u => {
        const roleDisplay = u.role === 'superadmin' ? 'superadmin' : u.role === 'admin' ? 'admin' : 'guest';
        console.log(`${u.email.padEnd(35)} ${(u.name || 'N/A').padEnd(20)} ${roleDisplay.padEnd(12)} ${u.emailVerified ? 'Y' : 'N'}`);
    });

    console.log('─'.repeat(80));
    console.log(`Total: ${users.length} users\n`);

    // Check for superadmins
    const superadmins = users.filter(u => u.role === 'superadmin');
    if (superadmins.length === 0) {
        console.log('WARNING: NO SUPERADMIN EXISTS! You need to promote a user.\n');
    } else {
        console.log(`Superadmin(s): ${superadmins.map(u => u.email).join(', ')}\n`);
    }

    // Promote user if email provided
    if (emailToPromote) {
        console.log(`Promoting ${emailToPromote} to superadmin...`);
        const result = await User.updateOne(
            { email: emailToPromote.toLowerCase() },
            { $set: { role: 'superadmin' } }
        );

        if (result.matchedCount === 0) {
            console.log(`User not found: ${emailToPromote}`);
        } else if (result.modifiedCount === 0) {
            console.log(`User ${emailToPromote} is already superadmin`);
        } else {
            console.log(`Successfully promoted ${emailToPromote} to superadmin!`);
            console.log('User must LOG OUT and LOG BACK IN for changes to take effect.\n');
        }
    } else {
        console.log('To promote a user, run: node scripts/check-users.mjs <email>');
        console.log('Example: node scripts/check-users.mjs admin@winterstone.com\n');
    }

    await mongoose.disconnect();
    console.log('Done!\n');
}

main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
