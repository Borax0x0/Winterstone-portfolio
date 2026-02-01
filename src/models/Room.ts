import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRoom extends Document {
    slug: string;
    name: string;
    price: number;
    description: string;
    amenities: string[];
    heroImage: string;
    gallery: string[];
    isActive: boolean;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
}

const RoomSchema: Schema<IRoom> = new Schema(
    {
        slug: { 
            type: String, 
            required: true, 
            unique: true,
            lowercase: true,
            trim: true
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        description: { type: String, required: true },
        amenities: [{ type: String }],
        heroImage: { type: String, required: true },
        gallery: [{ type: String }],
        isActive: { type: Boolean, default: true },
        displayOrder: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries (slug already has unique: true which creates an index)
RoomSchema.index({ isActive: 1, displayOrder: 1 });

const Room: Model<IRoom> = mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);

export default Room;
