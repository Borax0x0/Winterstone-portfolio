import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';

/**
 * Razorpay Webhook Handler
 *
 * Handles: payment.captured, payment.failed, order.paid
 *
 * Setup in Razorpay Dashboard:
 * 1. Go to Account & Settings → Webhooks → Add New Webhook
 * 2. URL: https://thewinterstonestudio.com/api/webhooks/razorpay
 * 3. Secret: set RAZORPAY_WEBHOOK_SECRET in Vercel env vars (use a strong random string)
 * 4. Events: payment.captured, payment.failed, order.paid
 */

// Razorpay sends event payloads — define the shapes we care about
interface RazorpayPaymentEntity {
    id: string;
    order_id: string;
    status: string; // 'captured' | 'failed' | 'authorized'
    amount: number;
    currency: string;
    email?: string;
    error_description?: string;
}

interface RazorpayOrderEntity {
    id: string;
    receipt?: string; // We set this to bookingId when creating the order
    status: string;   // 'paid' | 'created'
}

interface RazorpayWebhookPayload {
    event: string;
    payload: {
        payment?: {
            entity: RazorpayPaymentEntity;
        };
        order?: {
            entity: RazorpayOrderEntity;
        };
    };
}

export async function POST(req: NextRequest) {
    // 1. Read raw body for signature verification (must be done before any parsing)
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    // 2. Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error('RAZORPAY_WEBHOOK_SECRET is not set');
        return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

    if (expectedSignature !== signature) {
        console.warn('Razorpay webhook signature mismatch');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // 3. Parse and handle the event
    let event: RazorpayWebhookPayload;
    try {
        event = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    console.log(`[Razorpay Webhook] Event received: ${event.event}`);

    try {
        await dbConnect();

        switch (event.event) {
            case 'payment.captured': {
                // Payment successfully captured — mark booking as Confirmed + Paid
                const payment = event.payload.payment?.entity;
                if (!payment) break;

                await Booking.findOneAndUpdate(
                    { razorpayOrderId: payment.order_id },
                    {
                        status: 'Confirmed',
                        paymentStatus: 'Paid',
                        razorpayPaymentId: payment.id,
                    }
                );
                console.log(`[Webhook] payment.captured: orderId=${payment.order_id}, paymentId=${payment.id}`);
                break;
            }

            case 'payment.failed': {
                // Payment failed — mark booking as Failed
                const payment = event.payload.payment?.entity;
                if (!payment) break;

                await Booking.findOneAndUpdate(
                    { razorpayOrderId: payment.order_id },
                    { paymentStatus: 'Failed' }
                );
                console.log(`[Webhook] payment.failed: orderId=${payment.order_id}, reason=${payment.error_description}`);
                break;
            }

            case 'order.paid': {
                // Order fully paid — extra safety net to confirm booking
                const order = event.payload.order?.entity;
                if (!order) break;

                // Only update if still Pending (avoid overwriting already-handled payment.captured)
                await Booking.findOneAndUpdate(
                    { razorpayOrderId: order.id, status: 'Pending' },
                    { status: 'Confirmed', paymentStatus: 'Paid' }
                );
                console.log(`[Webhook] order.paid: orderId=${order.id}`);
                break;
            }

            default:
                console.log(`[Webhook] Unhandled event: ${event.event}`);
        }

        return NextResponse.json({ received: true }, { status: 200 });

    } catch (error) {
        console.error('[Webhook] DB error:', error);
        // Return 200 anyway — Razorpay retries on non-2xx, we don't want retry loops
        return NextResponse.json({ received: true, error: 'DB update failed' }, { status: 200 });
    }
}
