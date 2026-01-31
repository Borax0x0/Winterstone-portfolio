import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Review Model
 * 
 * Stores guest reviews for rooms.
 * 
 * Design decisions:
 * - approved defaults to false: Reviews go through moderation before appearing
 * - roomSlug: Links to room pages (e.g., "skyline-haven", "cedar-retreat")
 * - rating: 1-5 stars, required
 * - comment: Optional text review
 */

export interface IReview extends Document {
    roomSlug: string;
    rating: number;  // 1-5
    comment: string;
    guestName: string;
    guestEmail: string;
    approved: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ReviewSchema: Schema<IReview> = new Schema(
    {
        roomSlug: {
            type: String,
            required: true,
            lowercase: true,
            index: true,  // Index for faster queries by room
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            default: '',
            maxlength: 1000,  // Prevent essay-length reviews
        },
        guestName: {
            type: String,
            required: true,
            trim: true,
        },
        guestEmail: {
            type: String,
            required: true,
            lowercase: true,
        },
        approved: {
            type: Boolean,
            default: false,  // Requires admin approval to display
        },
    },
    {
        timestamps: true,
    }
);

// Export with Next.js hot-reload protection
const Review: Model<IReview> =
    mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
