"use client";

import React, { useState } from "react";
import { User, Calendar, Save, LogOut, MapPin, Mail, Phone, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"profile" | "bookings">("profile");

    // Mock Form State
    const [formData, setFormData] = useState({
        name: user?.name || "Test User",
        email: user?.email || "test@example.com",
        phone: "+91 98765 43210",
        address: "123 Alpine Road, Manali, HP"
    });

    const handleSave = () => {
        alert("Profile updated successfully!");
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
                    {/* SIDEBAR TABS */}
                    <div className="w-full md:w-64 flex flex-col gap-2">
                        <button
                            onClick={() => setActiveTab("profile")}
                            className={`flex items-center gap-3 px-6 py-4 text-xs font-bold tracking-widest uppercase transition-all border ${activeTab === "profile"
                                ? "bg-stone-50 border-saffron text-stone-900 ring-1 ring-saffron"
                                : "bg-transparent border-stone-800 text-stone-400 hover:border-stone-600 hover:text-stone-200"
                                }`}
                        >
                            <User size={16} />
                            Profile
                        </button>
                        <button
                            onClick={() => setActiveTab("bookings")}
                            className={`flex items-center gap-3 px-6 py-4 text-xs font-bold tracking-widest uppercase transition-all border ${activeTab === "bookings"
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
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron text-sm"
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

                                <button
                                    onClick={handleSave}
                                    className="bg-stone-900 text-white px-8 py-4 text-xs font-bold tracking-widest uppercase hover:bg-saffron hover:text-stone-900 transition-colors flex items-center gap-2 mt-4"
                                >
                                    <Save size={16} />
                                    Save Changes
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <h2 className="text-2xl font-bold font-serif text-stone-900 border-b border-stone-200 pb-4">My Bookings</h2>

                                {/* MOCK BOOKING ITEM */}
                                <div className="border border-stone-200 rounded-sm p-6 flex flex-col md:flex-row gap-8 bg-stone-50 hover:bg-stone-100 transition-colors">
                                    <div className="w-full md:w-48 h-32 bg-stone-200 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-stone-300 animate-pulse" /> {/* Placeholder Image */}
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-serif font-bold text-xl text-stone-900">Skyline Haven</h3>
                                                <p className="text-xs text-stone-500 uppercase tracking-wider mt-1">Booking ID: #WIN-8821</p>
                                            </div>
                                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1.5 uppercase tracking-wider rounded-full">Confirmed</span>
                                        </div>

                                        <div className="flex gap-6 text-sm text-stone-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-saffron" />
                                                <span>Jan 24 - Jan 26, 2026</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-saffron" />
                                                <span>2 Guests</span>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <button className="text-xs font-bold text-stone-900 underline decoration-1 underline-offset-4 hover:text-saffron transition-colors">View Details</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
