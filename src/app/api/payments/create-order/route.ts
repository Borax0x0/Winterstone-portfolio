
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
    try {
        const { amount, bookingId, currency = "INR" } = await request.json();

        if (!bookingId || !amount) {
            return NextResponse.json({ error: "Booking ID and Amount are required" }, { status: 400 });
        }

        const key_id = process.env.RAZORPAY_KEY_ID;
        const key_secret = process.env.RAZORPAY_KEY_SECRET;

        // Graceful handling for missing keys (Test Mode)
        if (!key_id || !key_secret) {
            console.warn("Razorpay keys missing. Returning mock order for testing.");
            return NextResponse.json({
                id: "order_mock_" + Math.random().toString(36).substring(7),
                currency: currency,
                amount: amount * 100, // Amount in paise
                status: "created",
                mock: true // Frontend can use this to skip real Razorpay
            });
        }

        const instance = new Razorpay({
            key_id: key_id,
            key_secret: key_secret,
        });

        const options = {
            amount: Math.round(amount * 100), // convert to smallest currency unit
            currency: currency,
            receipt: bookingId,
        };

        const order = await instance.orders.create(options);

        // Optional: specific logic to save order ID to booking immediately if desired
        // but we usually do it after payment success or just pass it to frontend

        return NextResponse.json(order);
    } catch (error: unknown) {
        console.error("Razorpay Order Creation Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Something went wrong";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
