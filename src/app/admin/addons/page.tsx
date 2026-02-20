"use client";

import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Check, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface AddOn {
    _id: string;
    name: string;
    description: string;
    price: number;
    isActive: boolean;
    displayOrder: number;
    createdAt: string;
    updatedAt: string;
}

const DEFAULT_ADDONS = [
    { name: "Breakfast", description: "Start your day with our continental breakfast", price: 600 },
    { name: "Airport Transfer (One-way)", description: "Comfortable pickup/drop from Dharamshala Airport", price: 2500 },
    { name: "Airport Transfer (Round-trip)", description: "Both-way airport transfers", price: 4500 },
    { name: "Late Checkout (2 PM)", description: "Extend your checkout time till 2 PM", price: 800 },
    { name: "Early Check-in (12 PM)", description: "Early room access from 12 PM", price: 800 },
    { name: "Spa Session (60 min)", description: "Relaxing spa treatment at our wellness center", price: 3000 },
];

export default function AddOnsPage() {
    const [addOns, setAddOns] = useState<AddOn[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: 0,
        isActive: true,
    });

    useEffect(() => {
        fetchAddOns();
    }, []);

    const fetchAddOns = async () => {
        try {
            const res = await fetch('/api/addons');
            if (res.ok) {
                const data = await res.json();
                setAddOns(data);
            }
        } catch {
            console.error("Failed to fetch add-ons");
            toast.error("Could not load add-ons");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddDefault = async () => {
        setIsSaving(true);
        try {
            for (let i = 0; i < DEFAULT_ADDONS.length; i++) {
                const addon = DEFAULT_ADDONS[i];
                await fetch('/api/addons', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...addon, displayOrder: i }),
                });
            }
            toast.success("Default add-ons added");
            fetchAddOns();
        } catch {
            toast.error("Failed to add default add-ons");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAdd = async () => {
        if (!formData.name.trim() || formData.price <= 0) {
            toast.error("Please fill in name and price");
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch('/api/addons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    displayOrder: addOns.length,
                }),
            });

            if (!res.ok) throw new Error("Failed to add");
            
            toast.success("Add-on created");
            setShowAddForm(false);
            setFormData({ name: "", description: "", price: 0, isActive: true });
            fetchAddOns();
        } catch {
            toast.error("Failed to create add-on");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdate = async (id: string) => {
        if (!formData.name.trim() || formData.price <= 0) {
            toast.error("Please fill in name and price");
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch(`/api/addons/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to update");
            
            toast.success("Add-on updated");
            setEditingId(null);
            setFormData({ name: "", description: "", price: 0, isActive: true });
            fetchAddOns();
        } catch {
            toast.error("Failed to update add-on");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this add-on?")) return;

        try {
            const res = await fetch(`/api/addons/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete");
            
            toast.success("Add-on deleted");
            setAddOns(prev => prev.filter(a => a._id !== id));
        } catch {
            toast.error("Failed to delete add-on");
        }
    };

    const handleToggleActive = async (addon: AddOn) => {
        try {
            const res = await fetch(`/api/addons/${addon._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...addon, isActive: !addon.isActive }),
            });

            if (!res.ok) throw new Error("Failed to update");
            
            setAddOns(prev => prev.map(a => 
                a._id === addon._id ? { ...a, isActive: !a.isActive } : a
            ));
            toast.success(addon.isActive ? "Add-on disabled" : "Add-on enabled");
        } catch {
            toast.error("Failed to update add-on");
        }
    };

    const startEdit = (addon: AddOn) => {
        setEditingId(addon._id);
        setFormData({
            name: addon.name,
            description: addon.description,
            price: addon.price,
            isActive: addon.isActive,
        });
        setShowAddForm(false);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ name: "", description: "", price: 0, isActive: true });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-saffron" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white">Add-Ons</h1>
                    <p className="text-stone-400 text-sm mt-1">Manage extra services for guests</p>
                </div>
                <div className="flex gap-3">
                    {addOns.length === 0 && (
                        <button
                            onClick={handleAddDefault}
                            disabled={isSaving}
                            className="px-4 py-2 bg-stone-700 text-white text-sm font-bold rounded-lg hover:bg-stone-600 transition-colors disabled:opacity-50"
                        >
                            Add Default Add-Ons
                        </button>
                    )}
                    <button
                        onClick={() => { setShowAddForm(true); setEditingId(null); }}
                        className="flex items-center gap-2 px-4 py-2 bg-saffron text-stone-900 text-sm font-bold rounded-lg hover:bg-saffron/90 transition-colors"
                    >
                        <Plus size={16} /> New Add-On
                    </button>
                </div>
            </div>

            {showAddForm && (
                <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 mb-6">
                    <h3 className="font-bold text-stone-900 mb-4">New Add-On</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-saffron"
                                placeholder="e.g., Breakfast"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Price (₹) *</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-saffron"
                                placeholder="600"
                                min="0"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Description</label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-saffron"
                                placeholder="Brief description of the service"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={handleAdd}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 bg-saffron text-stone-900 text-sm font-bold rounded-lg hover:bg-saffron/90 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check size={16} />}
                            Create
                        </button>
                        <button
                            onClick={() => setShowAddForm(false)}
                            className="px-4 py-2 border border-stone-200 text-stone-600 text-sm font-bold rounded-lg hover:bg-stone-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {addOns.length === 0 && !showAddForm ? (
                <div className="bg-stone-800 border border-stone-700 rounded-lg p-12 text-center">
                    <p className="text-stone-400 mb-4">No add-ons configured yet.</p>
                    <button
                        onClick={handleAddDefault}
                        disabled={isSaving}
                        className="px-6 py-3 bg-saffron text-stone-900 font-bold rounded-lg hover:bg-saffron/90 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? "Adding..." : "Add Default Add-Ons"}
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-stone-50 border-b border-stone-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Add-On</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-stone-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-stone-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {addOns.map((addon) => (
                                <tr key={addon._id} className="hover:bg-stone-50/50 transition-colors">
                                    {editingId === addon._id ? (
                                        <>
                                            <td className="px-6 py-4" colSpan={4}>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                                                    <input
                                                        type="text"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        className="px-3 py-2 border border-stone-200 rounded focus:outline-none focus:border-saffron text-sm"
                                                    />
                                                    <input
                                                        type="number"
                                                        value={formData.price}
                                                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                                        className="px-3 py-2 border border-stone-200 rounded focus:outline-none focus:border-saffron text-sm"
                                                        min="0"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={formData.description}
                                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                        className="px-3 py-2 border border-stone-200 rounded focus:outline-none focus:border-saffron text-sm md:col-span-2"
                                                        placeholder="Description"
                                                    />
                                                </div>
                                                <div className="flex gap-2 mt-3">
                                                    <button
                                                        onClick={() => handleUpdate(addon._id)}
                                                        disabled={isSaving}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-saffron text-stone-900 text-xs font-bold rounded hover:bg-saffron/90 disabled:opacity-50"
                                                    >
                                                        {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check size={12} />}
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={cancelEdit}
                                                        className="px-3 py-1.5 border border-stone-200 text-stone-600 text-xs font-bold rounded hover:bg-stone-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-bold text-stone-900">{addon.name}</p>
                                                    {addon.description && (
                                                        <p className="text-xs text-stone-500 mt-0.5">{addon.description}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-stone-900">₹{addon.price.toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggleActive(addon)}
                                                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                                                        addon.isActive
                                                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                            : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                                                    }`}
                                                >
                                                    {addon.isActive ? "Active" : "Inactive"}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => startEdit(addon)}
                                                        className="p-2 text-stone-400 hover:text-saffron hover:bg-stone-100 rounded transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(addon._id)}
                                                        className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
