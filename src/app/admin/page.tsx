import React from 'react';

export default function AdminDashboard() {
    return (
        <div>
            <h1 className="text-3xl font-serif font-bold text-white mb-8">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Placeholder Stats */}
                <div className="bg-white p-6 shadow-sm border border-stone-200 rounded-lg">
                    <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Total Bookings</h3>
                    <p className="text-4xl font-serif text-stone-900 mt-2">128</p>
                </div>
                <div className="bg-white p-6 shadow-sm border border-stone-200 rounded-lg">
                    <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Revenue</h3>
                    <p className="text-4xl font-serif text-stone-900 mt-2">$24,500</p>
                </div>
                <div className="bg-white p-6 shadow-sm border border-stone-200 rounded-lg">
                    <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Occupancy</h3>
                    <p className="text-4xl font-serif text-stone-900 mt-2">78%</p>
                </div>
            </div>
        </div>
    );
}
