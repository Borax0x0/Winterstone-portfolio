import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Newsletter Subscriber Model
 * 
 * Simple model to store email subscriptions.
 * We store:
 * - email: The subscriber's email (unique to prevent duplicates)
 * - subscribedAt: When they subscribed (auto-set by timestamps)
 * - active: Whether they're still subscribed (for future unsubscribe feature)
 */

export interface ISubscriber extends Document {
    email: string;
    active: boolean;
    createdAt: Date;
}

const SubscriberSchema: Schema<ISubscriber> = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,        // Prevents same email subscribing twice
            lowercase: true,     // Normalizes "John@Email.com" to "john@email.com"
            trim: true,          // Removes whitespace
        },
        active: {
            type: Boolean,
            default: true,       // For future unsubscribe feature
        },
    },
    {
        timestamps: true,        // Adds createdAt and updatedAt automatically
    }
);

// Export the model (with hot-reload protection for Next.js dev mode)
const Subscriber: Model<ISubscriber> =
    mongoose.models.Subscriber || mongoose.model<ISubscriber>('Subscriber', SubscriberSchema);

export default Subscriber;
