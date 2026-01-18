export type BookingStatus = "Confirmed" | "Pending" | "Cancelled";

export interface Booking {
    id: string;
    guestName: string;
    email: string;
    roomName: string;
    checkIn: string;
    checkOut: string;
    totalAmount: number;
    status: BookingStatus;
}

export const MOCK_BOOKINGS: Booking[] = [
    {
        id: "WS-8821",
        guestName: "Alice Freeman",
        email: "alice@example.com",
        roomName: "Skyline Haven",
        checkIn: "2026-01-24",
        checkOut: "2026-01-26",
        totalAmount: 19040,
        status: "Confirmed"
    },
    {
        id: "WS-9932",
        guestName: "Robert Chase",
        email: "robert.c@example.com",
        roomName: "Zen Nest",
        checkIn: "2026-02-10",
        checkOut: "2026-02-15",
        totalAmount: 36400,
        status: "Pending"
    },
    {
        id: "WS-7741",
        guestName: "Sarah Jenkins",
        email: "sarah.j@example.com",
        roomName: "Sunlit Studio",
        checkIn: "2026-01-18",
        checkOut: "2026-01-20",
        totalAmount: 16128,
        status: "Cancelled"
    },
    {
        id: "WS-8855",
        guestName: "Michael Ross",
        email: "mike.ross@example.com",
        roomName: "Skyline Haven",
        checkIn: "2026-03-01",
        checkOut: "2026-03-05",
        totalAmount: 38080,
        status: "Confirmed"
    },
    {
        id: "WS-1029",
        guestName: "Emma Watson",
        email: "emma.w@example.com",
        roomName: "Zen Nest",
        checkIn: "2026-02-20",
        checkOut: "2026-02-22",
        totalAmount: 14560,
        status: "Pending"
    }
];
