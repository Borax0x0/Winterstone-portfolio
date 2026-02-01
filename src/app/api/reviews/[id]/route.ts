import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Review from '@/models/Review';

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
        if (!session?.user || !['admin', 'superadmin'].includes((session.user as any).role)) {
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

    } catch (error: any) {
        console.error('Error updating review:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
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
        if (!session?.user || !['admin', 'superadmin'].includes((session.user as any).role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { id } = await params;
        const review = await Review.findByIdAndDelete(id);

        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Review deleted' });

    } catch (error: any) {
        console.error('Error deleting review:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
