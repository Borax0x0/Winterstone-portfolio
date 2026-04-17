"use client";

import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

interface RoomPieChartProps {
    data: { name: string; value: number; color: string }[];
}

export default function RoomPieChart({ data }: RoomPieChartProps) {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="bg-stone-900 border border-stone-700 rounded-lg p-6">
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">
                Revenue by Room
            </h3>
            <div className="h-64">
                {data.length === 0 || total === 0 ? (
                    <div className="h-full flex items-center justify-center text-stone-500 text-sm">No booking data yet</div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1c1917',
                                    border: '1px solid #44403c',
                                    borderRadius: '8px',
                                    color: '#e7e5e4',
                                }}
                                itemStyle={{ color: '#e7e5e4' }}
                                formatter={(value: number | undefined) => [
                                    `₹${(value ?? 0).toLocaleString()} (${(((value ?? 0) / total) * 100).toFixed(0)}%)`,
                                    'Revenue'
                                ]}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                formatter={(value) => (
                                    <span style={{ color: '#a8a29e', fontSize: '12px' }}>{value}</span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
