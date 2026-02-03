import mongoose, { Schema, Document } from 'mongoose';

export interface IRoomUnit extends Document {
    name: string;          // e.g. "Skyline 101"
    roomTypeSlug: string;  // e.g. "skyline-haven"
    features: string[];    // e.g. ["Corner View", "Bathtub"]
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const RoomUnitSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        roomTypeSlug: { type: String, required: true, index: true },
        features: { type: [String], default: [] },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

// Prevent model recompilation in dev
export default mongoose.models.RoomUnit || mongoose.model<IRoomUnit>('RoomUnit', RoomUnitSchema);
