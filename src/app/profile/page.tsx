"use client";

import React, { useState, useEffect, useCallback } from "react";
import { User, Calendar, Save, MapPin, Mail, Phone, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Booking {
    _id: string;
    guestName: string;
    email: string;
    roomName: string;
    checkIn: string;
    checkOut: string;
    totalAmount: number;
    status: "Confirmed" | "Pending" | "Cancelled";
    paymentStatus: "Pending" | "Paid" | "Failed";
    createdAt: string;
}

export default function ProfilePage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<"profile" | "bookings">("profile");
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: ""
    });

    // Fetch profile data on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/profile');
                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        name: data.name || "",
                        email: data.email || "",
                        phone: data.phone || "",
                        address: data.address || ""
                    });
                }
            } catch (err) {
                console.error("Failed to fetch profile:", err);
            } finally {
                // Profile loading complete
            }
        };

        if (user) {
            fetchProfile();
        }
    }, [user]);

    // Fetch bookings when tab changes to bookings
    const fetchUserBookings = useCallback(async () => {
        if (!user?.email) return;

        setIsLoadingBookings(true);
        try {
            const res = await fetch(`/api/bookings/user?email=${encodeURIComponent(user.email)}`);
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            }
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
        } finally {
            setIsLoadingBookings(false);
        }
    }, [user?.email]);

    useEffect(() => {
        if (activeTab === "bookings" && user?.email) {
            fetchUserBookings();
        }
    }, [activeTab, user?.email, fetchUserBookings]);

    const handleSave = async () => {
        setIsSaving(true);
        setError("");
        setSaveSuccess(false);

        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    address: formData.address
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
            setError(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Confirmed": return "bg-green-100 text-green-700";
            case "Pending": return "bg-yellow-100 text-yellow-700";
            case "Cancelled": return "bg-red-100 text-red-700";
            default: return "bg-stone-100 text-stone-700";
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24 bg-stone-50">
                <p>Please sign in to view your profile.</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen pt-32 pb-24 px-6 bg-stone-950">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-serif font-bold text-white mb-10">My Account</h1>

                <div className="flex flex-col md:flex-row gap-12">
                    {/* SIDEBAR TABS - Horizontal on mobile, Vertical on desktop */}
                    <div className="w-full md:w-64 flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
                        <button
                            onClick={() => setActiveTab("profile")}
                            className={`flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-4 text-xs font-bold tracking-widest uppercase transition-all border whitespace-nowrap ${activeTab === "profile"
                                ? "bg-stone-50 border-saffron text-stone-900 ring-1 ring-saffron"
                                : "bg-transparent border-stone-800 text-stone-400 hover:border-stone-600 hover:text-stone-200"
                                }`}
                        >
                            <User size={16} />
                            Profile
                        </button>
                        <button
                            onClick={() => setActiveTab("bookings")}
                            className={`flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-4 text-xs font-bold tracking-widest uppercase transition-all border whitespace-nowrap ${activeTab === "bookings"
                                ? "bg-stone-50 border-saffron text-stone-900 ring-1 ring-saffron"
                                : "bg-transparent border-stone-800 text-stone-400 hover:border-stone-600 hover:text-stone-200"
                                }`}
                        >
                            <Calendar size={16} />
                            Bookings
                        </button>
                    </div>

                    {/* CONTENT AREA */}
                    <div className="flex-1 bg-white p-8 md:p-10 rounded-sm shadow-xl border border-stone-800 min-h-[500px]">
                        {activeTab === "profile" ? (
                            <div className="space-y-8">
                                <h2 className="text-2xl font-bold font-serif text-stone-900 border-b border-stone-200 pb-4">Edit Profile</h2>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Full Name</label>
                                        <div className="relative">
                                            <User size={16} className="absolute left-4 top-3.5 text-stone-400" />
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Email Address</label>
                                        <div className="relative">
                                            <Mail size={16} className="absolute left-4 top-3.5 text-stone-400" />
                                            <input
                                                type="email"
                                                value={formData.email}
                                                disabled
                                                className="w-full pl-12 pr-4 py-3 bg-stone-100 border border-stone-200 text-sm text-stone-500 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Phone Number</label>
                                        <div className="relative">
                                            <Phone size={16} className="absolute left-4 top-3.5 text-stone-400" />
                                            <input
                                                type="text"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Address</label>
                                        <div className="relative">
                                            <MapPin size={16} className="absolute left-4 top-3.5 text-stone-400" />
                                            <input
                                                type="text"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="text-red-500 text-sm mt-4">{error}</div>
                                )}

                                {/* Success Message */}
                                {saveSuccess && (
                                    <div className="flex items-center gap-2 text-green-600 text-sm mt-4">
                                        <CheckCircle size={16} />
                                        Profile updated successfully!
                                    </div>
                                )}

                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="bg-stone-900 text-white px-8 py-4 text-xs font-bold tracking-widest uppercase hover:bg-saffron hover:text-stone-900 transition-colors flex items-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Save size={16} />
                                    )}
                                    {isSaving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <h2 className="text-2xl font-bold font-serif text-stone-900 border-b border-stone-200 pb-4">My Bookings</h2>

                                {isLoadingBookings ? (
                                    <div className="flex items-center justify-center py-16">
                                        <Loader2 className="w-8 h-8 animate-spin text-saffron" />
                                    </div>
                                ) : bookings.length === 0 ? (
                                    <div className="text-center py-16 text-stone-500">
                                        <Calendar className="w-12 h-12 mx-auto mb-4 text-stone-300" />
                                        <p>No bookings yet.</p>
                                        <p className="text-sm mt-2">When you make a reservation, it will appear here.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {bookings.map((booking) => (
                                            <div
                                                key={booking._id}
                                                className="border border-stone-200 rounded-sm p-6 bg-stone-50 hover:bg-stone-100 transition-colors"
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="font-serif font-bold text-xl text-stone-900">{booking.roomName}</h3>
                                                        <p className="text-xs text-stone-500 uppercase tracking-wider mt-1">
                                                            Booking ID: #{booking._id.slice(-8).toUpperCase()}
                                                        </p>
                                                    </div>
                                                    <span className={`text-[10px] font-bold px-3 py-1.5 uppercase tracking-wider rounded-full ${getStatusColor(booking.status)}`}>
                                                        {booking.status}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap gap-6 text-sm text-stone-600">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={14} className="text-saffron" />
                                                        <span>{formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold">₹{booking.totalAmount.toLocaleString()}</span>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded ${booking.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                            {booking.paymentStatus}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

