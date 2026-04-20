"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ArrowLeft, Calendar, User, Check, Phone, Mail, Loader2, CreditCard, MessageSquare, Sparkles, Mountain } from "lucide-react";
// Email sent via API route (server-side)
// PaymentModal removed - logic is handled inline
import InvoiceModal from "@/components/InvoiceModal";
import { useBookings } from "@/context/BookingContext"; // Import Context
import { useAuth } from "@/context/AuthContext";

const ROOMS = [
  { id: "skyline-haven", name: "Skyline Haven", price1: 2599, price2: 3199, image: "/skyline-room-1.jpg" },
  { id: "zen-nest", name: "Zen Nest", price1: 1599, price2: 1999, image: "/zen-room-1.jpg" },
  { id: "sunlit-studio", name: "Sunlit Studio", price1: 2199, price2: 2599, image: "/sunlit-room-1.jpg" },
];

const PACKAGES = [
  {
    id: 'solo-triund',
    name: 'Solo Triund Package',
    tagline: '1 Guest · 3 Days / 2 Nights',
    inclusions: ['2-night Winterstone stay', 'Guided Triund trek', 'Breakfast & dinner included', 'Trek equipment provided'],
    price: 5000,
  },
  {
    id: 'couple-triund',
    name: 'Couple Triund Package',
    tagline: '2 Guests · 3 Days / 2 Nights',
    inclusions: ['2-night Winterstone stay', 'Guided Triund trek for two', 'Breakfast & dinner included', 'Trek equipment provided'],
    price: 7000,
  },
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
  addOnsTotal: number;
  taxes: number;
  grandTotal: number;
  addOns: { addOnId: string; name: string; price: number }[];
}

interface AddOn {
  _id: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
}

function BookingContent() {
  const searchParams = useSearchParams();
  const { initiatePayment } = useBookings(); // Use Context
  const { user } = useAuth();

  // STATE
  const [selectedRoomId, setSelectedRoomId] = useState(ROOMS[0].id);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState(2);
  const [specialRequests, setSpecialRequests] = useState<string[]>([]);
  const [customRequest, setCustomRequest] = useState("");
  const [availableUnits, setAvailableUnits] = useState<{ _id: string; name: string }[]>([]);
  const [assignedUnit, setAssignedUnit] = useState("");
  const [isCheckingUnits, setIsCheckingUnits] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Auto-fill from session
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
    }
  }, [user]);

  // ADD-ONS STATE
  const [availableAddOns, setAvailableAddOns] = useState<AddOn[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]); // IDs of selected add-ons
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  // PAYMENT & SENDING STATES
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null); // Store confirmed booking data
  const [isSuccess, setIsSuccess] = useState(false);

  // Auth modal state (for post-booking account creation prompt)
  const [showCreateAccountPrompt, setShowCreateAccountPrompt] = useState(false);

  // BLOCKED DATES (already booked) - as Date objects for DatePicker
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);

  // SETTINGS (Check-in/out times, Request Options)
  const [settings, setSettings] = useState({
    checkInTime: "14:00",
    checkOutTime: "11:00",
    specialRequestOptions: [] as string[],
  });

