"use client";

import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, DollarSign, Users, Loader2 } from 'lucide-react';
import RevenueChart from '@/components/admin/RevenueChart';
import BookingsChart from '@/components/admin/BookingsChart';
import RoomPieChart from '@/components/admin/RoomPieChart';

interface DashboardStats {
    totalBookings: number;
    totalRevenue: number;
    occupancyRate: number;
    pendingBookings: number;
}

interface MonthData {
    month: string;
    revenue?: number;
    bookings?: number;
}

interface RoomData {
    name: string;
    value: number;
    color: string;
}

interface DashboardData {
    stats: DashboardStats;
    revenueByMonth: MonthData[];
    bookingsByMonth: MonthData[];
    revenueByRoom: RoomData[];
}

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/stats');
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
            </div>
        );
    }

    const stats = data?.stats || { totalBookings: 0, totalRevenue: 0, occupancyRate: 0, pendingBookings: 0 };

    return (
        <div>

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
                <RevenueChart data={data?.revenueByMonth || []} />
                <BookingsChart data={data?.bookingsByMonth || []} />
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RoomPieChart data={data?.revenueByRoom || []} />

                {/* Quick Actions */}
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
