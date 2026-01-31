import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password: string;
    name: string;
    phone?: string;
    address?: string;
    role: 'guest' | 'admin' | 'superadmin';
    emailVerified: boolean;
    verificationToken?: string;
    tokenExpiry?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        role: {
            type: String,
            enum: ['guest', 'admin', 'superadmin'],
            default: 'guest',
        },
        emailVerified: {
            type: Boolean,
            default: false,
        },
        verificationToken: {
            type: String,
        },
        tokenExpiry: {
            type: Date,
        },
    },
    { timestamps: true }
);

// Prevent model recompilation in dev
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