// FETCH SETTINGS
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings({
            checkInTime: data.checkInTime || "14:00",
            checkOutTime: data.checkOutTime || "11:00",
            specialRequestOptions: data.specialRequestOptions || [],
          });
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    };
    fetchSettings();
  }, []);

  // FETCH ADD-ONS
  useEffect(() => {
    const fetchAddOns = async () => {
      try {
        const res = await fetch('/api/addons');
        if (res.ok) {
          const data = await res.json();
          setAvailableAddOns(data);
        }
      } catch (error) {
        console.error("Failed to fetch add-ons:", error);
      }
    };
    fetchAddOns();
  }, []);

  // LOAD URL PARAMS (room, checkin, checkout from AvailabilityModal, payment callbacks)
  useEffect(() => {
    const roomParam = searchParams.get("room");
    const checkinParam = searchParams.get("checkin");
    const checkoutParam = searchParams.get("checkout");
    const unitParam = searchParams.get("unit"); // Added unit
    
    // Callback redirect handling
    const paymentParam = searchParams.get("payment");
    const orderIdParam = searchParams.get("orderId");

    if (paymentParam === "success" && orderIdParam) {
      setIsSuccess(true);
      alert(`Booking Confirmed! (Order: ${orderIdParam}). We've sent a detailed receipt to your email.`);
    } else if (paymentParam === "failed") {
      alert("Payment failed or was cancelled.");
    } else if (paymentParam === "error") {
      alert("There was an error verifying the payment. Please contact support.");
    }

    if (roomParam) {
      const exists = ROOMS.find(r => r.id === roomParam);
      if (exists) setSelectedRoomId(roomParam);
    }

    if (unitParam) {
      setAssignedUnit(unitParam);
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

  // FETCH AVAILABLE UNITS
  useEffect(() => {
    const fetchAvailableUnits = async () => {
      if (!selectedRoomId || !checkIn || !checkOut) {
        setAvailableUnits([]);
        setAssignedUnit("");
        return;
      }

      setIsCheckingUnits(true);
      setAssignedUnit(""); // Reset selection when dates change

      try {
        const res = await fetch('/api/rooms/units/available', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomSlug: selectedRoomId, checkIn, checkOut }),
        });

        if (res.ok) {
          const units = await res.json();
          setAvailableUnits(units);
          // If only 1 unit is available, maybe auto-select? No, let user pick if they want.
          // Or if 0 units, blockedDates logic should handle it, but this is a double check.
        }
      } catch (error) {
        console.error("Failed to fetch available units", error);
      } finally {
        setIsCheckingUnits(false);
      }
    };

    // Debounce slightly to avoid rapid calls while picking dates
    const timeout = setTimeout(fetchAvailableUnits, 500);
    return () => clearTimeout(timeout);
  }, [selectedRoomId, checkIn, checkOut]);

  // Helper to format time (e.g. "14:00" -> "2:00 PM")
  const formatTime = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  // CALCULATIONS
  const selectedRoom = ROOMS.find((r) => r.id === selectedRoomId) || ROOMS[0];


