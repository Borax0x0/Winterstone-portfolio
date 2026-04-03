"use client";

import React, { useState } from "react";
import { Search, Eye, XCircle, CheckCircle, Clock, X, MessageSquare, Sparkles, RefreshCw, Globe } from "lucide-react";
import { useBookings, BookingStatus, Booking } from "@/context/BookingContext";
import toast from "react-hot-toast";

function StatusBadge({ status }: { status: BookingStatus }) {
    const styles = {
        Confirmed: "bg-green-100 text-green-700 border-green-200",
        Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
        Cancelled: "bg-red-100 text-red-700 border-red-200"
    };
    const icons = {
        Confirmed: <CheckCircle size={12} />,
        Pending: <Clock size={12} />,
        Cancelled: <XCircle size={12} />
    };

    return (
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border ${styles[status]}`}>
            {icons[status]}
            {status}
        </span>
    );
}

const SOURCE_STYLES: Record<string, string> = {
    'Website':     'bg-blue-50 text-blue-700 border-blue-200',
    'Booking.com': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Agoda':       'bg-red-50 text-red-700 border-red-200',
    'MakeMyTrip':  'bg-orange-50 text-orange-700 border-orange-200',
    'Expedia':     'bg-yellow-50 text-yellow-700 border-yellow-200',
    'Airbnb':      'bg-rose-50 text-rose-700 border-rose-200',
};

function SourceBadge({ source }: { source?: string }) {
    const label = source || 'Website';
    const style = SOURCE_STYLES[label] || 'bg-stone-100 text-stone-600 border-stone-200';
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${style}`}>
            <Globe size={9} />
            {label}
        </span>
    );
}

