
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            bookingId,
            mock // From our mock implementation
        } = await request.json();

        if (mock) {
            // If this was a mock transaction, just approve it
            const booking = await Booking.findByIdAndUpdate(bookingId, {
                status: 'Confirmed',
                paymentStatus: 'Paid',
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: 'mock_payment_id',
            }, { new: true });

            return NextResponse.json({ message: "Payment verified (Mock)", success: true });
        }

        const key_secret = process.env.RAZORPAY_KEY_SECRET;
        if (!key_secret) {
            return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", key_secret)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Update database
            await Booking.findByIdAndUpdate(bookingId, {
                status: 'Confirmed',
                paymentStatus: 'Paid',
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
            });

            return NextResponse.json({ message: "Payment verified", success: true });
        } else {
            // Update database to Failed
            await Booking.findByIdAndUpdate(bookingId, {
                paymentStatus: 'Failed',
            });
            return NextResponse.json({ message: "Invalid signature", success: false }, { status: 400 });
        }

    } catch (error: any) {
        console.error("Payment Verification Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