const calculateTotal = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const nightPrice = guests === 1 ? selectedRoom.price1 : selectedRoom.price2;
    return diffDays > 0 ? diffDays * nightPrice : 0;
  };

  const calculateAddOnsTotal = () => {
    return selectedAddOns.reduce((sum, addOnId) => {
      const addOn = availableAddOns.find(a => a._id === addOnId);
      return sum + (addOn?.price || 0);
    }, 0);
  };

  const getSelectedAddOnsData = () => {
    return selectedAddOns.map(addOnId => {
      const addOn = availableAddOns.find(a => a._id === addOnId);
      return {
        addOnId,
        name: addOn?.name || "",
        price: addOn?.price || 0
      };
    }).filter(a => a.name);
  };

  const total = calculateTotal();
  const basePrice = total;
  const addOnsTotal = calculateAddOnsTotal();
  const selectedPackageData = PACKAGES.find(p => p.id === selectedPackage) ?? null;
  const packageTotal = selectedPackageData?.price ?? 0;
  const taxes = Math.round((basePrice + addOnsTotal + packageTotal) * 0.12);
  const grandTotal = basePrice + addOnsTotal + packageTotal + taxes;
  const nightPrice = guests === 1 ? selectedRoom.price1 : selectedRoom.price2;
  const nights = nightPrice > 0 ? total / nightPrice : 0;

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
      // 1. Create Razorpay Order first (server-side)
      const order = await initiatePayment(grandTotal, "INR");
      console.log("Order Created:", order);

      // 2. Build the pending booking record
      const finalRequests = [...specialRequests];
      if (customRequest.trim()) {
        finalRequests.push(`Other: ${customRequest.trim()}`);
      }
      const newBooking = {
        guestName: name,
        email,
        roomName: selectedRoom.name,
        checkIn,
        checkOut,
        totalAmount: grandTotal,
        addOns: selectedPackageData
          ? [...getSelectedAddOnsData(), { addOnId: `pkg_${selectedPackage!}`, name: selectedPackageData.name, price: selectedPackageData.price }]
          : getSelectedAddOnsData(),
        addOnsTotal: addOnsTotal + packageTotal,
        status: "Pending" as const,
        specialRequests: finalRequests,
        assignedUnit: assignedUnit || undefined,
        // Store razorpayOrderId now so the webhook can find this booking
        // even if the client-side handler never fires
        razorpayOrderId: order.id,
      };

      // 3. Save the Pending booking to DB before opening Razorpay
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking),
      });
      if (!bookingRes.ok) throw new Error("Failed to create booking record");
      const savedBooking = await bookingRes.json();
      const bookingId: string = savedBooking._id || savedBooking.id;
      console.log("Booking Record Created (Pending):", bookingId);

      // 4. Mock mode (no Razorpay keys) — auto-verify
      if (order.mock) {
        console.log("Mock Payment Mode Active");
        await new Promise(resolve => setTimeout(resolve, 1500));
        await verifyPayment({
          razorpay_order_id: order.id,
          razorpay_payment_id: "mock_payment_" + Math.random().toString(36).substring(7),
          razorpay_signature: "mock_signature",
          mock: true,
        }, bookingId);
        return;
      }

      // 5. Real Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Winterstone Lodge",
        description: `Booking for ${selectedRoom.name}`,
        order_id: order.id,
        handler: async function (response: RazorpayPaymentResponse) {
          console.log("Payment Successful", response);
          await verifyPayment({ ...response, mock: false }, bookingId);
        },
        prefill: {
          name: name,
          email: email,
          contact: `+91${phone}`,
        },
        theme: { color: "#D4AF37" },
        callback_url: "/api/payments/callback",
        modal: {
          ondismiss: function () {
            // User closed the modal without paying — reset processing state
            console.log("Razorpay modal dismissed");
            setIsProcessing(false);
          },
        },
      };

      const rzpCtor = (window as unknown as { Razorpay: new (options: object) => { open: () => void; on: (event: string, handler: (response: RazorpayFailedResponse) => void) => void } }).Razorpay;
      const rzp1 = new rzpCtor(options);
      rzp1.open();
      rzp1.on('payment.failed', function (response: RazorpayFailedResponse) {
        console.error("Payment Failed:", response.error);
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
  // bookingId is now passed in from handlePayment (booking was created before modal opened)
  const verifyPayment = async (paymentDetails: PaymentDetails, bookingId: string) => {
    try {
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...paymentDetails, bookingId }),
      });

      if (!verifyRes.ok) throw new Error("Payment Verification Failed");

      // Success — send confirmation email
      await finalizeEmail(bookingId);

    } catch (error) {
      console.error("Verification Error:", error);
      alert("Payment processed but verification failed. Please contact support.");
      setIsProcessing(false);
    }
  };


