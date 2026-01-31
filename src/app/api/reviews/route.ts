import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Review from '@/models/Review';

/**
 * GET /api/reviews
 * 
 * Fetches reviews for a specific room.
 * Query params:
 * - room: The roomSlug to filter by (required)
 * - all: If 'true', returns all reviews (for admin). Otherwise, only approved.
 * 
 * Example: /api/reviews?room=skyline-haven
 */
export async function GET(request: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const room = searchParams.get('room');
        const showAll = searchParams.get('all') === 'true';

        // Build query
        const query: any = {};

        if (room) {
            query.roomSlug = room.toLowerCase();
        }

        // Only show approved reviews for public requests
        if (!showAll) {
            query.approved = true;
        }

        const reviews = await Review.find(query)
            .sort({ createdAt: -1 })  // Newest first
            .select('-guestEmail')     // Don't expose emails publicly
            .lean();

        // Calculate average rating for the room
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        return NextResponse.json({
            reviews,
            count: reviews.length,
            averageRating: Math.round(avgRating * 10) / 10,  // Round to 1 decimal
        });

    } catch (error: any) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * POST /api/reviews
 * 
 * Submits a new review.
 * Body: { roomSlug, rating, comment, guestName, guestEmail }
 * 
 * Reviews are auto-published. Admin can delete inappropriate ones.
 */
export async function POST(request: Request) {
    try {
        await dbConnect();

        const body = await request.json();
        const { roomSlug, rating, comment, guestName, guestEmail } = body;

        // Validate required fields
        if (!roomSlug || !rating || !guestName || !guestEmail) {
            return NextResponse.json(
                { error: 'Room, rating, name, and email are required' },
                { status: 400 }
            );
        }

        // Validate rating range
        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: 'Rating must be between 1 and 5' },
                { status: 400 }
            );
        }

        // Create review (auto-published, admin can delete if inappropriate)
        const review = await Review.create({
            roomSlug: roomSlug.toLowerCase(),
            rating,
            comment: comment || '',
            guestName: guestName.trim(),
            guestEmail: guestEmail.toLowerCase(),
            approved: true,  // Auto-publish
        });

        return NextResponse.json({
            message: 'Thank you! Your review has been published.',
            reviewId: review._id,
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error submitting review:', error);
        return NextResponse.json(
            { error: 'Failed to submit review. Please try again.' },
            { status: 500 }
        );
    }
}
