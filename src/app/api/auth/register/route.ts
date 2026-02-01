import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/password';
import { v4 as uuidv4 } from 'uuid';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendVerificationEmail } from '@/lib/email';


export async function POST(request: Request) {
    try {
        await dbConnect();
        const { email, password, name } = await request.json();

        // Validation
        if (!email || !password || !name) {
            return NextResponse.json(
                { error: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json(
                { error: 'An account with this email already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Generate verification token (valid for 24 hours)
        const verificationToken = uuidv4();
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // Create user
        const user = await User.create({
            email: email.toLowerCase(),
            password: hashedPassword,
            name,
            role: 'guest',
            emailVerified: false,
            verificationToken,
            tokenExpiry,
        });

        // Build verification URL
        const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify?token=${verificationToken}`;

        // Send verification email
        const emailSent = await sendVerificationEmail(email, name, verificationUrl);

        // Log URL in dev for debugging
        console.log('=================================');
        console.log('VERIFICATION URL:', verificationUrl);
        console.log('Email sent:', emailSent ? 'YES' : 'NO');
        console.log('=================================');

        return NextResponse.json({
            message: emailSent
                ? 'Account created! Check your email to verify your account.'
                : 'Account created! Check your console for verification link (email service unavailable).',
            userId: user._id,
        }, { status: 201 });

    } catch (error: unknown) {
        console.error('Registration error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Registration failed';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
