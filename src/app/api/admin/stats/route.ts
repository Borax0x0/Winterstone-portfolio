import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';

interface SessionUser { role?: string; }

export async function GET() {
    try {
        const session = await auth();
        const userRole = (session?.user as SessionUser | undefined)?.role;
        if (!session?.user || !userRole || !['admin', 'superadmin'].includes(userRole)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const allBookings = await Booking.find({}).lean();
        const activeBookings = allBookings.filter(b => b.status !== 'Cancelled');

        // --- Stats ---
        const totalBookings = allBookings.length;
        const totalRevenue = activeBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        const pendingBookings = allBookings.filter(b => b.status === 'Pending').length;

        // Occupancy: bookings that are actively checked-in today
        const today = new Date().toISOString().split('T')[0];
        const occupiedToday = activeBookings.filter(b => b.checkIn <= today && b.checkOut > today).length;
        // Rough occupancy based on 3 rooms
        const totalRoomSlots = 3;
        const occupancyRate = totalRoomSlots > 0 ? Math.min(100, Math.round((occupiedToday / totalRoomSlots) * 100)) : 0;

        // --- Revenue by month (last 6 months) ---
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const now = new Date();
        const revenueByMonth: { month: string; revenue: number }[] = [];
        const bookingsByMonth: { month: string; bookings: number }[] = [];

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = monthNames[d.getMonth()];

            const monthBookings = allBookings.filter(b => {
                const created = new Date(b.createdAt);
                return created.getFullYear() === d.getFullYear() && created.getMonth() === d.getMonth();
            });

            const activeMonthBookings = monthBookings.filter(b => b.status !== 'Cancelled');

            revenueByMonth.push({ month: label, revenue: activeMonthBookings.reduce((s, b) => s + (b.totalAmount || 0), 0) });
            bookingsByMonth.push({ month: label, bookings: monthBookings.length });
        }

        // --- Revenue by room (always show all 3, map OTA names to website names) ---
        const otaToWebsite: Record<string, string> = {
            'Superior Deluxe': 'Skyline Haven',
            'SUPER DELUXE': 'Skyline Haven',
            'Deluxe Room': 'Sunlit Studio',
            'Deluxe Double': 'Sunlit Studio',
            'Standard Double': 'Zen Nest',
        };

        const roomDefaults: { name: string; color: string }[] = [
            { name: 'Skyline Haven', color: '#d4a853' },
            { name: 'Zen Nest', color: '#78716c' },
            { name: 'Sunlit Studio', color: '#a8a29e' },
        ];

        const roomTotals: Record<string, number> = {
            'Skyline Haven': 0,
            'Zen Nest': 0,
            'Sunlit Studio': 0,
        };

        for (const b of activeBookings) {
            const raw = b.roomName || 'Other';
            const mapped = otaToWebsite[raw] || raw;
            if (mapped in roomTotals) {
                roomTotals[mapped] += (b.totalAmount || 0);
            }
        }

        const revenueByRoom = roomDefaults.map(r => ({
            name: r.name,
            value: roomTotals[r.name] || 0,
            color: r.color,
        }));

        return NextResponse.json({
            stats: { totalBookings, totalRevenue, occupancyRate, pendingBookings },
            revenueByMonth,
            bookingsByMonth,
            revenueByRoom,
        });
    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
