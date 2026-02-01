"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ArrowLeft, Calendar, User, Check, Phone, Mail, Loader2, CreditCard } from "lucide-react";
// Email sent via API route (server-side)
// PaymentModal removed - logic is handled inline
import InvoiceModal from "@/components/InvoiceModal";
import { useBookings } from "@/context/BookingContext"; // Import Context

const ROOMS = [
  { id: "skyline-haven", name: "Skyline Haven", price: 8500, image: "/skyline-main.jpg" },
  { id: "zen-nest", name: "Zen Nest", price: 6500, image: "/zen-main.jpg" },
  { id: "sunlit-studio", name: "Sunlit Studio", price: 7200, image: "/sunlit-main.jpg" },
];

// Razorpay response interfaces
interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayFailedResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
  };
}

interface PaymentDetails extends RazorpayPaymentResponse {
  mock: boolean;
}

// Invoice data interface
interface InvoiceData {
  id: string;
  roomName: string;
  guestName: string;
  email: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  basePrice: number;
  taxes: number;
  grandTotal: number;
}

function BookingContent() {
  const searchParams = useSearchParams();
  const { initiatePayment } = useBookings(); // Use Context

  // STATE
  const [selectedRoomId, setSelectedRoomId] = useState(ROOMS[0].id);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState(2);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // PAYMENT & SENDING STATES
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null); // Store confirmed booking data
  const [isSuccess, setIsSuccess] = useState(false);

  // EMAIL VERIFICATION STATES
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");

  // BLOCKED DATES (already booked) - as Date objects for DatePicker
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);

  // LOAD URL PARAMS (room, checkin, checkout from AvailabilityModal)
  useEffect(() => {
    const roomParam = searchParams.get("room");
    const checkinParam = searchParams.get("checkin");
    const checkoutParam = searchParams.get("checkout");

    if (roomParam) {
      const exists = ROOMS.find(r => r.id === roomParam);
      if (exists) setSelectedRoomId(roomParam);
    }

    // Pre-fill dates from URL (passed from AvailabilityModal)
    if (checkinParam) {
      setCheckInDate(new Date(checkinParam));
    }
    if (checkoutParam) {
      setCheckOutDate(new Date(checkoutParam));
    }
  }, [searchParams]);

  // FETCH BLOCKED DATES when room changes
  useEffect(() => {
    const fetchBlockedDates = async () => {
      try {
        const res = await fetch(`/api/bookings/availability?room=${selectedRoomId}`);
        const data = await res.json();
        if (res.ok && data.blockedDates) {
          // Convert string dates to Date objects
          const dates = data.blockedDates.map((d: string) => new Date(d));
          setBlockedDates(dates);
        }
      } catch (error) {
        console.error("Failed to fetch blocked dates:", error);
      }
    };
    fetchBlockedDates();
  }, [selectedRoomId]);

  // Clear checkout if it's before or same as checkin
  useEffect(() => {
    if (checkInDate && checkOutDate && checkOutDate <= checkInDate) {
      setCheckOutDate(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Only reset when checkInDate changes, not checkOutDate
  }, [checkInDate]);

  // Helper: convert Date to string for API/display
  const formatDateForAPI = (date: Date | null) => date ? date.toISOString().split("T")[0] : "";
  const checkIn = formatDateForAPI(checkInDate);
  const checkOut = formatDateForAPI(checkOutDate);

  // CALCULATIONS
  const selectedRoom = ROOMS.find((r) => r.id === selectedRoomId) || ROOMS[0];


  const calculateTotal = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays * selectedRoom.price : 0;
  };

  const total = calculateTotal();
  const basePrice = total; // Calculated based on room price * nights
  const taxes = Math.round(basePrice * 0.12); // 12% TAX
  const grandTotal = basePrice + taxes;
  const nights = total / selectedRoom.price || 0;

  // VALIDATION
  const isDateValid = checkIn !== "" && checkOut !== "" && nights > 0;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); // STRICT REGEX
  const isPhoneValid = phone.length === 10; // EXACTLY 10 DIGITS
  const isNameValid = name.trim().length > 2; // Basic check, regex handles input restriction
  const isFormValid = isDateValid && isEmailValid && isPhoneValid && isNameValid;

  const getButtonText = () => {
    if (isSuccess) return "Booking Confirmed!";
    if (isProcessing) return "Processing Payment...";
    if (!isDateValid) return "Select Dates to Continue";
    if (!isNameValid) return "Enter Your Name";
    if (!isEmailValid) return "Enter Valid Email";
    if (!isPhoneValid) return "Enter Valid Phone Number";
    return `Pay ₹${grandTotal.toLocaleString()}`;
  };

  // --- STEP 1: PAYMENT HANDLER ---
  const handlePayment = async () => {
    if (!isFormValid) return;
    setIsProcessing(true);

    try {
      // Check if email is verified first
      const verifyRes = await fetch(`/api/auth/check-verification?email=${encodeURIComponent(email)}`);
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.verified) {
        // Email not verified - show verification modal
        setShowVerifyModal(true);
        setIsProcessing(false);
        return;
      }

      // Email verified - proceed with payment
      // 1. Create Order
      const order = await initiatePayment(grandTotal, "INR");
      console.log("Order Created:", order);

      // 2. Mock Logic (No Keys)
      if (order.mock) {
        console.log("Mock Payment Mode Active");
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        // Simulate Success directly
        await verifyPayment({
          razorpay_order_id: order.id,
          razorpay_payment_id: "mock_payment_" + Math.random().toString(36).substring(7),
          razorpay_signature: "mock_signature",
          mock: true
        });
        return;
      }

      // 3. Real Razorpay Logic
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Winterstone Luxury",
        description: `Booking for ${selectedRoom.name}`,
        order_id: order.id,
        handler: async function (response: RazorpayPaymentResponse) {
          console.log("Payment Successful", response);
          await verifyPayment({
            ...response,
            mock: false
          });
        },
        prefill: {
          name: name,
          email: email,
          contact: phone
        },
        theme: {
          color: "#D4AF37" // Saffron gold
        }
      };

      const rzp1 = new (window as unknown as { Razorpay: new (options: object) => { open: () => void; on: (event: string, handler: (response: RazorpayFailedResponse) => void) => void } }).Razorpay(options);
      rzp1.open();
      rzp1.on('payment.failed', function (response: RazorpayFailedResponse) {
        alert("Payment Failed: " + response.error.description);
        setIsProcessing(false);
      });

    } catch (error) {
      console.error("Payment Error:", error);
      alert("Could not initiate payment. Please try again.");
      setIsProcessing(false);
    }
  };

  // --- STEP 2: VERIFY & FINALIZE ---
  const verifyPayment = async (paymentDetails: PaymentDetails) => {
    try {
      // 1. Save Booking Pending Verification
      // Actually, we can save AFTER verification for simplicity, OR verify creates the record?
      // Let's assume we save the booking record via API verify call?
      // Or simpler: We create the booking *first*?
      // For now, let's verify via the API we made. The API expects a bookingId to update.
      // But we haven't created the booking in DB yet!
      // Wait, the API verify route does `Booking.findByIdAndUpdate`. It expects the booking to exist.
      // FIX: We need to creating the Booking in "Pending" state BEFORE creating the order ideally.
      // OR, simpler for this phase:
      // 1. Create Booking (Pending) -> MongoDB
      // 2. Create Order
      // 3. Pay
      // 4. Verify & Update Booking (Paid)

      // Let's modify the flow slightly:
      // A. Create Pending Booking locally/via API
      const newBooking = {
        guestName: name, // Note: Model uses guestName, Check interface
        email,
        roomName: selectedRoom.name,
        checkIn,
        checkOut,
        totalAmount: grandTotal,
        status: "Pending" as const, // Type cast
      };

      // Use Context to Add (This generates a POST to /api/bookings)
      // We need the ID back from this! addBooking in context returns void currently.
      // We might need to call fetch directly here to get the ID.

      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking),
      });

      if (!bookingRes.ok) throw new Error("Failed to create booking record");
      const savedBooking = await bookingRes.json();
      console.log("Booking Record Created:", savedBooking);

      // Now verify using this ID
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...paymentDetails,
          bookingId: savedBooking._id || savedBooking.id
        }),
      });

      if (!verifyRes.ok) throw new Error("Payment Verification Failed");

      // Success!
      await finalizeEmail(savedBooking._id || savedBooking.id); // Send Email

    } catch (error) {
      console.error("Verification Error:", error);
      alert("Payment processed but verification failed. Please contact support.");
      setIsProcessing(false);
    }
  };


  // --- STEP 3: SEND EMAIL ---
  const finalizeEmail = async (bookingId: string) => {
    const templateParams = {
      room_name: selectedRoom.name,
      user_name: name,
      user_email: email,
      to_email: email,
      user_phone: phone,
      check_in: checkIn,
      check_out: checkOut,
      nights: nights,
      total_price: `₹${grandTotal.toLocaleString()}`,
      booking_id: bookingId
    };

    try {
      await fetch('/api/email/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...templateParams,
          base_price: `₹${basePrice.toLocaleString()}`,
          taxes: `₹${taxes.toLocaleString()}`,
        }),
      });

      setIsProcessing(false);
      setIsSuccess(true);

      setInvoiceData({
        id: bookingId,
        roomName: selectedRoom.name,
        guestName: name,
        email: email,
        checkIn: checkIn,
        checkOut: checkOut,
        nights: nights,
        basePrice: basePrice,
        taxes: taxes,
        grandTotal: grandTotal,
      });

      setIsInvoiceOpen(true);

    } catch (error) {
      console.error("Email Failed...", error);
      setIsProcessing(false);
      setIsSuccess(true);
      // Still show success UI because payment worked
      alert("Booking confirmed! (Email delivery pending)");
      // Show invoice anyway
      setInvoiceData({ id: bookingId, roomName: selectedRoom.name, guestName: name, email, checkIn, checkOut, nights, basePrice, taxes, grandTotal });
      setIsInvoiceOpen(true);
    }
  };

  // --- RESEND VERIFICATION EMAIL ---
  const handleResendVerification = async () => {
    setIsSendingVerification(true);
    setVerificationMessage("");

    try {
      const res = await fetch('/api/auth/check-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setVerificationMessage("Verification email sent! Check your console (dev) or inbox.");
      } else {
        setVerificationMessage(data.error || "Failed to send verification email");
      }
    } catch {
      setVerificationMessage("Something went wrong. Please try again.");
    } finally {
      setIsSendingVerification(false);
    }
  };

  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />
      <div className="min-h-screen bg-stone-950 pt-32 pb-32 lg:pb-24 px-6 relative">

        {/* INVOICE MODAL */}
        <InvoiceModal
          isOpen={isInvoiceOpen}
          bookingDetails={invoiceData}
        />

        {/* EMAIL VERIFICATION MODAL */}
        {showVerifyModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md p-8 rounded-sm shadow-2xl">
              <div className="text-center mb-6">
                <Mail className="w-12 h-12 text-saffron mx-auto mb-4" />
                <h3 className="font-serif text-2xl text-stone-900 mb-2">Verify Your Email</h3>
                <p className="text-stone-600 text-sm">
                  To receive your booking confirmation, please verify your email address.
                </p>
              </div>

              <div className="bg-stone-50 p-4 rounded mb-6 text-center">
                <span className="text-stone-500 text-sm">Email: </span>
                <span className="font-semibold text-stone-900">{email}</span>
              </div>

              {verificationMessage && (
                <div className={`text-sm p-3 rounded mb-4 text-center ${verificationMessage.includes("sent")
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
                  }`}>
                  {verificationMessage}
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleResendVerification}
                  disabled={isSendingVerification}
                  className="w-full bg-saffron text-stone-900 py-3 text-xs font-bold tracking-widest uppercase hover:bg-stone-900 hover:text-white transition-colors disabled:opacity-50"
                >
                  {isSendingVerification ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    "Send Verification Email"
                  )}
                </button>

                <button
                  onClick={() => {
                    setShowVerifyModal(false);
                    setVerificationMessage("");
                  }}
                  className="w-full border border-stone-200 text-stone-600 py-3 text-xs font-bold tracking-widest uppercase hover:bg-stone-50 transition-colors"
                >
                  I&apos;ll Verify Later
                </button>
              </div>

              <p className="text-xs text-stone-400 text-center mt-4">
                Check your console (dev) for the verification link
              </p>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* LEFT: FORM */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="relative z-50 inline-flex items-center text-xs font-bold tracking-widest text-stone-400 hover:text-white mb-8 uppercase transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Return Home
            </Link>

            <h1 className="font-serif text-4xl text-white mb-2">Confirm Your Stay</h1>
            <p className="text-stone-400 mb-10">You are just a few steps away from the mountains.</p>

            <div className="bg-white p-8 rounded-sm shadow-xl border border-stone-800 space-y-8">

              {/* 1. ROOMS */}
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-3">Select Suite</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {ROOMS.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoomId(room.id)}
                      className={`p-4 border text-left transition-all ${selectedRoomId === room.id
                        ? "border-saffron bg-stone-50 ring-1 ring-saffron"
                        : "border-stone-200 hover:border-stone-400"
                        }`}
                    >
                      <div className="font-serif text-lg text-stone-900">{room.name}</div>
                      <div className="text-xs text-stone-500 mt-1">₹{room.price.toLocaleString()} / night</div>
                      {selectedRoomId === room.id && <Check className="w-4 h-4 text-saffron mt-2" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. DATES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-3">Check In</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-3.5 w-4 h-4 text-stone-400 z-10 pointer-events-none" />
                    <DatePicker
                      selected={checkInDate}
                      onChange={(date: Date | null) => setCheckInDate(date)}
                      excludeDates={blockedDates}
                      minDate={new Date()}
                      placeholderText="Select check-in"
                      dateFormat="MMM d, yyyy"
                      className="w-full pl-12 pr-4 py-3 border border-stone-200 focus:outline-none focus:border-saffron text-sm bg-transparent cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-3">Check Out</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-3.5 w-4 h-4 text-stone-400 z-10 pointer-events-none" />
                    <DatePicker
                      selected={checkOutDate}
                      onChange={(date: Date | null) => setCheckOutDate(date)}
                      excludeDates={blockedDates}
                      minDate={checkInDate ? new Date(checkInDate.getTime() + 86400000) : new Date()}
                      disabled={!checkInDate}
                      placeholderText="Select check-out"
                      dateFormat="MMM d, yyyy"
                      className={`w-full pl-12 pr-4 py-3 border border-stone-200 focus:outline-none focus:border-saffron text-sm bg-transparent cursor-pointer ${!checkInDate ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-3">Guests</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
                    <select
                      className="w-full pl-12 pr-4 py-3 border border-stone-200 focus:outline-none focus:border-saffron text-sm bg-transparent appearance-none"
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value))}
                    >
                      {[1, 2, 3, 4].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. PERSONAL DETAILS */}
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-3">Personal Details</label>
                <div className="grid grid-cols-1 gap-4">
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^[a-zA-Z\s]*$/.test(val)) setName(val);
                      }}
                      className="w-full pl-12 pr-4 py-3 border border-stone-200 focus:outline-none focus:border-saffron text-sm"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 border focus:outline-none text-sm transition-colors ${email.length > 0 && !isEmailValid ? "border-red-300 bg-red-50" : "border-stone-200 focus:border-saffron"
                        }`}
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={phone}
                      maxLength={10}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className={`w-full pl-12 pr-4 py-3 border focus:outline-none text-sm transition-colors ${phone.length > 0 && !isPhoneValid ? "border-red-300 bg-red-50" : "border-stone-200 focus:border-saffron"
                        }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: SUMMARY (INVOICE STYLE) */}
          <div className="lg:col-span-1">
            <div className="bg-stone-900 text-stone-100 p-8 rounded-sm border border-stone-800 shadow-2xl h-fit">
              <h3 className="font-serif text-2xl mb-6">Invoice Summary</h3>

              <div className="flex justify-between items-center pb-4 border-b border-stone-800 mb-4">
                <span className="text-sm opacity-80">Suite</span>
                <span className="font-bold">{selectedRoom.name}</span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-stone-800 mb-4">
                <span className="text-sm opacity-80">Dates</span>
                <span className="text-sm text-right">
                  {checkIn ? new Date(checkIn).toLocaleDateString() : "--"} <br /> to <br />
                  {checkOut ? new Date(checkOut).toLocaleDateString() : "--"}
                </span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-stone-800 mb-6">
                <span className="text-sm opacity-80">Duration</span>
                <span>{nights > 0 ? `${nights} Nights` : "--"}</span>
              </div>

              {/* INVOICE BREAKDOWN */}
              <div className="space-y-3 mb-6 pb-6 border-b border-stone-800">
                <div className="flex justify-between text-sm opacity-70">
                  <span>Base Rate</span>
                  <span>₹{basePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm opacity-70">
                  <span>Taxes & Fees (12%)</span>
                  <span>₹{taxes.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xl font-serif font-bold text-saffron mb-8">
                <span>Grand Total</span>
                <span>₹{grandTotal.toLocaleString()}</span>
              </div>

              {/* BUTTON */}
              <button
                onClick={handlePayment}
                disabled={!isFormValid || isProcessing || isSuccess}
                className={`w-full py-4 text-xs font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2
                ${isSuccess
                    ? "bg-green-600 text-white cursor-default"
                    : isFormValid && !isProcessing
                      ? "bg-saffron text-stone-900 hover:bg-white"
                      : "bg-stone-800 text-stone-500 cursor-not-allowed"
                  }
              `}
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4" />
                )}
                {getButtonText()}
              </button>

              <p className="text-[10px] text-center mt-4 opacity-50 uppercase tracking-wider">
                Secure Payment • Free Cancellation
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* MOBILE STICKY PAY BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-stone-900 border-t border-stone-700 p-4 z-50 shadow-2xl">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <p className="text-[10px] text-stone-400 uppercase tracking-wider">Grand Total</p>
            <p className="text-xl font-serif font-bold text-saffron">₹{grandTotal.toLocaleString()}</p>
          </div>
          <button
            onClick={handlePayment}
            disabled={!isFormValid || isProcessing || isSuccess}
            className={`px-6 py-3 text-xs font-bold tracking-widest uppercase transition-all duration-300 flex items-center gap-2
            ${isSuccess
                ? "bg-green-600 text-white cursor-default"
                : isFormValid && !isProcessing
                  ? "bg-saffron text-stone-900"
                  : "bg-stone-800 text-stone-500 cursor-not-allowed"
              }
          `}
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CreditCard className="w-4 h-4" />
            )}
            {isSuccess ? "Confirmed!" : isProcessing ? "Processing..." : "Pay Now"}
          </button>
        </div>
      </div>
    </>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-950 flex items-center justify-center text-white">Loading...</div>}>
      <BookingContent />
    </Suspense>
  );
}