/**
 * Test script for the eZee webhook receiver.
 * Run with: node scripts/test-ezee-webhook.mjs
 *
 * Tests:
 * 1. GET /api/webhooks/ezee — liveness check
 * 2. POST with a new booking — should create a DB record
 * 3. POST with a modify (same UniqueID) — should update the existing record
 * 4. POST with a CancelReservation block — should mark booking as Cancelled
 * 5. POST with empty/garbage body — should return 200 gracefully
 */

const BASE = 'http://localhost:3000';
const ENDPOINT = `${BASE}/api/webhooks/ezee`;

// Realistic eZee push payload — new booking (from docs sample, Autosync section)
const NEW_BOOKING_XML = `<?xml version="1.0" encoding="UTF-8"?>
<RES_Response>
  <Reservations>
    <Reservation>
      <BookByInfo>
        <LocationId>51097</LocationId>
        <UniqueID>TEST-9001</UniqueID>
        <BookedBy>Booking.com</BookedBy>
        <FirstName>Arjun</FirstName>
        <LastName>Mehta</LastName>
        <Email>arjun.mehta@test.com</Email>
        <BusinessSource>Booking.com</BusinessSource>
        <Source>Booking.com</Source>
        <IsChannelBooking>1</IsChannelBooking>
        <BookingTran>
          <SubBookingId>TEST-9001</SubBookingId>
          <TransactionId>5109700000000099</TransactionId>
          <Status>New</Status>
          <IsConfirmed>1</IsConfirmed>
          <VoucherNo>TEST9001/1</VoucherNo>
          <RoomTypeCode>5109700000000000002</RoomTypeCode>
          <RoomTypeName>Deluxe Room</RoomTypeName>
          <Start>2026-06-10</Start>
          <End>2026-06-13</End>
          <TotalRate>7797.00</TotalRate>
          <TotalAmountAfterTax>7797.00</TotalAmountAfterTax>
          <TotalAmountBeforeTax>6962.50</TotalAmountBeforeTax>
          <TotalTax>834.50</TotalTax>
          <TotalDiscount>0.00</TotalDiscount>
          <TotalExtraCharge>0.00</TotalExtraCharge>
          <TotalPayment>0.00</TotalPayment>
        </BookingTran>
      </BookByInfo>
    </Reservation>
  </Reservations>
  <Errors>
    <ErrorCode>0</ErrorCode>
    <ErrorMessage>Success</ErrorMessage>
  </Errors>
</RES_Response>`;

// Modify — same UniqueID, status changes to Modify, different dates
const MODIFY_BOOKING_XML = `<?xml version="1.0" encoding="UTF-8"?>
<RES_Response>
  <Reservations>
    <Reservation>
      <BookByInfo>
        <LocationId>51097</LocationId>
        <UniqueID>TEST-9001</UniqueID>
        <BookedBy>Booking.com</BookedBy>
        <FirstName>Arjun</FirstName>
        <LastName>Mehta</LastName>
        <Email>arjun.mehta@test.com</Email>
        <BusinessSource>Booking.com</BusinessSource>
        <Source>Booking.com</Source>
        <IsChannelBooking>1</IsChannelBooking>
        <BookingTran>
          <SubBookingId>TEST-9001</SubBookingId>
          <TransactionId>5109700000000099</TransactionId>
          <Status>Modify</Status>
          <IsConfirmed>1</IsConfirmed>
          <VoucherNo>TEST9001/1</VoucherNo>
          <RoomTypeCode>5109700000000000002</RoomTypeCode>
          <RoomTypeName>Deluxe Room</RoomTypeName>
          <Start>2026-06-12</Start>
          <End>2026-06-15</End>
          <TotalRate>7797.00</TotalRate>
          <TotalAmountAfterTax>7797.00</TotalAmountAfterTax>
          <TotalAmountBeforeTax>6962.50</TotalAmountBeforeTax>
          <TotalTax>834.50</TotalTax>
          <TotalDiscount>0.00</TotalDiscount>
          <TotalExtraCharge>0.00</TotalExtraCharge>
          <TotalPayment>0.00</TotalPayment>
        </BookingTran>
      </BookByInfo>
    </Reservation>
  </Reservations>
  <Errors>
    <ErrorCode>0</ErrorCode>
    <ErrorMessage>Success</ErrorMessage>
  </Errors>
</RES_Response>`;

