import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

interface SessionUser {
    email?: string | null;
    role?: string;
}

/**
 * GET /api/users
 * List all users (superadmin only)
 */
export async function GET() {
    try {
        const session = await auth();
        const userRole = (session?.user as SessionUser | undefined)?.role;

        if (!session || userRole !== 'superadmin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await dbConnect();

        const users = await User.find({})
            .select('-password -verificationToken -tokenExpiry')
            .sort({ createdAt: -1 });

        return NextResponse.json({ users });

    } catch (error: unknown) {
        console.error('Get users error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to get users';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

/**
 * PATCH /api/users
 * Update user role (superadmin only)
 */
export async function PATCH(request: Request) {
    try {
        const session = await auth();
        const userRole = (session?.user as SessionUser | undefined)?.role;

        if (!session || userRole !== 'superadmin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { userId, role } = await request.json();

        if (!userId || !role) {
            return NextResponse.json({ error: 'userId and role required' }, { status: 400 });
        }

        if (!['guest', 'admin', 'superadmin'].includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        await dbConnect();

        // Prevent demoting yourself
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.email === session.user?.email && role !== 'superadmin') {
            return NextResponse.json({ error: 'Cannot demote yourself' }, { status: 400 });
        }

        user.role = role;
        await user.save();

        return NextResponse.json({
            message: `User role updated to ${role}`,
            user: { id: user._id, email: user.email, role: user.role },
        });

    } catch (error: unknown) {
        console.error('Update user error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

/**
 * DELETE /api/users
 * Delete user (superadmin only)
 */
export async function DELETE(request: Request) {
    try {
        const session = await auth();
        const userRole = (session?.user as SessionUser | undefined)?.role;

        if (!session || userRole !== 'superadmin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('id');

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Prevent deleting yourself
        if (user.email === session.user?.email) {
            return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
        }

        await User.findByIdAndDelete(userId);

        return NextResponse.json({ message: 'User deleted' });

    } catch (error: unknown) {
        console.error('Delete user error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
