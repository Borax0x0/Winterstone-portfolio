import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { v4 as uuidv4 } from 'uuid';
import { sendPasswordResetEmail } from '@/lib/email';

/**
 * POST /api/auth/reset-password
 * 
 * Request a password reset. Generates a reset token and stores it.
 * In dev: logs the reset URL. In prod: would send email.
 */
export async function POST(request: Request) {
    try {
        await dbConnect();

        const { email } = await request.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { error: 'Valid email is required' },
                { status: 400 }
            );
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });

        // Don't reveal if user exists or not (security)
        if (!user) {
            return NextResponse.json({
                message: 'If an account exists with this email, you will receive a reset link.',
            });
        }

        // Generate reset token (reusing verificationToken field)
        const resetToken = uuidv4();
        const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        user.verificationToken = resetToken;
        user.tokenExpiry = tokenExpiry;
        await user.save();

        // Build reset URL
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

        // Send password reset email
        const emailSent = await sendPasswordResetEmail(user.email, user.name, resetUrl);

        // Log URL in dev for debugging
        console.log('=================================');
        console.log('PASSWORD RESET LINK:', resetUrl);
        console.log('Email sent:', emailSent ? 'YES' : 'NO');
        console.log('=================================');

        return NextResponse.json({
            message: emailSent 
                ? 'If an account exists with this email, you will receive a reset link.'
                : 'Password reset requested. Check console for link (email service unavailable).',
        });

    } catch (error: unknown) {
        console.error('Password reset error:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}