// --- STEP 3: SEND EMAIL ---
  const finalizeEmail = async (bookingId: string) => {
    const selectedAddOnsList = getSelectedAddOnsData();
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
      booking_id: bookingId,
      add_ons: selectedAddOnsList,
      add_ons_total: `₹${addOnsTotal.toLocaleString()}`,
    };

    try {
      const emailRes = await fetch('/api/email/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...templateParams,
          base_price: `₹${basePrice.toLocaleString()}`,
          taxes: `₹${taxes.toLocaleString()}`,
        }),
      });
      if (!emailRes.ok) {
        const errText = await emailRes.text();
        console.error('Booking confirmation email failed:', errText);
      }

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
        addOnsTotal: addOnsTotal,
        taxes: taxes,
        grandTotal: grandTotal,
        addOns: getSelectedAddOnsData(),
      });

      setIsInvoiceOpen(true);
      setShowCreateAccountPrompt(true);

    } catch (error) {
      console.error("Email Failed...", error);
      setIsProcessing(false);
      setIsSuccess(true);
      // Still show success UI because payment worked
      alert("Booking confirmed! (Email delivery pending)");
      // Show invoice anyway
      setInvoiceData({ 
        id: bookingId, 
        roomName: selectedRoom.name, 
        guestName: name, 
        email, 
        checkIn, 
        checkOut, 
        nights, 
        basePrice, 
        addOnsTotal,
        taxes, 
        grandTotal,
        addOns: getSelectedAddOnsData()
      });
      setIsInvoiceOpen(true);
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

        {/* POST-BOOKING ACCOUNT CREATION PROMPT */}
        {showCreateAccountPrompt && (
          <div className="fixed bottom-6 right-6 z-[110] bg-white shadow-2xl rounded border border-stone-200 p-5 max-w-xs">
            <button
              onClick={() => setShowCreateAccountPrompt(false)}
              className="absolute top-3 right-3 text-stone-400 hover:text-stone-700 transition-colors"
            >
              ✕
            </button>
            <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">Want to manage your booking?</p>
            <p className="text-sm text-stone-700 mb-3">Create an account to track reservations, request modifications, and get exclusive offers.</p>
            <button
              onClick={() => { setShowCreateAccountPrompt(false); }}
              className="w-full bg-stone-900 text-white py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-saffron hover:text-stone-900 transition-colors"
            >
              Create Account
            </button>
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

              {/* 0. PACKAGES */}
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-1 flex items-center gap-2">
                  <Mountain className="w-4 h-4 text-saffron" />
                  Packages &amp; Experiences
                </label>
                <p className="text-[11px] text-stone-400 mb-3">Optional — add a curated mountain experience to your stay.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PACKAGES.map((pkg) => (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedPackage(selectedPackage === pkg.id ? null : pkg.id)}
                      className={`p-4 border text-left transition-all ${
                        selectedPackage === pkg.id
                          ? "border-saffron bg-saffron/5 ring-1 ring-saffron"
                          : "border-stone-200 hover:border-stone-400"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium text-stone-900">{pkg.name}</div>
                          <div className="text-[11px] text-stone-400 mt-0.5">{pkg.tagline}</div>
                        </div>
                        <div className="text-sm font-bold text-saffron shrink-0 ml-2">₹{pkg.price.toLocaleString()}</div>
                      </div>
                      <ul className="space-y-1 mt-2">
                        {pkg.inclusions.map((item, i) => (
                          <li key={i} className="flex items-center gap-1.5 text-xs text-stone-500">
                            <Check className="w-3 h-3 text-saffron shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      {selectedPackage === pkg.id && (
                        <div className="mt-2 pt-2 border-t border-saffron/20 flex items-center gap-1 text-xs text-saffron font-semibold">
                          <Check className="w-3 h-3" /> Added to your stay
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-stone-400 mt-2 ml-1">* Trek dates are coordinated by the lodge upon arrival. Package price is added to your total.</p>
              </div>

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
                      <div className="text-xs text-stone-500 mt-1">₹{(guests === 1 ? room.price1 : room.price2).toLocaleString()} / night</div>
                      {selectedRoomId === room.id && <Check className="w-4 h-4 text-saffron mt-2" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. DATES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-3">
                      Check In <span className="text-stone-500 font-normal ml-1">({formatTime(settings.checkInTime)})</span>
                    </label>
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
                    <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-3">
                      Check Out <span className="text-stone-500 font-normal ml-1">({formatTime(settings.checkOutTime)})</span>
                    </label>
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

              {/* 2.5 SPECIFIC ROOM SELECTION */}
              {isDateValid && (
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-3">
                    Select Specific Room
                    {isCheckingUnits && <span className="ml-2 text-[10px] text-saffron normal-case animate-pulse">Checking availability...</span>}
                  </label>
                  
                  {availableUnits.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availableUnits.map((unit) => (
                        <button
                          key={unit._id}
                          onClick={() => setAssignedUnit(unit._id)}
                          className={`flex items-center justify-between p-3 border rounded-sm transition-all text-left ${
                            assignedUnit === unit._id
                              ? "border-saffron bg-stone-50 ring-1 ring-saffron"
                              : "border-stone-200 hover:border-stone-400"
                          }`}
                        >
                          <span className="text-sm font-medium text-stone-800">{unit.name}</span>
                          {assignedUnit === unit._id && <Check className="w-4 h-4 text-saffron" />}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-stone-50 border border-stone-100 text-stone-500 text-sm italic">
                      {isCheckingUnits ? "Loading rooms..." : "System will assign the best available room automatically."}
                    </div>
)}
                </div>
              )}

              {/* 3. ENHANCE YOUR STAY (ADD-ONS) */}
              {isDateValid && availableAddOns.length > 0 && (
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-saffron" />
                    Enhance Your Stay
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableAddOns.map((addon) => (
                      <button
                        key={addon._id}
                        onClick={() => {
                          if (selectedAddOns.includes(addon._id)) {
                            setSelectedAddOns(selectedAddOns.filter(id => id !== addon._id));
                          } else {
                            setSelectedAddOns([...selectedAddOns, addon._id]);
                          }
                        }}
                        className={`p-4 border text-left transition-all ${
                          selectedAddOns.includes(addon._id)
                            ? "border-saffron bg-saffron/5 ring-1 ring-saffron"
                            : "border-stone-200 hover:border-stone-400"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-stone-900">{addon.name}</div>
                            {addon.description && (
                              <div className="text-xs text-stone-500 mt-1">{addon.description}</div>
                            )}
                          </div>
                          <div className="text-sm font-bold text-saffron">₹{addon.price.toLocaleString()}</div>
                        </div>
                        {selectedAddOns.includes(addon._id) && (
                          <Check className="w-4 h-4 text-saffron mt-2" />
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-stone-400 mt-2 ml-1">Add-ons are charged once per booking.</p>
                </div>
              )}

              {/* 4. PERSONAL DETAILS */}
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


              {/* 4. SPECIAL REQUESTS */}
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-3">Special Requests</label>
                <div className="bg-stone-50 p-4 border border-stone-100 rounded-sm space-y-4">
                  
                  {/* Options */}
                  {settings.specialRequestOptions.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {settings.specialRequestOptions.map((option) => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 border border-stone-200 rounded-sm hover:border-saffron transition-colors">
                          <input
                            type="checkbox"
                            className="accent-saffron w-4 h-4"
                            checked={specialRequests.includes(option)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSpecialRequests([...specialRequests, option]);
                              } else {
                                setSpecialRequests(specialRequests.filter(r => r !== option));
                              }
                            }}
                          />
                          <span className="text-sm text-stone-600">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Custom Request */}
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
                    <textarea
                      placeholder="Any other specific requests? (e.g. Dietary restrictions, Accessibility needs)"
                      value={customRequest}
                      onChange={(e) => setCustomRequest(e.target.value)}
                      rows={3}
                      className="w-full pl-12 pr-4 py-3 border border-stone-200 focus:outline-none focus:border-saffron text-sm resize-none bg-white"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-stone-400 mt-2 ml-1">* Special requests are subject to availability and may incur additional charges.</p>
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
                  <span>Base Rate ({nights} nights)</span>
                  <span>₹{basePrice.toLocaleString()}</span>
                </div>
                {addOnsTotal > 0 && (
                  <div className="flex justify-between text-sm opacity-70">
                    <span>Add-ons</span>
                    <span>₹{addOnsTotal.toLocaleString()}</span>
                  </div>
                )}
                {packageTotal > 0 && (
                  <div className="flex justify-between text-sm opacity-70">
                    <span>{selectedPackageData?.name}</span>
                    <span>₹{packageTotal.toLocaleString()}</span>
                  </div>
                )}
                {selectedAddOns.length > 0 && (
                  <div className="pl-2 space-y-1 border-l-2 border-stone-700 ml-1">
                    {getSelectedAddOnsData().map((addon, i) => (
                      <div key={i} className="flex justify-between text-xs opacity-60">
                        <span className="truncate mr-2">{addon.name}</span>
                        <span>₹{addon.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
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