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

interface BookingsChartProps {
    data: { month: string; bookings: number }[];
}

export default function BookingsChart({ data }: BookingsChartProps) {
    return (
        <div className="bg-stone-900 border border-stone-700 rounded-lg p-6">
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">
                Bookings Per Month
            </h3>
            <div className="h-64">
                {data.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-stone-500 text-sm">No booking data yet</div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
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
                                    color: '#e7e5e4',
                                }}
                                labelStyle={{ color: '#a8a29e' }}
                                itemStyle={{ color: '#e7e5e4' }}
                                formatter={(value: number | undefined) => [value ?? 0, 'Bookings']}
                            />
                            <Bar
                                dataKey="bookings"
                                fill="#d4a853"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
