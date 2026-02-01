"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Type, FileText, Image as ImageIcon, Loader2, Upload } from "lucide-react";
import { Event } from "@/context/EventContext";

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (eventData: Omit<Event, "id" | "_id">) => void;
    initialData?: Event; // If provided, we are in Edit mode
    title: string;
}

interface FormData {
    title: string;
    date: string;
    desc: string;
    image: string;
}

// Helper to get default form data
const getDefaultFormData = (): FormData => ({
    title: "",
    date: "",
    desc: "",
    image: "" // No default image
});

// Helper to get form data from initial data
const getFormDataFromEvent = (event: Event): FormData => ({
    title: event.title,
    date: event.date,
    desc: event.desc,
    image: event.image
});

export default function EventModal({ isOpen, onClose, onSubmit, initialData, title }: EventModalProps) {
    // Compute initial form data based on props (avoids setState in effect)
    const computedInitialData = useMemo<FormData>(() => {
        if (initialData) {
            return getFormDataFromEvent(initialData);
        }
        return getDefaultFormData();
    }, [initialData]);

    const [formData, setFormData] = useState<FormData>(computedInitialData);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Reset form when modal opens/closes or initialData changes
    const modalKey = initialData?._id || initialData?.id || 'new';
    
    // Update form data when initialData changes
    React.useEffect(() => {
        if (initialData) {
            setFormData(getFormDataFromEvent(initialData));
        } else if (isOpen) {
            setFormData(getDefaultFormData());
        }
    }, [modalKey, isOpen, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate detailed submission
        await new Promise(resolve => setTimeout(resolve, 500));
        onSubmit(formData);
        setIsLoading(false);
        onClose();
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('image', file);

        try {
            const res = await fetch('/api/events/upload', {
                method: 'POST',
                body: uploadFormData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            setFormData(prev => ({ ...prev, image: data.imageUrl }));
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
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
                                            min={new Date().toISOString().split('T')[0]}
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

                                {/* Event Image Upload */}
                                <div>
                                    <label className="block text-xs font-bold tracking-widest uppercase text-stone-500 mb-2">Event Image</label>
                                    <div className="space-y-4">
                                        
                                        {/* Image Preview Area */}
                                        <div className="relative w-full h-48 bg-stone-100 rounded-sm overflow-hidden border border-stone-200 flex items-center justify-center group">
                                            {formData.image ? (
                                                <>
                                                    <Image 
                                                        src={formData.image} 
                                                        alt="Preview" 
                                                        fill 
                                                        className="object-cover" 
                                                    />
                                                    {/* Hover Overlay */}
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <p className="text-white text-xs font-bold uppercase tracking-widest">Current Image</p>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center text-stone-400">
                                                    <ImageIcon size={32} className="mb-2 opacity-50" />
                                                    <span className="text-xs">No image selected</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Upload Button */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <label className={`cursor-pointer flex items-center gap-2 ${isUploading ? 'bg-stone-100 text-stone-400 cursor-not-allowed' : 'bg-stone-900 text-white hover:bg-saffron hover:text-stone-900'} px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest transition-colors`}>
                                                    <Upload size={14} />
                                                    {isUploading ? "Uploading..." : "Upload New Image"}
                                                    <input 
                                                        type="file" 
                                                        accept="image/*" 
                                                        className="hidden" 
                                                        onChange={handleImageUpload}
                                                        disabled={isUploading}
                                                    />
                                                </label>
                                                <span className="text-[10px] text-stone-400">Max 5MB</span>
                                            </div>
                                            
                                            {/* Optional: Show filename if it's a local path */}
                                            {formData.image && (
                                                <p className="text-[10px] text-stone-400 truncate max-w-[150px]">
                                                    {formData.image.split('/').pop()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
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
