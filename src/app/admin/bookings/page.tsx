"use client";

import React, { useState } from "react";
import { Search, Eye, XCircle, CheckCircle, Clock, X, MessageSquare } from "lucide-react";
import { useBookings, BookingStatus, Booking } from "@/context/BookingContext";
import toast from "react-hot-toast";

export default function BookingsPage() {
    const { bookings, updateBookingStatus, isLoading } = useBookings();
    const [filterStatus, setFilterStatus] = useState<BookingStatus | "All">("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    // Filter Logic
    const filteredBookings = bookings.filter(booking => {
        const matchesStatus = filterStatus === "All" || booking.status === filterStatus;
        const matchesSearch = booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (booking._id || booking.id || "").toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const handleCancel = async (id: string) => {
        if (confirm("Are you sure you want to cancel this booking?")) {
            await updateBookingStatus(id, "Cancelled");
            toast.success("Booking cancelled");
        }
    };

    const StatusBadge = ({ status }: { status: BookingStatus }) => {
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
    };

    return (
        <div>
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white">Bookings</h1>
                    <p className="text-stone-400 text-sm mt-1">Manage and track all hotel reservations</p>
                </div>
            </div>

            {/* FILTERS & SEARCH */}
            <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
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
                                <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-stone-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-stone-500">
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
                                            {booking.specialRequests && booking.specialRequests.length > 0 && (
                                                <div className="mt-1 flex items-center gap-1 text-[10px] text-saffron font-bold">
                                                    <MessageSquare size={10} />
                                                    Requests
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-stone-900">
                                            ₹{booking.totalAmount.toLocaleString()}
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
                                    <td colSpan={7} className="px-6 py-12 text-center text-stone-400 text-sm">
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
