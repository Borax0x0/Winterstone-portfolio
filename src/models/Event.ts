import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEvent extends Document {
    title: string;
    date: string; // Storing as ISO string YYYY-MM-DD
    desc: string;
    image: string;
    createdAt: Date;
    updatedAt: Date;
}

const EventSchema: Schema<IEvent> = new Schema(
    {
        title: { type: String, required: true },
        date: { type: String, required: true },
        desc: { type: String, required: true },
        image: { type: String, required: true },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

// Prevent overwriting model if already compiled (Next.js hot reload fix)
const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;
