"use client";

import React from 'react';
import { TrendingUp, Calendar, DollarSign, Users } from 'lucide-react';
import RevenueChart from '@/components/admin/RevenueChart';
import BookingsChart from '@/components/admin/BookingsChart';
import RoomPieChart from '@/components/admin/RoomPieChart';

// Dummy stats - replace with real data before release
const stats = {
    totalBookings: 185,
    totalRevenue: 540000,
    occupancyRate: 72,
    pendingBookings: 12,
};

export default function AdminDashboard() {
    return (
        <div>
            <h1 className="text-3xl font-serif font-bold text-white mb-8">Dashboard Overview</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-stone-900 border border-stone-700 p-6 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest">
                                Total Bookings
                            </h3>
                            <p className="text-3xl font-serif text-white mt-2">
                                {stats.totalBookings}
                            </p>
                        </div>
                        <Calendar className="w-10 h-10 text-amber-500/50" />
                    </div>
                </div>

                <div className="bg-stone-900 border border-stone-700 p-6 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest">
                                Revenue
                            </h3>
                            <p className="text-3xl font-serif text-white mt-2">
                                ₹{(stats.totalRevenue / 1000).toFixed(0)}K
                            </p>
                        </div>
                        <DollarSign className="w-10 h-10 text-amber-500/50" />
                    </div>
                </div>

                <div className="bg-stone-900 border border-stone-700 p-6 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest">
                                Occupancy
                            </h3>
                            <p className="text-3xl font-serif text-white mt-2">
                                {stats.occupancyRate}%
                            </p>
                        </div>
                        <TrendingUp className="w-10 h-10 text-amber-500/50" />
                    </div>
                </div>

                <div className="bg-stone-900 border border-stone-700 p-6 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest">
                                Pending
                            </h3>
                            <p className="text-3xl font-serif text-white mt-2">
                                {stats.pendingBookings}
                            </p>
                        </div>
                        <Users className="w-10 h-10 text-amber-500/50" />
                    </div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <RevenueChart />
                <BookingsChart />
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RoomPieChart />

                {/* Quick Actions or Recent Activity placeholder */}
                <div className="bg-stone-900 border border-stone-700 rounded-lg p-6">
                    <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">
                        Quick Actions
                    </h3>
                    <div className="space-y-3">
                        <a
                            href="/admin/bookings"
                            className="block p-3 bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors"
                        >
                            <span className="text-white text-sm">View All Bookings →</span>
                        </a>
                        <a
                            href="/blog"
                            className="block p-3 bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors"
                        >
                            <span className="text-white text-sm">Manage Events →</span>
                        </a>
                        <a
                            href="/admin/reviews"
                            className="block p-3 bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors"
                        >
                            <span className="text-white text-sm">Moderate Reviews →</span>
                        </a>
                        <a
                            href="/admin/settings"
                            className="block p-3 bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors"
                        >
                            <span className="text-white text-sm">Hotel Settings →</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
