"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Type, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { Event } from "@/context/EventContext";

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (eventData: Omit<Event, "id" | "_id">) => void;
    initialData?: Event; // If provided, we are in Edit mode
    title: string;
}

export default function EventModal({ isOpen, onClose, onSubmit, initialData, title }: EventModalProps) {
    const [formData, setFormData] = useState({
        title: "",
        date: "",
        desc: "",
        image: "/event-dj.jpg" // Default placeholder
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title,
                date: initialData.date,
                desc: initialData.desc,
                image: initialData.image
            });
        } else {
            // Reset for Add Mode
            setFormData({
                title: "",
                date: "",
                desc: "",
                image: "/event-dj.jpg"
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate detailed submission
        await new Promise(resolve => setTimeout(resolve, 500));
        onSubmit(formData);
        setIsLoading(false);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-stone-900/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
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
                            <form onSubmit={handleSubmit} className="p-8 space-y-6">

                                {/* Title */}
                                <div>
                                    <label className="block text-xs font-bold tracking-widest uppercase text-stone-500 mb-2">Event Title</label>
                                    <div className="relative">
                                        <Type className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all rounded-sm"
                                            placeholder="e.g. Winter Jazz Night"
                                        />
                                    </div>
                                </div>

                                {/* Date */}
                                <div>
                                    <label className="block text-xs font-bold tracking-widest uppercase text-stone-500 mb-2">Event Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
                                        <input
                                            type="date"
                                            required
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all rounded-sm"
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-xs font-bold tracking-widest uppercase text-stone-500 mb-2">Description</label>
                                    <div className="relative">
                                        <FileText className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
                                        <textarea
                                            required
                                            rows={4}
                                            value={formData.desc}
                                            onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all rounded-sm resize-none"
                                            placeholder="Event details..."
                                        />
                                    </div>
                                </div>

                                {/* Image URL */}
                                <div>
                                    <label className="block text-xs font-bold tracking-widest uppercase text-stone-500 mb-2">Image URL</label>
                                    <div className="relative">
                                        <ImageIcon className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
                                        <input
                                            type="text"
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all rounded-sm"
                                            placeholder="/event-default.jpg"
                                        />
                                    </div>
                                    <p className="text-[10px] text-stone-400 mt-1">Use a public URL or local path like <code>/event-dj.jpg</code></p>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-stone-900 text-white py-4 text-xs font-bold tracking-widest uppercase hover:bg-saffron hover:text-stone-900 transition-colors flex items-center justify-center gap-2 rounded-sm"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (initialData ? "Update Event" : "Create Event")}
                                </button>

                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
