import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import { getXMLBlocks, parseBookingFromXML } from '@/lib/ezeeXml';

interface SessionUser { role?: string; }

// Build the XML request body for eZee
function buildXMLRequest(fromDate: string, toDate: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?><RES_Request><Request_Type>Booking</Request_Type><Authentication><HotelCode>${process.env.EZEE_HOTEL_CODE}</HotelCode><AuthCode>${process.env.EZEE_AUTH_CODE}</AuthCode></Authentication><FromDate>${fromDate}</FromDate><ToDate>${toDate}</ToDate></RES_Request>`;
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
                        const parsed = parseBookingFromXML(bookBy);
                        if (!parsed) continue;

                        const existing = await Booking.findOne({ externalBookingId: parsed.externalBookingId });

                        if (existing) {
                            await Booking.findByIdAndUpdate(existing._id, parsed);
                            if (parsed.status === 'Cancelled') cancelledCount++;
                            else updatedCount++;
                        } else {
                            await Booking.create(parsed);
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
