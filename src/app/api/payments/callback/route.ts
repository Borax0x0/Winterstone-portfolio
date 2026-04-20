import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const razorpay_order_id = formData.get('razorpay_order_id') as string;
        const razorpay_payment_id = formData.get('razorpay_payment_id') as string;
        const razorpay_signature = formData.get('razorpay_signature') as string;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.redirect(new URL('/book?payment=failed', request.url));
        }

        const key_secret = process.env.RAZORPAY_KEY_SECRET;
        if (!key_secret) {
            console.error("Server Configuration Error: Missing RAZORPAY_KEY_SECRET");
            return NextResponse.redirect(new URL('/book?payment=error', request.url));
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", key_secret)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        await dbConnect();

        if (isAuthentic) {
            // Update database just in case the webhook hasn't processed it yet
            await Booking.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                {
                    status: 'Confirmed',
                    paymentStatus: 'Paid',
                    razorpayPaymentId: razorpay_payment_id,
                }
            );

            // Redirect back to the booking page with success flag
            // (We pass orderId so the frontend can potentially fetch booking details)
            return NextResponse.redirect(new URL(`/book?payment=success&orderId=${razorpay_order_id}`, request.url));
        } else {
            await Booking.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                { paymentStatus: 'Failed' }
            );
            return NextResponse.redirect(new URL('/book?payment=failed', request.url));
        }

    } catch (error) {
        console.error("Payment Callback Error:", error);
        return NextResponse.redirect(new URL('/book?payment=error', request.url));
    }
}
