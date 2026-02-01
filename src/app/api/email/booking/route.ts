import { NextResponse } from 'next/server';
import { sendBookingConfirmationEmail } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const params = await request.json();

        // Validate required fields
        const required = ['user_email', 'user_name', 'booking_id', 'room_name', 'check_in', 'check_out', 'total_price'];
        for (const field of required) {
            if (!params[field]) {
                return NextResponse.json(
                    { error: `Missing required field: ${field}` },
                    { status: 400 }
                );
            }
        }

        const success = await sendBookingConfirmationEmail(params);

        if (success) {
            return NextResponse.json({ message: 'Booking confirmation email sent' });
        } else {
            return NextResponse.json(
                { error: 'Failed to send email' },
                { status: 500 }
            );
        }
    } catch (error: unknown) {
        console.error('Booking email error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to send email';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
