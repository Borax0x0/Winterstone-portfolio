"use client";

import React, { useState } from "react"; // Removed 'useEffect' from imports
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { X, RotateCcw } from "lucide-react"; 
import { useRouter } from "next/navigation";

// SIMULATED BLOCKED DATES (Stays the same)
const getBlockedDates = () => {
  const today = new Date();
  const date1 = new Date(today); date1.setDate(today.getDate() + 3);
  const date2 = new Date(today); date2.setDate(today.getDate() + 4);
  const date3 = new Date(today); date3.setDate(today.getDate() + 10);
  return [date1, date2, date3];
};

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

  const [blockedDates, setBlockedDates] = useState<Date[]>(getBlockedDates);

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
      
      <div className="bg-white w-full max-w-3xl rounded-sm shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-stone-900 text-white p-6 flex justify-between items-center">
          <div>
            <h3 className="font-serif text-xl">Select Dates</h3>
            <p className="text-xs text-saffron uppercase tracking-widest mt-1">{roomName}</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: SINGLE LARGE CALENDAR */}
        <div className="p-8 flex flex-col items-center justify-center bg-stone-50">
          
          <div className="custom-calendar-wrapper relative">
            <DatePicker
              selected={startDate}
              onChange={onChange}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              inline
              monthsShown={2} 
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