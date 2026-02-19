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

// Dummy data - replace with real data before release
const roomData = [
    { name: 'Skyline Haven', value: 245000, color: '#d4a853' },
    { name: 'Zen Nest', value: 168000, color: '#78716c' },
    { name: 'Sunlit Studio', value: 127000, color: '#a8a29e' },
];

export default function RoomPieChart() {
    const total = roomData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="bg-stone-900 border border-stone-700 rounded-lg p-6">
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">
                Revenue by Room
            </h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={roomData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {roomData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1c1917',
                                border: '1px solid #44403c',
                                borderRadius: '8px',
                            }}
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
            </div>
        </div>
    );
}
