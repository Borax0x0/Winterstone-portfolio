import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function createSuperadmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'winterstone110104@gmail.com';
        const password = 'Winterstone@mail';
        const name = 'Winterstone Studio';

        // Check if already exists
        const existing = await mongoose.connection.db.collection('users').findOne({ email });
        if (existing) {
            // Update to superadmin AND rehash password with bcryptjs
            const hashedPassword = await bcrypt.hash(password, 10);
            await mongoose.connection.db.collection('users').updateOne(
                { email },
                { $set: { role: 'superadmin', password: hashedPassword } }
            );
            console.log('User upgraded to superadmin with new password hash:', email);
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
    }
}

createSuperadmin();
