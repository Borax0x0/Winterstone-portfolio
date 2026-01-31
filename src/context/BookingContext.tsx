"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type BookingStatus = "Confirmed" | "Pending" | "Cancelled";

export interface Booking {
    _id: string; // MongoDB
    id?: string; // Fallback
    guestName: string;
    email: string;
    roomName: string;
    checkIn: string;
    checkOut: string;
    totalAmount: number;
    status: BookingStatus;
}

interface BookingContextType {
    bookings: Booking[];
    isLoading: boolean;
    addBooking: (booking: Omit<Booking, "_id" | "id">) => Promise<void>;
    updateBookingStatus: (id: string, status: BookingStatus) => Promise<void>;
    deleteBooking: (id: string) => Promise<void>;
    initiatePayment: (amount: number, currency?: string) => Promise<any>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch Bookings
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await fetch('/api/bookings');
                if (res.ok) {
                    const data = await res.json();
                    setBookings(data);
                }
            } catch (error) {
                console.error("Failed to fetch bookings", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const addBooking = async (newBooking: Omit<Booking, "_id" | "id">) => {
        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBooking),
            });
            if (res.ok) {
                const savedBooking = await res.json();
                setBookings(prev => [savedBooking, ...prev]);
            }
        } catch (error) {
            console.error("Failed to add booking", error);
            throw error;
        }
    };

    const updateBookingStatus = async (id: string, status: BookingStatus) => {
        try {
            // MongoDB uses _id, but we might have id in mock
            const res = await fetch(`/api/bookings/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });

            if (res.ok) {
                const updated = await res.json();
                setBookings(prev => prev.map(b => (b._id === id || b.id === id ? updated : b)));
            }
        } catch (error) {
            console.error("Failed to update booking", error);
            throw error;
        }
    };

    const deleteBooking = async (id: string) => {
        try {
            const res = await fetch(`/api/bookings/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setBookings(prev => prev.filter(b => b._id !== id && b.id !== id));
            }
        } catch (error) {
            console.error("Failed to delete booking", error);
            throw error;
        }
    }

    const initiatePayment = async (amount: number, currency: string = "INR") => {
        try {
            const res = await fetch('/api/payments/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, bookingId: 'temp_booking_id', currency }), // bookingId optional for creation
            });
            if (!res.ok) throw new Error("Failed to create order");
            return await res.json();
        } catch (error) {
            console.error("Payment initiation failed", error);
            throw error;
        }
    };

    return (
        <BookingContext.Provider value={{ bookings, isLoading, addBooking, updateBookingStatus, deleteBooking, initiatePayment }}>
            {children}
        </BookingContext.Provider>
    );
}

export function useBookings() {
    const context = useContext(BookingContext);
    if (context === undefined) {
        throw new Error("useBookings must be used within a BookingProvider");
    }
    return context;
}
