import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Review from '@/models/Review';

interface SessionUser {
    email?: string | null;
    role?: string;
}

/**
 * PATCH /api/reviews/[id]
 * 
 * Updates a review (for admin moderation).
 * Body: { approved: boolean }
 */
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Auth check - admin only
        const session = await auth();
        const userRole = (session?.user as SessionUser | undefined)?.role;
        if (!session?.user || !userRole || !['admin', 'superadmin'].includes(userRole)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { id } = await params;
        const body = await request.json();

        const review = await Review.findByIdAndUpdate(
            id,
            { approved: body.approved },
            { new: true }
        );

        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: body.approved ? 'Review approved' : 'Review rejected',
            review,
        });

    } catch (error: unknown) {
        console.error('Error updating review:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to update review';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

/**
 * DELETE /api/reviews/[id]
 * 
 * Permanently deletes a review. Admin only.
 */
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Auth check - admin only
        const session = await auth();
        const userRole = (session?.user as SessionUser | undefined)?.role;
        if (!session?.user || !userRole || !['admin', 'superadmin'].includes(userRole)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { id } = await params;
        const review = await Review.findByIdAndDelete(id);

        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Review deleted' });

    } catch (error: unknown) {
        console.error('Error deleting review:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete review';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
