import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { v4 as uuidv4 } from 'uuid';
import { sendVerificationEmail } from '@/lib/email';


/**
 * GET /api/auth/check-verification
 * Check if a user's email is verified
 * 
 * POST /api/auth/check-verification
 * Resend verification email
 */

export async function GET(request: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            verified: user.emailVerified,
            email: user.email,
        });

    } catch (error: any) {
        console.error('Check verification error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();

        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.emailVerified) {
            return NextResponse.json({
                message: 'Email is already verified',
                verified: true,
            });
        }

        // Generate new verification token
        const verificationToken = uuidv4();
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        user.verificationToken = verificationToken;
        user.tokenExpiry = tokenExpiry;
        await user.save();

        // Build verification URL
        const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify?token=${verificationToken}`;

        // Send real email
        const emailSent = await sendVerificationEmail(user.email, user.name, verifyUrl);

        // Log URL in dev for debugging
        console.log('=================================');
        console.log('EMAIL VERIFICATION LINK:', verifyUrl);
        console.log('Email sent:', emailSent ? 'YES' : 'NO');
        console.log('=================================');

        return NextResponse.json({
            message: emailSent
                ? 'Verification email sent! Check your inbox.'
                : 'Email service unavailable. Check console for link.',
        });

    } catch (error: any) {
        console.error('Resend verification error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
