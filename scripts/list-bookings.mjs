/**
 * List all bookings — to identify dummy/test records before cleanup.
 * Run with: node scripts/list-bookings.mjs
 */

import { MongoClient } from 'mongodb';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const envPath = resolve(__dirname, '../.env.local');
const envContent = readFileSync(envPath, 'utf8');
for (const line of envContent.split('\n')) {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
}

const uri = process.env.MONGODB_URI;
if (!uri) { console.error('❌ MONGODB_URI not found'); process.exit(1); }

const client = new MongoClient(uri);

try {
    await client.connect();
    const bookings = await client.db().collection('bookings').find({}).sort({ createdAt: -1 }).toArray();

    console.log(`Total bookings: ${bookings.length}\n`);
    console.log('─'.repeat(100));

    for (const b of bookings) {
        console.log(`ID:      ${b._id}`);
        console.log(`Guest:   ${b.guestName} <${b.email}>`);
        console.log(`Room:    ${b.roomName}`);
        console.log(`Dates:   ${b.checkIn} → ${b.checkOut}`);
        console.log(`Status:  ${b.status} | Payment: ${b.paymentStatus} | Source: ${b.source}`);
        console.log(`ExtID:   ${b.externalBookingId || '(none — direct booking)'}`);
        console.log(`Amount:  ₹${b.totalAmount}`);
        console.log(`Created: ${b.createdAt}`);
        console.log('─'.repeat(100));
    }
} catch (err) {
    console.error('❌ Error:', err.message);
} finally {
    await client.close();
}