export default function BookingsPage() {
    const { bookings, updateBookingStatus, isLoading, refreshBookings } = useBookings();
    
    // Core Filters
    const [filterStatus, setFilterStatus] = useState<BookingStatus | "All">("All");
    const [searchTerm, setSearchTerm] = useState("");
    
    // Advanced Filters
    const [filterSource, setFilterSource] = useState<string>("All");
    const [filterMonth, setFilterMonth] = useState<string>("All");
    const [quickFilter, setQuickFilter] = useState<"All" | "TodayIn" | "TodayOut">("All");
    const [sortBy, setSortBy] = useState<string>("checkIn_asc");
    
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    // Derived unique properties for dropdowns
    const uniqueSources = ["All", ...Array.from(new Set(bookings.map(b => b.source || 'Website'))).sort()];
    const uniqueMonths = ["All", ...Array.from(new Set(bookings.map(b => {
        const d = new Date(b.checkIn);
        return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 7);
    }).filter(Boolean))).sort().reverse()];

    const handleEzeeSync = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch('/api/sync/ezee', { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                const { new: newB, updated, cancelled } = data.synced || {};
                toast.success(`Sync complete: ${newB} new, ${updated} updated, ${cancelled} cancelled`);
                // Reload data seamlessly
                await refreshBookings();
            } else {
                toast.error(data.error || 'Sync failed');
            }
        } catch {
            toast.error('Could not connect to eZee');
        } finally {
            setIsSyncing(false);
        }
    };

    // Filter Logic
    let filteredBookings = bookings.filter(booking => {
        // Status filter
        if (filterStatus !== "All" && booking.status !== filterStatus) return false;
        
        // Source filter
        if (filterSource !== "All" && (booking.source || 'Website') !== filterSource) return false;

        // Month filter
        if (filterMonth !== "All") {
            const dIn = new Date(booking.checkIn);
            const dOut = new Date(booking.checkOut);
            const inMonth = !isNaN(dIn.getTime()) ? dIn.toISOString().slice(0, 7) : "";
            const outMonth = !isNaN(dOut.getTime()) ? dOut.toISOString().slice(0, 7) : "";
            if (inMonth !== filterMonth && outMonth !== filterMonth) return false;
        }

        // Quick Filters
        const todayStr = new Date().toLocaleDateString('en-CA'); // e.g., '2026-04-16' in local time properly configured by environment. We'll simulate standard formatting logic:
        const todayParts = new Date();
        const formattedToday = `${todayParts.getFullYear()}-${String(todayParts.getMonth() + 1).padStart(2, '0')}-${String(todayParts.getDate()).padStart(2, '0')}`;
        
        if (quickFilter === "TodayIn" && booking.checkIn !== formattedToday) return false;
        if (quickFilter === "TodayOut" && booking.checkOut !== formattedToday) return false;

        // Search terminology
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const matchesSearch = booking.guestName.toLowerCase().includes(term) ||
                booking.email.toLowerCase().includes(term) ||
                (booking._id || booking.id || "").toLowerCase().includes(term);
            if (!matchesSearch) return false;
        }

        return true;
    });

    // Sort Logic
    filteredBookings = filteredBookings.sort((a, b) => {
        if (sortBy === "checkIn_asc") return new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime();
        if (sortBy === "checkIn_desc") return new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime();
        if (sortBy === "total_desc") return b.totalAmount - a.totalAmount;
        if (sortBy === "total_asc") return a.totalAmount - b.totalAmount;
        return 0;
    });

    const handleCancel = async (id: string) => {
        if (confirm("Are you sure you want to cancel this booking?")) {
            await updateBookingStatus(id, "Cancelled");
            toast.success("Booking cancelled");
        }
    };

    return (
        <div>
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white">Bookings</h1>
                    <p className="text-stone-400 text-sm mt-1">Manage and track all hotel reservations</p>
                </div>
                <button
                    onClick={handleEzeeSync}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-4 py-2 bg-saffron text-white text-sm font-bold rounded-lg hover:bg-saffron/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                    {isSyncing ? 'Syncing...' : 'Sync from eZee'}
                </button>
            </div>

            {/* FILTERS & SEARCH */}
            <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-sm mb-6 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    {/* Status Tabs */}
                    <div className="flex bg-stone-100 p-1 rounded-lg">
                        {(["All", "Confirmed", "Pending", "Cancelled"] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${filterStatus === status
                                    ? "bg-white text-stone-900 shadow-sm"
                                    : "text-stone-500 hover:text-stone-900"
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {/* Quick Filters */}
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setQuickFilter("All")}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md border ${quickFilter === "All" ? "bg-stone-800 text-white border-stone-800" : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"}`}
                        >
                            All
                        </button>
                        <button 
                            onClick={() => setQuickFilter("TodayIn")}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md border ${quickFilter === "TodayIn" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50"}`}
                        >
                            Today's Check-ins
                        </button>
                        <button 
                            onClick={() => setQuickFilter("TodayOut")}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md border ${quickFilter === "TodayOut" ? "bg-orange-600 text-white border-orange-600" : "bg-white text-orange-600 border-orange-200 hover:bg-orange-50"}`}
                        >
                            Today's Check-outs
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-2.5 text-stone-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search guest or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded text-sm focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron"
                        />
                    </div>
                </div>

                {/* Secondary Advanced Filters */}
                <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-stone-100">
                    {/* Source Dropdown */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-500 uppercase">Source:</span>
                        <select 
                            value={filterSource} 
                            onChange={(e) => setFilterSource(e.target.value)}
                            className="bg-stone-50 border border-stone-200 text-sm rounded px-2 py-1.5 focus:outline-none focus:border-saffron"
                        >
                            {uniqueSources.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    {/* Month Dropdown */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-500 uppercase">Stay Month:</span>
                        <select 
                            value={filterMonth} 
                            onChange={(e) => setFilterMonth(e.target.value)}
                            className="bg-stone-50 border border-stone-200 text-sm rounded px-2 py-1.5 focus:outline-none focus:border-saffron"
                        >
                            {uniqueMonths.map(m => (
                                <option key={m} value={m}>
                                    {m === "All" ? "All Time" : new Date(`${m}-01T00:00:00Z`).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-xs font-bold text-stone-500 uppercase">Sort By:</span>
                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-stone-50 border border-stone-200 text-sm rounded px-2 py-1.5 focus:outline-none focus:border-saffron"
                        >
                            <option value="checkIn_asc">Check-in Date (Earliest First)</option>
                            <option value="checkIn_desc">Check-in Date (Latest First)</option>
                            <option value="total_desc">Total Amount (High to Low)</option>
                            <option value="total_asc">Total Amount (Low to High)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white border border-stone-200 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-stone-50 border-b border-stone-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Booking ID</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Guest</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Room</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Dates</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Source</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-stone-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-stone-500">
                                        <div className="flex justify-center items-center gap-3">
                                            <div className="animate-spin h-5 w-5 border-2 border-saffron border-t-transparent rounded-full"></div>
                                            Loading Bookings...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredBookings.length > 0 ? (
                                filteredBookings.map((booking) => (
                                    <tr key={booking._id || booking.id} className="hover:bg-stone-50/50 transition-colors">
                                        <td className="px-6 py-4 text-xs font-mono font-bold text-stone-600">
                                            {booking._id ? booking._id.slice(-6).toUpperCase() : booking.id}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-stone-900">{booking.guestName}</span>
                                                <span className="text-xs text-stone-500">{booking.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-stone-600">
                                            {booking.roomName}
                                        </td>
<td className="px-6 py-4">
                                            <div className="flex flex-col text-xs text-stone-600">
                                                <span>In: {booking.checkIn}</span>
                                                <span>Out: {booking.checkOut}</span>
                                            </div>
                                            <div className="mt-1 flex items-center gap-2">
                                                {booking.specialRequests && booking.specialRequests.length > 0 && (
                                                    <div className="flex items-center gap-1 text-[10px] text-saffron font-bold">
                                                        <MessageSquare size={10} />
                                                        Requests
                                                    </div>
                                                )}
                                                {booking.addOns && booking.addOns.length > 0 && (
                                                    <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                                                        <Sparkles size={10} />
                                                        Add-ons
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-stone-900">
                                            ₹{booking.totalAmount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <SourceBadge source={booking.source} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={booking.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedBooking(booking)}
                                                    className="p-2 text-stone-400 hover:text-saffron hover:bg-stone-100 rounded transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                {booking.status !== "Cancelled" && (
                                                    <button
                                                        onClick={() => handleCancel(booking._id || booking.id!)}
                                                        className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                        title="Cancel Booking"
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-stone-400 text-sm">
                                        No bookings found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION (Static for now) */}
                <div className="px-6 py-4 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
                    <span>Showing {filteredBookings.length} results</span>
                    <div className="flex gap-2">
                        <button disabled className="px-3 py-1 border rounded opacity-50 cursor-not-allowed">Previous</button>
                        <button disabled className="px-3 py-1 border rounded opacity-50 cursor-not-allowed">Next</button>
                    </div>
                </div>
            </div>

            {/* DETAILS MODAL */}
            {selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-stone-100">
                            <h3 className="font-serif text-xl font-bold text-stone-900">Booking Details</h3>
                            <button 
                                onClick={() => setSelectedBooking(null)}
                                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                            >
                                <X size={20} className="text-stone-400" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Header Info */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Booking ID</p>
                                    <p className="font-mono text-sm font-bold text-stone-900">
                                        {selectedBooking._id || selectedBooking.id}
                                    </p>
                                </div>
                                <StatusBadge status={selectedBooking.status} />
                            </div>

                            {/* Guest & Room */}
                            <div className="grid grid-cols-2 gap-6 bg-stone-50 p-4 rounded-lg">
                                <div>
                                    <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Guest</p>
                                    <p className="font-bold text-stone-900 text-sm">{selectedBooking.guestName}</p>
                                    <p className="text-xs text-stone-500">{selectedBooking.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Room</p>
                                    <p className="font-bold text-stone-900 text-sm">{selectedBooking.roomName}</p>
                                </div>
                            </div>

                            {/* Dates & Payment */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Stay Dates</p>
                                    <p className="text-sm text-stone-700">
                                        <span className="font-semibold">{selectedBooking.checkIn}</span> to <span className="font-semibold">{selectedBooking.checkOut}</span>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Total Paid</p>
                                    <p className="text-lg font-serif font-bold text-saffron">₹{selectedBooking.totalAmount.toLocaleString()}</p>
</div>
                            </div>

                            {/* Add-ons */}
                            {selectedBooking.addOns && selectedBooking.addOns.length > 0 && (
                                <div>
                                    <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">Add-ons</p>
                                    <div className="bg-saffron/5 border border-saffron/20 rounded-lg p-3 space-y-2">
                                        {selectedBooking.addOns.map((addon: { addOnId: string; name: string; price: number }, i: number) => (
                                            <div key={i} className="flex justify-between text-sm">
                                                <span className="text-stone-700">{addon.name}</span>
                                                <span className="font-bold text-stone-900">₹{addon.price.toLocaleString()}</span>
                                            </div>
                                        ))}
                                        <div className="border-t border-saffron/20 pt-2 flex justify-between text-sm font-bold">
                                            <span className="text-stone-700">Add-ons Total</span>
                                            <span className="text-saffron">₹{(selectedBooking.addOnsTotal || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Special Requests */}
                            <div>
                                <p className="text-xs text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <MessageSquare size={12} /> Special Requests
                                </p>
                                {selectedBooking.specialRequests && selectedBooking.specialRequests.length > 0 ? (
                                    <ul className="space-y-2">
                                        {selectedBooking.specialRequests.map((req, i) => (
                                            <li key={i} className="text-sm text-stone-700 bg-yellow-50 border border-yellow-100 px-3 py-2 rounded-md flex items-start gap-2">
                                                <span className="text-yellow-500 mt-1">•</span>
                                                {req}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-stone-400 italic bg-stone-50 px-3 py-2 rounded-md">None</p>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-6 bg-stone-50 border-t border-stone-100 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="px-4 py-2 border border-stone-200 text-stone-600 rounded-lg text-sm font-bold hover:bg-white transition-colors"
                            >
                                Close
                            </button>
                            {selectedBooking.status !== "Cancelled" && (
                                <button
                                    onClick={() => {
                                        handleCancel(selectedBooking._id || selectedBooking.id!);
                                        setSelectedBooking(null);
                                    }}
                                    className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors"
                                >
                                    Cancel Booking
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
