"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Briefcase, Mail, Phone as PhoneIcon, Activity, Loader2 } from "lucide-react";
import { Employee, EmployeeRole, EmployeeStatus } from "@/context/EmployeeContext";

interface EmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (employeeData: Omit<Employee, "id" | "_id">) => void;
    initialData?: Employee;
    title: string;
}

export default function EmployeeModal({ isOpen, onClose, onSubmit, initialData, title }: EmployeeModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        role: "Receptionist" as EmployeeRole,
        email: "",
        phone: "",
        status: "Active" as EmployeeStatus,
        joinedDate: new Date().toISOString().split('T')[0]
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                role: initialData.role,
                email: initialData.email,
                phone: initialData.phone,
                status: initialData.status,
                joinedDate: initialData.joinedDate
            });
        } else {
            // Reset
            setFormData({
                name: "",
                role: "Receptionist",
                email: "",
                phone: "",
                status: "Active",
                joinedDate: new Date().toISOString().split('T')[0]
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 500));
        onSubmit(formData);
        setIsLoading(false);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-stone-900/60 backdrop-blur-sm"
                    />

                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-lg shadow-2xl rounded-sm overflow-hidden pointer-events-auto relative"
                        >
                            {/* Header */}
                            <div className="px-8 py-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                                <h2 className="font-serif text-2xl font-bold text-stone-900">{title}</h2>
                                <button
                                    onClick={onClose}
                                    className="text-stone-400 hover:text-stone-900 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-8 space-y-4">

                                {/* Name */}
                                <div>
                                    <label className="block text-[10px] font-bold tracking-widest uppercase text-stone-500 mb-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron rounded-sm"
                                            placeholder="Staff Name"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Role */}
                                    <div>
                                        <label className="block text-[10px] font-bold tracking-widest uppercase text-stone-500 mb-1">Role</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                                            <select
                                                value={formData.role}
                                                onChange={(e) => setFormData({ ...formData, role: e.target.value as EmployeeRole })}
                                                className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron rounded-sm appearance-none"
                                            >
                                                <option value="Manager">Manager</option>
                                                <option value="Receptionist">Receptionist</option>
                                                <option value="Housekeeping">Housekeeping</option>
                                                <option value="Kitchen">Kitchen</option>
                                                <option value="Security">Security</option>
                                                <option value="Guide">Guide</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label className="block text-[10px] font-bold tracking-widest uppercase text-stone-500 mb-1">Status</label>
                                        <div className="relative">
                                            <Activity className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value as EmployeeStatus })}
                                                className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron rounded-sm appearance-none"
                                            >
                                                <option value="Active">Active</option>
                                                <option value="On Leave">On Leave</option>
                                                <option value="Terminated">Terminated</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact */}
                                <div>
                                    <label className="block text-[10px] font-bold tracking-widest uppercase text-stone-500 mb-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron rounded-sm"
                                            placeholder="Optional"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold tracking-widest uppercase text-stone-500 mb-1">Phone</label>
                                    <div className="relative">
                                        <PhoneIcon className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron rounded-sm"
                                            placeholder="+91..."
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-stone-900 text-white py-3 text-xs font-bold tracking-widest uppercase hover:bg-saffron hover:text-stone-900 transition-colors flex items-center justify-center gap-2 rounded-sm mt-4"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (initialData ? "Update Employee" : "Add Employee")}
                                </button>

                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
