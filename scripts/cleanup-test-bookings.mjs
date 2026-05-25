/**
 * Cleanup script — removes specific dummy/test records from MongoDB.
 * Run with: node scripts/cleanup-test-bookings.mjs
 */

import { MongoClient, ObjectId } from 'mongodb';
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
if (!uri) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
}

// --- Target records ---
// By externalBookingId (eZee test records)
const TEST_EXTERNAL_IDS = [];

// By MongoDB _id (specific dummy bookings)
const DUMMY_OBJECT_IDS = [
    'F7F65F', // bdibb ad / dummywinterstoneadd@gmail.com
];

// By email (catch-all for dummy accounts)
const DUMMY_EMAILS = [
    'dummywinterstoneadd@gmail.com',
];

const client = new MongoClient(uri);

try {
    await client.connect();
    const bookings = client.db().collection('bookings');

    let totalDeleted = 0;

    // Delete by externalBookingId
    if (TEST_EXTERNAL_IDS.length) {
        const r = await bookings.deleteMany({ externalBookingId: { $in: TEST_EXTERNAL_IDS } });
        totalDeleted += r.deletedCount;
        if (r.deletedCount) console.log(`✅ Deleted ${r.deletedCount} by externalBookingId`);
    }

    // Delete by partial _id match
    const all = await bookings.find({}).toArray();
    const byId = all.filter(b =>
        DUMMY_OBJECT_IDS.some(partial => b._id.toString().toLowerCase().includes(partial.toLowerCase()))
    );
    for (const b of byId) {
        await bookings.deleteOne({ _id: b._id });
        console.log(`✅ Deleted: ${b.guestName} <${b.email}> (${b._id})`);
        totalDeleted++;
    }

    // Delete by email
    if (DUMMY_EMAILS.length) {
        const r = await bookings.deleteMany({ email: { $in: DUMMY_EMAILS } });
        totalDeleted += r.deletedCount;
        if (r.deletedCount) console.log(`✅ Deleted ${r.deletedCount} by dummy email`);
    }

    if (totalDeleted === 0) {
        console.log('ℹ️  No dummy bookings found (already clean).');
    } else {
        console.log(`\n✅ Total deleted: ${totalDeleted}`);
    }

} catch (err) {
    console.error('❌ Error:', err.message);
} finally {
    await client.close();
}
