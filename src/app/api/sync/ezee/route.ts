import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';

interface SessionUser { role?: string; }

// Build the XML request body for eZee
function buildXMLRequest(fromDate: string, toDate: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?><RES_Request><Request_Type>Booking</Request_Type><Authentication><HotelCode>${process.env.EZEE_HOTEL_CODE}</HotelCode><AuthCode>${process.env.EZEE_AUTH_CODE}</AuthCode></Authentication><FromDate>${fromDate}</FromDate><ToDate>${toDate}</ToDate></RES_Request>`;
}

// Extract all blocks between <tag>...</tag> (handles nested content)
function getXMLBlocks(xml: string, tag: string): string[] {
    const blocks: string[] = [];
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'g');
    let m: RegExpExecArray | null;
    while ((m = regex.exec(xml)) !== null) {
        blocks.push(m[1]);
    }
    return blocks;
}

// Extract a single value from an XML string
function getXMLVal(xml: string, tag: string): string {
    const m = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)<\\/${tag}>`));
    return m ? m[1].trim() : '';
}

function formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
}

// Request the full date range in one chunk to avoid 'Duplicate request' rate limits
function buildDateRanges(daysBack: number, daysFwd: number): { from: string; to: string }[] {
    const start = new Date();
    start.setDate(start.getDate() - daysBack);
    const end = new Date();
    end.setDate(end.getDate() + daysFwd);

    return [{ from: formatDate(start), to: formatDate(end) }];
}

export async function POST() {
    try {
        const session = await auth();
        const userRole = (session?.user as SessionUser | undefined)?.role;
        if (!['admin', 'superadmin'].includes(userRole || '')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const apiUrl = process.env.EZEE_API_URL;
        const authCode = process.env.EZEE_AUTH_CODE;
        const hotelCode = process.env.EZEE_HOTEL_CODE;

        if (!apiUrl || !authCode || !hotelCode) {
            return NextResponse.json({ error: 'eZee credentials not configured in environment' }, { status: 503 });
        }

        await dbConnect();

        // Sync: past 7 days + next 30 days (catches recent OTA bookings + upcoming)
        const ranges = buildDateRanges(7, 30);
        let newCount = 0, updatedCount = 0, cancelledCount = 0, errorCount = 0;

        for (const { from, to } of ranges) {
            try {
                const res = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/xml',
                        'User-Agent': 'openAPI-WinterstoneLodge',
                    },
                    body: buildXMLRequest(from, to),
                });

                const xmlText = await res.text();

                // --- DEBUG LOGGING ---
                console.log(`\n\n--- eZee XML Response for range ${from}–${to} ---`);
                console.log(xmlText);
                console.log(`-------------------------------------------\n\n`);

                // Skip if error or empty response
                if (!xmlText || xmlText.includes('<status>error</status>') || !xmlText.includes('<Reservation')) {
                    continue;
                }

                const reservationBlocks = getXMLBlocks(xmlText, 'Reservation');

                for (const resBlock of reservationBlocks) {
                    const bookByBlocks = getXMLBlocks(resBlock, 'BookByInfo');

                    for (const bookBy of bookByBlocks) {
                        const uniqueId = getXMLVal(bookBy, 'UniqueID');
                        if (!uniqueId) continue;

                        const bookingTrans = getXMLBlocks(bookBy, 'BookingTran');
                        const bookingTran = bookingTrans[0] || '';

                        const tranStatus = getXMLVal(bookingTran, 'Status'); // New, Modify, Cancel
                        const isCancelled = tranStatus === 'Cancel' || tranStatus === 'Cancelled';

                        const firstName = getXMLVal(bookBy, 'FirstName');
                        const lastName = getXMLVal(bookBy, 'LastName');
                        const guestName = [firstName, lastName].filter(Boolean).join(' ') || 'eZee Guest';

                        const checkIn = getXMLVal(bookingTran, 'Start');
                        const checkOut = getXMLVal(bookingTran, 'End');
                        if (!checkIn || !checkOut) continue;

                        const bookingData = {
                            externalBookingId: uniqueId,
                            source: getXMLVal(bookBy, 'BookedBy') || 'eZee',
                            guestName,
                            email: getXMLVal(bookBy, 'Email') || 'noreply@ezee.com',
                            roomName: getXMLVal(bookingTran, 'RoomTypeName') || 'Room',
                            checkIn,
                            checkOut,
                            totalAmount: parseFloat(getXMLVal(bookingTran, 'TotalRate') || '0'),
                            status: isCancelled ? 'Cancelled' as const : 'Confirmed' as const,
                            paymentStatus: 'Paid' as const, // OTA bookings are pre-paid via channel
                        };

                        const existing = await Booking.findOne({ externalBookingId: uniqueId });

                        if (existing) {
                            await Booking.findByIdAndUpdate(existing._id, bookingData);
                            if (isCancelled) cancelledCount++;
                            else updatedCount++;
                        } else {
                            await Booking.create(bookingData);
                            newCount++;
                        }
                    }
                }
            } catch (rangeError) {
                console.error(`eZee sync error for range ${from}–${to}:`, rangeError);
                errorCount++;
            }
        }

        return NextResponse.json({
            success: true,
            synced: { new: newCount, updated: updatedCount, cancelled: cancelledCount, errors: errorCount },
            message: `Sync complete: ${newCount} new, ${updatedCount} updated, ${cancelledCount} cancelled`,
        });

    } catch (error) {
        console.error('eZee sync failed:', error);
        return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
    }
}
