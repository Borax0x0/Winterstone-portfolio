import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
    checkInTime: string;
    checkOutTime: string;
    specialRequestOptions: string[];
    updatedAt: Date;
}

const SettingsSchema: Schema = new Schema(
    {
        checkInTime: {
            type: String,
            default: "14:00", // 2:00 PM
        },
        checkOutTime: {
            type: String,
            default: "11:00", // 11:00 AM
        },
        specialRequestOptions: {
            type: [String],
            default: ["Extra Bed", "Late Check-out", "Early Check-in", "Airport Pickup"],
        },
    },
    { timestamps: true }
);

// Prevent model recompilation in dev
export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
