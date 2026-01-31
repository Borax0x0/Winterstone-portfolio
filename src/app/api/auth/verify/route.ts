import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(request: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({ error: 'missing_token' }, { status: 400 });
        }

        // Find user with this token
        const user = await User.findOne({
            verificationToken: token,
            tokenExpiry: { $gt: new Date() } // Token not expired
        });

        if (!user) {
            return NextResponse.json({ error: 'invalid_or_expired_token' }, { status: 400 });
        }

        // Mark email as verified
        user.emailVerified = true;
        user.verificationToken = undefined;
        user.tokenExpiry = undefined;
        await user.save();

        // Return success JSON
        return NextResponse.json({ verified: true, email: user.email });

    } catch (error: any) {
        console.error('Verification error:', error);
        return NextResponse.json({ error: 'verification_failed' }, { status: 500 });
    }
}