// Cancel — CancelReservation block for same UniqueID
const CANCEL_XML = `<?xml version="1.0" encoding="UTF-8"?>
<RES_Response>
  <Reservations>
    <CancelReservation>
      <LocationId>51097</LocationId>
      <UniqueID>TEST-9001</UniqueID>
      <Remark>Cancel,Guest cancelled via Booking.com</Remark>
      <VoucherNo>TEST9001/1</VoucherNo>
    </CancelReservation>
  </Reservations>
  <Errors>
    <ErrorCode>0</ErrorCode>
    <ErrorMessage>Success</ErrorMessage>
  </Errors>
</RES_Response>`;

const GARBAGE_BODY = `not xml at all`;

function pass(msg) { console.log(`  ✅ ${msg}`); }
function fail(msg) { console.log(`  ❌ ${msg}`); }
function section(msg) { console.log(`\n── ${msg}`); }

async function runTests() {
    console.log('eZee Webhook Test Suite');
    console.log('========================\n');

    // ── Test 1: GET liveness check
    section('Test 1: GET liveness');
    try {
        const res = await fetch(ENDPOINT, { method: 'GET' });
        const text = await res.text();
        if (res.status === 200 && text.includes('active')) {
            pass(`Status 200, body contains "active"`);
        } else {
            fail(`Status ${res.status}, body: ${text.slice(0, 200)}`);
        }
    } catch (e) {
        fail(`Request failed: ${e.message}`);
    }

    // ── Test 2: POST new booking
    section('Test 2: POST new booking (UniqueID: TEST-9001)');
    try {
        const res = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/xml' },
            body: NEW_BOOKING_XML,
        });
        const text = await res.text();
        if (res.status === 200 && text.includes('TEST-9001') && text.includes('Success')) {
            pass(`Status 200, response contains BookingId TEST-9001`);
            pass(`Response XML: ${text.replace(/\s+/g, ' ').trim().slice(0, 300)}`);
        } else {
            fail(`Status ${res.status}, body: ${text.slice(0, 300)}`);
        }
    } catch (e) {
        fail(`Request failed: ${e.message}`);
    }

    // ── Test 3: POST modify (same UniqueID, different dates)
    section('Test 3: POST modify (same UniqueID, dates should update)');
    try {
        const res = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/xml' },
            body: MODIFY_BOOKING_XML,
        });
        const text = await res.text();
        if (res.status === 200 && text.includes('TEST-9001')) {
            pass(`Status 200, modify accepted`);
        } else {
            fail(`Status ${res.status}, body: ${text.slice(0, 300)}`);
        }
    } catch (e) {
        fail(`Request failed: ${e.message}`);
    }

    // ── Test 4: POST CancelReservation
    section('Test 4: POST CancelReservation (should mark Cancelled)');
    try {
        const res = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/xml' },
            body: CANCEL_XML,
        });
        const text = await res.text();
        if (res.status === 200 && text.includes('TEST-9001')) {
            pass(`Status 200, cancel accepted`);
        } else {
            fail(`Status ${res.status}, body: ${text.slice(0, 300)}`);
        }
    } catch (e) {
        fail(`Request failed: ${e.message}`);
    }

    // ── Test 5: Garbage body — should not crash
    section('Test 5: Garbage body (should return 200, not crash)');
    try {
        const res = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/xml' },
            body: GARBAGE_BODY,
        });
        if (res.status === 200) {
            pass(`Status 200 — graceful no-op`);
        } else {
            fail(`Status ${res.status} — should have been 200`);
        }
    } catch (e) {
        fail(`Request failed: ${e.message}`);
    }

    console.log('\n========================');
    console.log('Done. Check /admin/bookings to verify TEST-9001 record state.');
    console.log('(It should be Cancelled after Test 4 ran)');
}

runTests();
