import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function fixReviews() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const result = await mongoose.connection.db.collection('reviews').updateMany(
            { approved: false },
            { $set: { approved: true } }
        );

        console.log('Updated', result.modifiedCount, 'review(s) to approved');

        await mongoose.disconnect();
        console.log('Done!');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

fixReviews();
