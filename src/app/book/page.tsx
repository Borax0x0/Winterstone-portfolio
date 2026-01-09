"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Check, Phone, Mail, Loader2 } from "lucide-react";
import emailjs from '@emailjs/browser'; // 1. Import EmailJS

const ROOMS = [
  { id: "skyline-haven", name: "Skyline Haven", price: 8500, image: "/skyline-main.jpg" },
  { id: "zen-nest", name: "Zen Nest", price: 6500, image: "/zen-main.jpg" },
  { id: "sunlit-studio", name: "Sunlit Studio", price: 7200, image: "/sunlit-main.jpg" },
];

function BookingContent() {
  const searchParams = useSearchParams();
  
  // STATE
  const [selectedRoomId, setSelectedRoomId] = useState(ROOMS[0].id);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // NEW: Sending States
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // LOAD URL PARAMS
  useEffect(() => {
    const roomParam = searchParams.get("room");
    if (roomParam) {
      const exists = ROOMS.find(r => r.id === roomParam);
      if (exists) setSelectedRoomId(roomParam);
    }
  }, [searchParams]);

  // DATE LOGIC
  const getToday = () => new Date().toISOString().split("T")[0];
  const getNextDay = (dateString: string) => {
    if (!dateString) return getToday();
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    if (checkIn && checkOut && checkOut <= checkIn) {
      setCheckOut(""); 
    }
  }, [checkIn]);

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
  const nights = total / selectedRoom.price || 0;
  
  // VALIDATION
  const isDateValid = checkIn !== "" && checkOut !== "" && nights > 0;
  const isEmailValid = email.includes("@") && email.includes("."); 
  const isPhoneValid = phone.length >= 10;
  const isNameValid = name.length > 2;
  const isFormValid = isDateValid && isEmailValid && isPhoneValid && isNameValid;

  const getButtonText = () => {
    if (isSuccess) return "Booking Confirmed!";
    if (isSending) return "Processing...";
    if (!isDateValid) return "Select Dates to Continue";
    if (!isNameValid) return "Enter Your Name";
    if (!isEmailValid) return "Enter Valid Email";
    if (!isPhoneValid) return "Enter Valid Phone Number";
    return "Confirm Booking";
  };

  // --- NEW: HANDLE SUBMIT FUNCTION ---
  const handleBooking = async () => {
    if (!isFormValid) return;
    
    setIsSending(true);

    // Prepare the data to match your EmailJS Template variables
    const templateParams = {
      room_name: selectedRoom.name,
      user_name: name,
      user_email: email,
      user_phone: phone,
      check_in: checkIn,
      check_out: checkOut,
      nights: nights,
      total_price: total.toLocaleString(),
    };

    try {
      // REPLACE THESE WITH YOUR ACTUAL IDS FROM EMAILJS WEBSITE
      await emailjs.send(
        "service_9fdhxvg",     // e.g. "service_xxxx"
        "template_jl7lgzs",    // e.g. "template_xxxx"
        templateParams,
        "YQ6NFN-uzowgHsZp4"      // e.g. "user_xxxx"
      );

      setIsSending(false);
      setIsSuccess(true);
      
      // Optional: Reset form or redirect after 2 seconds
      // setTimeout(() => router.push('/success'), 2000);

    } catch (error) {
      console.error("FAILED...", error);
      setIsSending(false);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-24 px-6">
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
                    className={`p-4 border text-left transition-all ${
                      selectedRoomId === room.id 
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
                  <Calendar className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
                  <input 
                    type="date" 
                    value={checkIn}
                    min={getToday()}
                    className="w-full pl-12 pr-4 py-3 border border-stone-200 focus:outline-none focus:border-saffron text-sm bg-transparent"
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-stone-400 mb-3">Check Out</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
                  <input 
                    type="date" 
                    value={checkOut}
                    min={getNextDay(checkIn)} 
                    disabled={!checkIn}
                    className={`w-full pl-12 pr-4 py-3 border border-stone-200 focus:outline-none focus:border-saffron text-sm bg-transparent ${!checkIn ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onChange={(e) => setCheckOut(e.target.value)}
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
                      onChange={(e) => setName(e.target.value)}
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
                      className={`w-full pl-12 pr-4 py-3 border focus:outline-none text-sm transition-colors ${
                        email.length > 0 && !isEmailValid ? "border-red-300 bg-red-50" : "border-stone-200 focus:border-saffron"
                      }`}
                    />
                 </div>
                 <div className="relative">
                    <Phone className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
                    <input 
                      type="tel" 
                      placeholder="Phone Number" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className={`w-full pl-12 pr-4 py-3 border focus:outline-none text-sm transition-colors ${
                        phone.length > 0 && !isPhoneValid ? "border-red-300 bg-red-50" : "border-stone-200 focus:border-saffron"
                      }`}
                    />
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* RIGHT: SUMMARY */}
        <div className="lg:col-span-1">
          <div className="bg-stone-900 text-stone-100 p-8 rounded-sm sticky top-32 border border-stone-800 shadow-2xl">
            <h3 className="font-serif text-2xl mb-6">Reservation Summary</h3>
            
            <div className="flex justify-between items-center pb-4 border-b border-stone-800 mb-4">
              <span className="text-sm opacity-80">Suite</span>
              <span className="font-bold">{selectedRoom.name}</span>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-stone-800 mb-4">
              <span className="text-sm opacity-80">Dates</span>
              <span className="text-sm text-right">
                {checkIn ? new Date(checkIn).toLocaleDateString() : "--"} <br/> to <br/> 
                {checkOut ? new Date(checkOut).toLocaleDateString() : "--"}
              </span>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-stone-800 mb-8">
              <span className="text-sm opacity-80">Duration</span>
              <span>{nights > 0 ? `${nights} Nights` : "--"}</span>
            </div>

            <div className="flex justify-between items-center text-xl font-serif font-bold text-saffron mb-8">
              <span>Total</span>
              <span>₹{total.toLocaleString()}</span>
            </div>

            {/* SEND BUTTON */}
            <button 
              onClick={handleBooking}
              disabled={!isFormValid || isSending || isSuccess}
              className={`w-full py-4 text-xs font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center
                ${isSuccess 
                   ? "bg-green-600 text-white cursor-default" 
                   : isFormValid && !isSending
                     ? "bg-saffron text-stone-900 hover:bg-white" 
                     : "bg-stone-800 text-stone-500 cursor-not-allowed"
                }
              `}
            >
              {isSending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {getButtonText()}
            </button>
            
            <p className="text-[10px] text-center mt-4 opacity-50 uppercase tracking-wider">
              Secure Payment • Free Cancellation
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-950 flex items-center justify-center text-white">Loading...</div>}>
      <BookingContent />
    </Suspense>
  );
}