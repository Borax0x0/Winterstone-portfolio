"use client";

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

// Dummy data - replace with real data before release
const bookingsData = [
    { month: 'Aug', bookings: 18 },
    { month: 'Sep', bookings: 24 },
    { month: 'Oct', bookings: 32 },
    { month: 'Nov', bookings: 28 },
    { month: 'Dec', bookings: 45 },
    { month: 'Jan', bookings: 38 },
];

export default function BookingsChart() {
    return (
        <div className="bg-stone-900 border border-stone-700 rounded-lg p-6">
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">
                Bookings Per Month
            </h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bookingsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#44403c" vertical={false} />
                        <XAxis
                            dataKey="month"
                            stroke="#a8a29e"
                            fontSize={12}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="#a8a29e"
                            fontSize={12}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1c1917',
                                border: '1px solid #44403c',
                                borderRadius: '8px',
                            }}
                            labelStyle={{ color: '#a8a29e' }}
                            formatter={(value: number) => [value, 'Bookings']}
                        />
                        <Bar
                            dataKey="bookings"
                            fill="#d4a853"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
