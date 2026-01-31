import mongoose, { Schema, Document, Model } from 'mongoose';

export type EmployeeRole = "Manager" | "Receptionist" | "Housekeeping" | "Kitchen" | "Security" | "Guide";
export type EmployeeStatus = "Active" | "On Leave" | "Terminated";

export interface IEmployee extends Document {
    name: string;
    role: EmployeeRole;
    email: string;
    phone: string;
    status: EmployeeStatus;
    joinedDate: string;
    createdAt: Date;
    updatedAt: Date;
}

const EmployeeSchema: Schema<IEmployee> = new Schema(
    {
        name: { type: String, required: true },
        role: {
            type: String,
            enum: ["Manager", "Receptionist", "Housekeeping", "Kitchen", "Security", "Guide"],
            required: true
        },
        email: { type: String },
        phone: { type: String, required: true },
        status: {
            type: String,
            enum: ["Active", "On Leave", "Terminated"],
            default: "Active"
        },
        joinedDate: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

const Employee: Model<IEmployee> = mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);

export default Employee;
