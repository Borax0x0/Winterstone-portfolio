import mongoose, { Schema, Document, Model } from 'mongoose';

export type BookingStatus = "Confirmed" | "Pending" | "Cancelled";

export interface IBooking extends Document {
    guestName: string;
    email: string;
    roomName: string;
    checkIn: string;
    checkOut: string;
    totalAmount: number;
    status: BookingStatus;
    paymentStatus: "Pending" | "Paid" | "Failed";
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
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
    },
    {
        timestamps: true,
    }
);

const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
