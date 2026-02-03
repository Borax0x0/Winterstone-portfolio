"use client";

import React, { useState, useEffect } from "react";
import { Save, Plus, X, Clock, List, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface SettingsData {
    checkInTime: string;
    checkOutTime: string;
    specialRequestOptions: string[];
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<SettingsData>({
        checkInTime: "14:00",
        checkOutTime: "11:00",
        specialRequestOptions: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [newOption, setNewOption] = useState("");

    // Fetch settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                if (res.ok) {
                    const data = await res.json();
                    setSettings({
                        checkInTime: data.checkInTime || "14:00",
                        checkOutTime: data.checkOutTime || "11:00",
                        specialRequestOptions: data.specialRequestOptions || [],
                    });
                }
            } catch (error) {
                console.error("Failed to fetch settings:", error);
                toast.error("Could not load settings");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    // Save settings
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            if (!res.ok) throw new Error('Failed to save');
            
            toast.success("Settings updated successfully");
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Failed to update settings");
        } finally {
            setIsSaving(false);
        }
    };

    // Add option
    const handleAddOption = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        const trimmed = newOption.trim();
        if (!trimmed) return;
        
        if (settings.specialRequestOptions.includes(trimmed)) {
            toast.error("Option already exists");
            return;
        }

        setSettings(prev => ({
            ...prev,
            specialRequestOptions: [...prev.specialRequestOptions, trimmed]
        }));
        setNewOption("");
    };

    // Remove option
    const handleRemoveOption = (optionToRemove: string) => {
        setSettings(prev => ({
            ...prev,
            specialRequestOptions: prev.specialRequestOptions.filter(opt => opt !== optionToRemove)
        }));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-saffron" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl">
            <h1 className="text-3xl font-serif font-bold text-white mb-2">System Settings</h1>
            <p className="text-stone-400 mb-8">Configure global preferences for booking and operations.</p>

            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="p-8 space-y-8">
                    
                    {/* TIMINGS SECTION */}
                    <div>
                        <div className="flex items-center gap-2 mb-4 border-b border-stone-100 pb-2">
                            <Clock className="w-5 h-5 text-saffron" />
                            <h2 className="font-bold text-stone-900 text-lg">Check-in / Check-out</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                                    Check-in Time
                                </label>
                                <input
                                    type="time"
                                    value={settings.checkInTime}
                                    onChange={(e) => setSettings({ ...settings, checkInTime: e.target.value })}
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron"
                                />
                                <p className="text-[10px] text-stone-400 mt-1">Standard time for guest arrival</p>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                                    Check-out Time
                                </label>
                                <input
                                    type="time"
                                    value={settings.checkOutTime}
                                    onChange={(e) => setSettings({ ...settings, checkOutTime: e.target.value })}
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron"
                                />
                                <p className="text-[10px] text-stone-400 mt-1">Standard time for guest departure</p>
                            </div>
                        </div>
                    </div>

                    {/* REQUEST OPTIONS SECTION */}
                    <div>
                        <div className="flex items-center gap-2 mb-4 border-b border-stone-100 pb-2">
                            <List className="w-5 h-5 text-saffron" />
                            <h2 className="font-bold text-stone-900 text-lg">Booking Request Options</h2>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                                Available Options
                            </label>
                            <p className="text-sm text-stone-600 mb-4">
                                Add options that guests can select during booking (e.g., "Extra Bed", "Decorations").
                            </p>

                            <form onSubmit={handleAddOption} className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={newOption}
                                    onChange={(e) => setNewOption(e.target.value)}
                                    placeholder="Add new option..."
                                    className="flex-1 px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-saffron"
                                />
                                <button
                                    type="submit"
                                    disabled={!newOption.trim()}
                                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors flex items-center gap-2 font-bold text-sm disabled:opacity-50"
                                >
                                    <Plus size={16} /> Add
                                </button>
                            </form>

                            <div className="flex flex-wrap gap-2">
                                {settings.specialRequestOptions.map((option, index) => (
                                    <span key={index} className="inline-flex items-center gap-1 bg-stone-100 border border-stone-200 text-stone-700 px-3 py-1.5 rounded-full text-sm">
                                        {option}
                                        <button
                                            onClick={() => handleRemoveOption(option)}
                                            className="hover:text-red-500 p-0.5 rounded-full hover:bg-stone-200 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                                {settings.specialRequestOptions.length === 0 && (
                                    <span className="text-stone-400 text-sm italic">No options defined.</span>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

                {/* FOOTER ACTION */}
                <div className="bg-stone-50 px-8 py-4 border-t border-stone-200 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-8 py-3 bg-saffron hover:bg-saffron/90 text-stone-900 font-bold rounded-lg shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
