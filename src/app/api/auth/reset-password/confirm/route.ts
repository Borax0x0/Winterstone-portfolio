import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { hashPassword } from '@/lib/password';

/**
 * POST /api/auth/reset-password/confirm
 * 
 * Confirm password reset with token and new password.
 */
export async function POST(request: Request) {
    try {
        await dbConnect();

        const { token, password } = await request.json();

        if (!token) {
            return NextResponse.json(
                { error: 'Reset token is required' },
                { status: 400 }
            );
        }

        if (!password || password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Find user with valid token
        const user = await User.findOne({
            verificationToken: token,
            tokenExpiry: { $gt: new Date() }, // Token not expired
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid or expired reset link' },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedPassword = await hashPassword(password);

        // Update password and clear token
        user.password = hashedPassword;
        user.verificationToken = undefined;
        user.tokenExpiry = undefined;
        await user.save();

        return NextResponse.json({
            message: 'Password reset successful. You can now log in.',
        });

    } catch (error: any) {
        console.error('Password reset confirm error:', error);
        return NextResponse.json(
            { error: 'Failed to reset password' },
            { status: 500 }
        );
    }
}
