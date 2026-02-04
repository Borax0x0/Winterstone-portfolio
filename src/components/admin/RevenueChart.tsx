"use client";

import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

// Dummy data - replace with real data before release
const revenueData = [
    { month: 'Aug', revenue: 45000 },
    { month: 'Sep', revenue: 62000 },
    { month: 'Oct', revenue: 78000 },
    { month: 'Nov', revenue: 95000 },
    { month: 'Dec', revenue: 142000 },
    { month: 'Jan', revenue: 118000 },
];

export default function RevenueChart() {
    return (
        <div className="bg-stone-900 border border-stone-700 rounded-lg p-6">
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">
                Revenue Trend
            </h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                        <defs>
                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#d4a853" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#d4a853" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#44403c" />
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
                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1c1917',
                                border: '1px solid #44403c',
                                borderRadius: '8px',
                            }}
                            labelStyle={{ color: '#a8a29e' }}
                            formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#d4a853"
                            strokeWidth={2}
                            fill="url(#revenueGradient)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
