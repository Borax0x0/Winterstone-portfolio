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

interface RevenueChartProps {
    data: { month: string; revenue: number }[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
    return (
        <div className="bg-stone-900 border border-stone-700 rounded-lg p-6">
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">
                Revenue Trend
            </h3>
            <div className="h-64">
                {data.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-stone-500 text-sm">No booking data yet</div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
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
                                    color: '#e7e5e4',
                                }}
                                labelStyle={{ color: '#a8a29e' }}
                                itemStyle={{ color: '#e7e5e4' }}
                                formatter={(value: number | undefined) => [`₹${(value ?? 0).toLocaleString()}`, 'Revenue']}
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
                )}
            </div>
        </div>
    );
}
