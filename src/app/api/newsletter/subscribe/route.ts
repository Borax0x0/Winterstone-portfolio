import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subscriber from '@/models/Subscriber';

/**
 * POST /api/newsletter/subscribe
 * 
 * Handles newsletter subscription.
 * - Validates email format
 * - Checks for duplicates (returns success anyway - no need to tell user they're already subscribed)
 * - Saves to database
 */
export async function POST(request: Request) {
    try {
        // Step 1: Connect to database
        await dbConnect();

        // Step 2: Parse the request body
        const { email } = await request.json();

        // Step 3: Validate email
        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Simple email format validation using regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Please enter a valid email address' },
                { status: 400 }
            );
        }

        // Step 4: Check if already subscribed
        const existing = await Subscriber.findOne({ email: email.toLowerCase() });

        if (existing) {
            // Don't reveal that email exists (privacy)
            // Just return success - they're already subscribed anyway
            return NextResponse.json({
                message: "You're subscribed! Thanks for joining.",
                alreadySubscribed: true,
            });
        }

        // Step 5: Create new subscriber
        await Subscriber.create({
            email: email.toLowerCase(),
            active: true,
        });

        // Step 6: Return success
        return NextResponse.json({
            message: "You're subscribed! Thanks for joining.",
            alreadySubscribed: false,
        }, { status: 201 });

    } catch (error: unknown) {
        console.error('Newsletter subscription error:', error);

        // Handle MongoDB duplicate key error (race condition)
        if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
            return NextResponse.json({
                message: "You're subscribed! Thanks for joining.",
                alreadySubscribed: true,
            });
        }

        return NextResponse.json(
            { error: 'Subscription failed. Please try again.' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/newsletter/subscribe
 * 
 * Returns subscriber count (for admin dashboard)
 */
export async function GET() {
    try {
        await dbConnect();
        const count = await Subscriber.countDocuments({ active: true });
        return NextResponse.json({ subscriberCount: count });
    } catch {
        return NextResponse.json({ error: 'Failed to get count' }, { status: 500 });
    }
}
