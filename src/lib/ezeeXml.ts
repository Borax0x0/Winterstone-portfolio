/**
 * Shared eZee XML parsing utilities.
 * Used by both the pull sync endpoint (/api/sync/ezee) and the
 * push webhook receiver (/api/webhooks/ezee).
 */

// Extract all content blocks between <tag>...</tag>
export function getXMLBlocks(xml: string, tag: string): string[] {
    const blocks: string[] = [];
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'g');
    let m: RegExpExecArray | null;
    while ((m = regex.exec(xml)) !== null) {
        blocks.push(m[1]);
    }
    return blocks;
}

// Extract a single value from an XML string
export function getXMLVal(xml: string, tag: string): string {
    const m = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)<\\/${tag}>`));
    return m ? m[1].trim() : '';
}

export interface ParsedBooking {
    externalBookingId: string;
    source: string;
    guestName: string;
    email: string;
    roomName: string;
    checkIn: string;
    checkOut: string;
    totalAmount: number;
    status: 'Confirmed' | 'Cancelled';
    paymentStatus: 'Paid';
}

export interface ParsedCancellation {
    uniqueId: string;
    remark: string;
}

/**
 * Parse a <BookByInfo> block into a booking data object.
 * Returns null if required fields (uniqueId, checkIn, checkOut) are missing.
 */
export function parseBookingFromXML(bookBy: string): ParsedBooking | null {
    const uniqueId = getXMLVal(bookBy, 'UniqueID');
    if (!uniqueId) return null;

    const bookingTrans = getXMLBlocks(bookBy, 'BookingTran');
    const bookingTran = bookingTrans[0] || '';

    const tranStatus = getXMLVal(bookingTran, 'Status'); // New, Modify, Cancel
    const isCancelled = tranStatus === 'Cancel' || tranStatus === 'Cancelled';

    const firstName = getXMLVal(bookBy, 'FirstName');
    const lastName = getXMLVal(bookBy, 'LastName');
    const guestName = [firstName, lastName].filter(Boolean).join(' ') || 'eZee Guest';

    const checkIn = getXMLVal(bookingTran, 'Start');
    const checkOut = getXMLVal(bookingTran, 'End');
    if (!checkIn || !checkOut) return null;

    return {
        externalBookingId: uniqueId,
        source: getXMLVal(bookBy, 'BookedBy') || 'eZee',
        guestName,
        email: getXMLVal(bookBy, 'Email') || 'noreply@ezee.com',
        roomName: getXMLVal(bookingTran, 'RoomTypeName') || 'Room',
        checkIn,
        checkOut,
        totalAmount: parseFloat(getXMLVal(bookingTran, 'TotalRate') || '0'),
        status: isCancelled ? 'Cancelled' : 'Confirmed',
        paymentStatus: 'Paid', // OTA bookings are pre-paid via channel
    };
}

/**
 * Parse a <CancelReservation> block into a cancellation object.
 * Returns null if UniqueID is missing.
 */
export function parseCancelFromXML(cancelBlock: string): ParsedCancellation | null {
    const uniqueId = getXMLVal(cancelBlock, 'UniqueID');
    if (!uniqueId) return null;
    return {
        uniqueId,
        remark: getXMLVal(cancelBlock, 'Remark'),
    };
}
