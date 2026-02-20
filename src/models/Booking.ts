import mongoose, { Schema, Document, Model } from 'mongoose';

export type BookingStatus = "Confirmed" | "Pending" | "Cancelled";

export interface IBookingAddOn {
    addOnId: string;
    name: string;
    price: number;
}

export interface IBooking extends Document {
    guestName: string;
    email: string;
    roomName: string;
    checkIn: string;
    checkOut: string;
    totalAmount: number;
    addOns: IBookingAddOn[];
    addOnsTotal: number;
    status: BookingStatus;
    paymentStatus: "Pending" | "Paid" | "Failed";
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    specialRequests?: string[];
    assignedUnit?: string;
    createdAt: Date;
    updatedAt: Date;
}

const BookingSchema: Schema<IBooking> = new Schema(
    {
        guestName: { type: String, required: true },
        email: { type: String, required: true },
        roomName: { type: String, required: true },
        checkIn: { type: String, required: true },
        checkOut: { type: String, required: true },
        totalAmount: { type: Number, required: true },
        addOns: [{
            addOnId: { type: String, required: true },
            name: { type: String, required: true },
            price: { type: Number, required: true }
        }],
        addOnsTotal: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ["Confirmed", "Pending", "Cancelled"],
            default: "Pending"
        },
        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid", "Failed"],
            default: "Pending"
        },
        razorpayOrderId: { type: String },
        razorpayPaymentId: { type: String },
        specialRequests: { type: [String], default: [] },
        assignedUnit: { type: String },
    },
    {
        timestamps: true,
    }
);

const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
