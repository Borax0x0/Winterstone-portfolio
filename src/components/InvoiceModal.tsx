"use client";

import React from "react";
import { Check, Home } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface InvoiceModalProps {
    isOpen: boolean;
    bookingDetails: {
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
    } | null;
}

export default function InvoiceModal({ isOpen, bookingDetails }: InvoiceModalProps) {
    if (!isOpen || !bookingDetails) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-md">

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white w-full max-w-md rounded-sm overflow-hidden shadow-2xl relative"
                >
                    {/* Header */}
                    <div className="bg-forest text-white p-6 text-center">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="font-serif text-2xl font-bold">Booking Confirmed</h2>
                        <p className="text-xs uppercase tracking-widest opacity-80 mt-1">Thank you for choosing Winterstone</p>
                    </div>

                    {/* Invoice Body */}
                    <div className="p-8 bg-stone-50">

                        <div className="text-center mb-8 pb-8 border-b border-stone-200">
                            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Booking Reference</p>
                            <p className="text-2xl font-serif text-stone-900">{bookingDetails.id}</p>
                        </div>

                        <div className="space-y-4 text-sm text-stone-600 mb-8">
                            <div className="flex justify-between">
                                <span>Guest</span>
                                <span className="font-bold text-stone-900">{bookingDetails.guestName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Suite</span>
                                <span className="font-bold text-stone-900">{bookingDetails.roomName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Check-In</span>
                                <span className="font-bold text-stone-900">{new Date(bookingDetails.checkIn).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Check-Out</span>
                                <span className="font-bold text-stone-900">{new Date(bookingDetails.checkOut).toLocaleDateString()}</span>
                            </div>
                        </div>

{/* Financials */}
                        <div className="bg-white p-4 rounded border border-stone-200 space-y-2 mb-8">
                            <div className="flex justify-between text-xs text-stone-500">
                                <span>Rate ({bookingDetails.nights} nights)</span>
                                <span>₹{bookingDetails.basePrice.toLocaleString()}</span>
                            </div>
                            {bookingDetails.addOnsTotal > 0 && bookingDetails.addOns.length > 0 && (
                                <>
                                    <div className="flex justify-between text-xs text-stone-500">
                                        <span>Add-ons</span>
                                        <span>₹{bookingDetails.addOnsTotal.toLocaleString()}</span>
                                    </div>
                                    <div className="pl-2 space-y-1 border-l-2 border-stone-200 ml-1">
                                        {bookingDetails.addOns.map((addon, i) => (
                                            <div key={i} className="flex justify-between text-[10px] text-stone-400">
                                                <span>{addon.name}</span>
                                                <span>₹{addon.price.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                            <div className="flex justify-between text-xs text-stone-500">
                                <span>Taxes & Fees (12%)</span>
                                <span>₹{bookingDetails.taxes.toLocaleString()}</span>
                            </div>
                            <div className="border-t border-stone-100 my-2 pt-2 flex justify-between text-base font-bold text-forest">
                                <span>Total Paid</span>
                                <span>₹{bookingDetails.grandTotal.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="text-center text-[10px] text-stone-400 mb-6">
                            A confirmation email has been sent to <br />
                            <span className="text-stone-600 font-bold">{bookingDetails.email}</span>
                        </div>

                        {/* Actions */}
                        <Link href="/">
                            <button className="w-full bg-stone-900 text-white py-4 text-xs font-bold tracking-widest uppercase hover:bg-saffron hover:text-stone-900 transition-colors flex items-center justify-center gap-2">
                                <Home className="w-4 h-4" /> Return Home
                            </button>
                        </Link>

                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
