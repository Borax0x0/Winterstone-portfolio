"use client";

import React, { useState, useEffect, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { X, RotateCcw, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface AvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  roomSlug: string;
  pricePerNight: number;
}

export default function AvailabilityModal({
  isOpen,
  onClose,
  roomName,
  roomSlug,
  pricePerNight
}: AvailabilityModalProps) {
  const router = useRouter();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [isLoadingDates, setIsLoadingDates] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen for calendar months
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch blocked dates from API
  const fetchBlockedDates = useCallback(async () => {
    setIsLoadingDates(true);

    // Add 5 second timeout to prevent infinite loading
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const res = await fetch(`/api/bookings/availability?room=${roomSlug}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json();

      if (res.ok && data.blockedDates) {
        // Convert ISO date strings to Date objects
        const dates = data.blockedDates.map((dateStr: string) => new Date(dateStr));
        setBlockedDates(dates);
      }
    } catch (error: unknown) {
      // If timeout or network error, just proceed with empty blocked dates
      // Calendar will still work, just won't show blocked dates
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn("Availability fetch timed out - proceeding without blocked dates");
      } else {
        console.error("Failed to fetch availability:", error);
      }
    } finally {
      setIsLoadingDates(false);
    }
  }, [roomSlug]);

  // Fetch blocked dates from API when modal opens
  useEffect(() => {
    if (isOpen && roomSlug) {
      fetchBlockedDates();
    }
  }, [isOpen, roomSlug, fetchBlockedDates]);

  if (!isOpen) return null;

  // HANDLE RANGE SELECTION
  const onChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  // NEW: CLEAR DATES FUNCTION
  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const calculateTotal = () => {
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * pricePerNight;
  };

  const handleBooking = () => {
    if (startDate && endDate) {
      router.push(`/book?room=${roomSlug}&checkin=${startDate.toISOString()}&checkout=${endDate.toISOString()}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">

      <div className="bg-white w-full max-w-3xl md:max-w-3xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl relative animate-in fade-in zoom-in duration-300">

        {/* Header */}
        <div className="bg-stone-900 text-white p-4 md:p-6 flex justify-between items-center">
          <div>
            <h3 className="font-serif text-xl">Select Dates</h3>
            <p className="text-xs text-saffron uppercase tracking-widest mt-1">{roomName}</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: CALENDAR */}
        <div className="p-4 md:p-8 flex flex-col items-center justify-center bg-stone-50">

          <div className="custom-calendar-wrapper relative">
            {/* Loading overlay */}
            {isLoadingDates && (
              <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
              </div>
            )}
            <DatePicker
              selected={startDate}
              onChange={onChange}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              inline
              monthsShown={isMobile ? 1 : 2}
              minDate={new Date()}
              excludeDates={blockedDates}
              dateFormat="dd/MM/yyyy"
            />
          </div>

          {/* Helper Text */}
          <p className="text-xs text-stone-400 mt-4 tracking-wider uppercase min-h-[1rem]">
            {startDate && !endDate ? "Select Check-out Date" : ""}
            {!startDate && "Select Check-in Date"}
            {startDate && endDate && "Dates Selected"}
          </p>

        </div>

        {/* Footer */}
        <div className="p-6 bg-white border-t border-stone-100 flex flex-col md:flex-row justify-between items-center gap-4">

          {/* Total Price */}
          <div className="text-center md:text-left">
            <span className="block text-xs text-stone-400 uppercase tracking-wider mb-1">Total Estimate</span>
            <span className="font-serif text-2xl font-bold text-stone-900">
              {calculateTotal() > 0 ? `₹${calculateTotal().toLocaleString()}` : "₹0"}
            </span>
          </div>

          {/* Buttons Container */}
          <div className="flex items-center gap-4">

            {/* NEW: Clear Button (Only shows when dates are picked) */}
            {(startDate || endDate) && (
              <button
                onClick={handleClear}
                className="flex items-center text-xs font-bold tracking-widest uppercase text-stone-400 hover:text-red-500 transition-colors px-4 py-2"
              >
                <RotateCcw className="w-3 h-3 mr-2" />
                Clear
              </button>
            )}

            {/* Book Button */}
            <button
              onClick={handleBooking}
              disabled={!startDate || !endDate}
              className="bg-saffron text-stone-900 px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-stone-900 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Book These Dates
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}