import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import {
    getXMLBlocks,
    getXMLVal,
    parseBookingFromXML,
    parseCancelFromXML,
} from '@/lib/ezeeXml';

/**
 * eZee Push Webhook Receiver
 *
 * eZee calls this endpoint every ~5 minutes with booking updates (new/modify/cancel).
 * The payload is XML in the same format as the Booking pull response from getdataAPI.php.
 * CancelReservation blocks appear alongside Reservation blocks in the same payload.
 *
 * After processing, we respond with the documented XML acknowledgement format.
 * No auth required — eZee hits this unauthenticated (same as Razorpay webhook).
 *
 * Docs: https://api.ezeetechnosys.com/#1533 (Autosync Future Bookings)
 */
export async function POST(req: NextRequest) {
    let xmlText = '';

    try {
        xmlText = await req.text();
    } catch {
        return new NextResponse(
            `<?xml version="1.0" encoding="UTF-8"?><RES_Response><Errors><ErrorCode>400</ErrorCode><ErrorMessage>Could not read request body</ErrorMessage></Errors></RES_Response>`,
            { status: 400, headers: { 'Content-Type': 'application/xml' } }
        );
    }

    console.log('[eZee Webhook] Received push payload:\n', xmlText);

    // Basic sanity check — reject empty or clearly invalid payloads
    if (!xmlText || (!xmlText.includes('<Reservation') && !xmlText.includes('<CancelReservation'))) {
        console.warn('[eZee Webhook] Empty or unrecognised payload, ignoring.');
        // Return 200 so eZee doesn't keep retrying a malformed request
        return new NextResponse(
            `<?xml version="1.0" encoding="UTF-8"?><RES_Response><Errors><ErrorCode>0</ErrorCode><ErrorMessage>No bookings found in payload</ErrorMessage></Errors></RES_Response>`,
            { status: 200, headers: { 'Content-Type': 'application/xml' } }
        );
    }

    try {
        await dbConnect();

        const processedBookings: Array<{ BookingId: string; PMS_BookingId: string }> = [];
        let newCount = 0, updatedCount = 0, cancelledCount = 0;

        // --- Process <Reservation> blocks (new/modify) ---
        const reservationBlocks = getXMLBlocks(xmlText, 'Reservation');

        for (const resBlock of reservationBlocks) {
            const bookByBlocks = getXMLBlocks(resBlock, 'BookByInfo');

            for (const bookBy of bookByBlocks) {
                const parsed = parseBookingFromXML(bookBy);
                if (!parsed) continue;

                const existing = await Booking.findOne({ externalBookingId: parsed.externalBookingId });

                if (existing) {
                    await Booking.findByIdAndUpdate(existing._id, parsed);
                    processedBookings.push({
                        BookingId: parsed.externalBookingId,
                        PMS_BookingId: existing._id.toString(),
                    });
                    if (parsed.status === 'Cancelled') cancelledCount++;
                    else updatedCount++;
                } else {
                    const created = await Booking.create(parsed);
                    processedBookings.push({
                        BookingId: parsed.externalBookingId,
                        PMS_BookingId: created._id.toString(),
                    });
                    newCount++;
                }
            }
        }

        // --- Process <CancelReservation> blocks ---
        const cancelBlocks = getXMLBlocks(xmlText, 'CancelReservation');

        for (const cancelBlock of cancelBlocks) {
            const parsed = parseCancelFromXML(cancelBlock);
            if (!parsed) continue;

            const existing = await Booking.findOne({ externalBookingId: parsed.uniqueId });

            if (existing) {
                await Booking.findByIdAndUpdate(existing._id, { status: 'Cancelled' });
                processedBookings.push({
                    BookingId: parsed.uniqueId,
                    PMS_BookingId: existing._id.toString(),
                });
                cancelledCount++;
            } else {
                // Cancellation for a booking we don't have — create a cancelled record
                const created = await Booking.create({
                    externalBookingId: parsed.uniqueId,
                    source: 'eZee',
                    guestName: 'eZee Guest',
                    email: 'noreply@ezee.com',
                    roomName: 'Room',
                    checkIn: new Date().toISOString().split('T')[0],
                    checkOut: new Date().toISOString().split('T')[0],
                    totalAmount: 0,
                    status: 'Cancelled',
                    paymentStatus: 'Paid',
                });
                processedBookings.push({
                    BookingId: parsed.uniqueId,
                    PMS_BookingId: created._id.toString(),
                });
                cancelledCount++;
            }
        }

        console.log(`[eZee Webhook] Done: ${newCount} new, ${updatedCount} updated, ${cancelledCount} cancelled`);

        // Build the documented XML acknowledgement response
        const bookingXml = processedBookings
            .map(
                (b) =>
                    `<Booking><BookingId>${b.BookingId}</BookingId><PMS_BookingId>${b.PMS_BookingId}</PMS_BookingId></Booking>`
            )
            .join('');

        const responseXml = `<?xml version="1.0" encoding="UTF-8"?><RES_Response><Success>${bookingXml}</Success><Errors><ErrorCode>0</ErrorCode><ErrorMessage>Success</ErrorMessage></Errors></RES_Response>`;

        return new NextResponse(responseXml, {
            status: 200,
            headers: { 'Content-Type': 'application/xml' },
        });

    } catch (error) {
        console.error('[eZee Webhook] DB error:', error);
        // Return 200 to prevent eZee from hammering the endpoint on transient DB errors
        return new NextResponse(
            `<?xml version="1.0" encoding="UTF-8"?><RES_Response><Errors><ErrorCode>500</ErrorCode><ErrorMessage>Internal error</ErrorMessage></Errors></RES_Response>`,
            { status: 200, headers: { 'Content-Type': 'application/xml' } }
        );
    }
}

// eZee occasionally sends GET requests to verify the endpoint is alive
export async function GET() {
    return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?><RES_Response><Errors><ErrorCode>0</ErrorCode><ErrorMessage>Winterstone eZee webhook active</ErrorMessage></Errors></RES_Response>`,
        { status: 200, headers: { 'Content-Type': 'application/xml' } }
    );
}
