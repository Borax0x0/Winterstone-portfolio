"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Image as ImageIcon, X, Upload, Save, DoorOpen, Home } from "lucide-react";
import toast from "react-hot-toast";

interface Room {
    _id: string;
    slug: string;
    name: string;
    price: number;
    description: string;
    amenities: string[];
    heroImage: string;
    gallery: string[];
    isActive: boolean;
    displayOrder: number;
}

interface RoomUnit {
    _id: string;
    name: string;
    roomTypeSlug: string;
    isActive: boolean;
}

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [units, setUnits] = useState<RoomUnit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Room Modal State
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isNewRoom, setIsNewRoom] = useState(false);
    
    // Inventory Modal State
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
    const [selectedRoomForInventory, setSelectedRoomForInventory] = useState<Room | null>(null);
    const [newUnitName, setNewUnitName] = useState("");
    const [isAddingUnit, setIsAddingUnit] = useState(false);

    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadType, setUploadType] = useState<'hero' | 'gallery'>('gallery');

    // Form state for editing/creating
    const [formData, setFormData] = useState({
        slug: '',
        name: '',
        price: 0,
        description: '',
        amenities: [] as string[],
        heroImage: '',
        gallery: [] as string[],
        isActive: true,
    });
    const [newAmenity, setNewAmenity] = useState('');

    // Fetch rooms & units
    const fetchData = async () => {
        try {
            const [roomsRes, unitsRes] = await Promise.all([
                fetch('/api/rooms'),
                fetch('/api/rooms/units')
            ]);
            
            if (roomsRes.ok) {
                const data = await roomsRes.json();
                setRooms(data);
            }
            if (unitsRes.ok) {
                const data = await unitsRes.json();
                setUnits(data);
            }
        } catch {
            toast.error('Failed to fetch data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Open modal for new room
    const handleNewRoom = () => {
        setFormData({
            slug: '',
            name: '',
            price: 0,
            description: '',
            amenities: [],
            heroImage: '/placeholder-room.jpg',
            gallery: [],
            isActive: true,
        });
        setIsNewRoom(true);
        setEditingRoom(null);
        setIsModalOpen(true);
    };

    // Open modal for editing
    const handleEdit = (room: Room) => {
        setFormData({
            slug: room.slug,
            name: room.name,
            price: room.price,
            description: room.description,
            amenities: room.amenities,
            heroImage: room.heroImage,
            gallery: room.gallery,
            isActive: room.isActive,
        });
        setIsNewRoom(false);
        setEditingRoom(room);
        setIsModalOpen(true);
    };

    // Save room (create or update)
    const handleSave = async () => {
        try {
            if (isNewRoom) {
                const res = await fetch('/api/rooms', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.error);
                }
                toast.success('Room created successfully');
            } else if (editingRoom) {
                const res = await fetch(`/api/rooms/${editingRoom.slug}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.error);
                }
                toast.success('Room updated successfully');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to save room';
            toast.error(errorMessage);
        }
    };

    // Delete room
    const handleDelete = async (room: Room) => {
        if (!confirm(`Are you sure you want to delete "${room.name}"? This cannot be undone.`)) {
            return;
        }
        try {
            const res = await fetch(`/api/rooms/${room.slug}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            toast.success('Room deleted');
            fetchData();
        } catch {
            toast.error('Failed to delete room');
        }
    };

    // Handle image upload
    const handleImageUpload = async (file: File) => {
        if (!editingRoom && !isNewRoom) return;

        setUploadingImage(true);
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);
        formDataUpload.append('type', uploadType);

        try {
            // For new rooms, we need to save the room first
            if (isNewRoom) {
                toast.error('Please save the room first before uploading images');
                return;
            }

            const res = await fetch(`/api/rooms/${editingRoom!.slug}/images`, {
                method: 'POST',
                body: formDataUpload,
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error);
            }

            const data = await res.json();
            
            if (uploadType === 'hero') {
                setFormData(prev => ({ ...prev, heroImage: data.imageUrl }));
            } else {
                setFormData(prev => ({ ...prev, gallery: [...prev.gallery, data.imageUrl] }));
            }
            
            toast.success('Image uploaded successfully');
            fetchData();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
            toast.error(errorMessage);
        } finally {
            setUploadingImage(false);
        }
    };

    // Remove gallery image
    const handleRemoveGalleryImage = async (imageUrl: string) => {
        if (!editingRoom) return;

        try {
            const res = await fetch(`/api/rooms/${editingRoom.slug}/images`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error);
            }

            setFormData(prev => ({
                ...prev,
                gallery: prev.gallery.filter(img => img !== imageUrl)
            }));
            toast.success('Image removed');
            fetchData();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to remove image';
            toast.error(errorMessage);
        }
    };

    // Add amenity
    const handleAddAmenity = () => {
        if (newAmenity.trim()) {
            setFormData(prev => ({
                ...prev,
                amenities: [...prev.amenities, newAmenity.trim()]
            }));
            setNewAmenity('');
        }
    };

    // Remove amenity
    const handleRemoveAmenity = (index: number) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.filter((_, i) => i !== index)
        }));
    };

    // Handle Inventory Modal
    const handleOpenInventory = (room: Room) => {
        setSelectedRoomForInventory(room);
        setNewUnitName("");
        setIsInventoryOpen(true);
    };

    // Add Unit
    const handleAddUnit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRoomForInventory || !newUnitName.trim()) return;

        setIsAddingUnit(true);
        try {
            const res = await fetch('/api/rooms/units', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newUnitName,
                    roomTypeSlug: selectedRoomForInventory.slug,
                }),
            });

            if (!res.ok) throw new Error('Failed to add unit');
            
            toast.success('Unit added');
            setNewUnitName("");
            fetchData(); // Refresh list to see new unit
        } catch (error) {
            toast.error("Failed to add unit");
        } finally {
            setIsAddingUnit(false);
        }
    };

    // Delete Unit
    const handleDeleteUnit = async (id: string) => {
        if (!confirm("Delete this physical room?")) return;
        try {
            await fetch(`/api/rooms/units?id=${id}`, { method: 'DELETE' });
            toast.success('Unit deleted');
            setUnits(prev => prev.filter(u => u._id !== id));
        } catch (error) {
            toast.error("Failed to delete unit");
        }
    };

    return (
        <div>
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white">Rooms</h1>
                    <p className="text-stone-400 text-sm mt-1">Manage room listings, prices, and images</p>
                </div>
                <button
                    onClick={handleNewRoom}
                    className="flex items-center gap-2 bg-saffron hover:bg-saffron/90 text-stone-900 px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                >
                    <Plus size={18} />
                    Add Room
                </button>
            </div>

            {/* ROOMS GRID */}
            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin h-8 w-8 border-2 border-saffron border-t-transparent rounded-full"></div>
                </div>
            ) : rooms.length === 0 ? (
                <div className="bg-white rounded-lg border border-stone-200 p-12 text-center">
                    <ImageIcon size={48} className="mx-auto text-stone-300 mb-4" />
                    <h3 className="text-lg font-bold text-stone-700 mb-2">No Rooms Yet</h3>
                    <p className="text-stone-500 mb-6">Create your first room to get started</p>
                    <button
                        onClick={handleNewRoom}
                        className="bg-saffron hover:bg-saffron/90 text-stone-900 px-6 py-2 rounded-lg font-bold text-sm"
                    >
                        Add Your First Room
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map((room) => (
                        <div
                            key={room._id}
                            className="bg-white rounded-lg border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                            {/* Room Image */}
                            <div className="relative h-48 bg-stone-100">
                                <Image
                                    src={room.heroImage}
                                    alt={room.name}
                                    fill
                                    className="object-cover"
                                />
                                {!room.isActive && (
                                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                        Inactive
                                    </div>
                                )}
                            </div>

                            {/* Room Info */}
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-stone-900">{room.name}</h3>
                                    <span className="text-saffron font-bold">₹{room.price.toLocaleString()}</span>
                                </div>
                                <p className="text-stone-500 text-sm line-clamp-2 mb-4">
                                    {room.description}
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOpenInventory(room)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-xs font-bold uppercase tracking-wider transition-colors"
                                            title="Manage Inventory"
                                        >
                                            <DoorOpen size={14} />
                                            {units.filter(u => u.roomTypeSlug === room.slug).length} Units
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(room)}
                                            className="p-2 text-stone-400 hover:text-saffron hover:bg-stone-100 rounded transition-colors"
                                            title="Edit Room"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(room)}
                                            className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                            title="Delete Room"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* EDIT/CREATE MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-stone-200 sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-stone-900">
                                {isNewRoom ? 'Create New Room' : `Edit: ${editingRoom?.name}`}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-stone-700 mb-2">
                                        Room Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-saffron"
                                        placeholder="e.g., Skyline Haven"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-stone-700 mb-2">
                                        Slug * {isNewRoom && <span className="font-normal text-stone-400">(URL-friendly)</span>}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                                        disabled={!isNewRoom}
                                        className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-saffron disabled:bg-stone-50 disabled:text-stone-500"
                                        placeholder="e.g., skyline-haven"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-stone-700 mb-2">
                                        Price per Night (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                                        className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-saffron"
                                        placeholder="8500"
                                    />
                                </div>
                                <div className="flex items-center gap-4 pt-8">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                            className="w-4 h-4 accent-saffron"
                                        />
                                        <span className="text-sm text-stone-700">Active (visible on website)</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-stone-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-saffron resize-none"
                                    placeholder="Describe the room experience..."
                                />
                            </div>

                            {/* Amenities */}
                            <div>
                                <label className="block text-sm font-bold text-stone-700 mb-2">
                                    Amenities
                                </label>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={newAmenity}
                                        onChange={(e) => setNewAmenity(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
                                        className="flex-1 px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-saffron"
                                        placeholder="Add amenity..."
                                    />
                                    <button
                                        onClick={handleAddAmenity}
                                        className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.amenities.map((amenity, index) => (
                                        <span
                                            key={index}
                                            className="flex items-center gap-1 bg-stone-100 px-3 py-1 rounded-full text-sm"
                                        >
                                            {amenity}
                                            <button
                                                onClick={() => handleRemoveAmenity(index)}
                                                className="hover:text-red-500"
                                            >
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Hero Image */}
                            <div>
                                <label className="block text-sm font-bold text-stone-700 mb-2">
                                    Hero Image (Main Cover)
                                </label>
                                <div className="flex gap-4 items-start">
                                    <div className="w-48 h-32 bg-stone-100 rounded-lg overflow-hidden border border-stone-200 relative">
                                        <Image
                                            src={formData.heroImage || '/placeholder-room.jpg'}
                                            alt="Hero"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={formData.heroImage}
                                            onChange={(e) => setFormData(prev => ({ ...prev, heroImage: e.target.value }))}
                                            className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-saffron mb-2"
                                            placeholder="/images/room-hero.jpg"
                                        />
                                        {!isNewRoom && (
                                            <button
                                                onClick={() => {
                                                    setUploadType('hero');
                                                    fileInputRef.current?.click();
                                                }}
                                                disabled={uploadingImage}
                                                className="flex items-center gap-2 text-sm text-saffron hover:underline disabled:opacity-50"
                                            >
                                                <Upload size={14} />
                                                {uploadingImage ? 'Uploading...' : 'Upload new hero image'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Gallery Images */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-bold text-stone-700">
                                        Gallery Images
                                    </label>
                                    {!isNewRoom && (
                                        <button
                                            onClick={() => {
                                                setUploadType('gallery');
                                                fileInputRef.current?.click();
                                            }}
                                            disabled={uploadingImage}
                                            className="flex items-center gap-1 text-sm text-saffron hover:underline disabled:opacity-50"
                                        >
                                            <Plus size={14} />
                                            Add Image
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {formData.gallery.map((img, index) => (
                                        <div key={index} className="relative group">
                                            <div className="aspect-video bg-stone-100 rounded-lg overflow-hidden border border-stone-200 relative">
                                                <Image
                                                    src={img}
                                                    alt={`Gallery ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleRemoveGalleryImage(img)}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.gallery.length === 0 && (
                                        <div className="col-span-3 py-8 text-center text-stone-400 text-sm border-2 border-dashed border-stone-200 rounded-lg">
                                            {isNewRoom ? 'Save room first to upload images' : 'No gallery images yet'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageUpload(file);
                                    e.target.value = '';
                                }}
                            />
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-stone-200 sticky bottom-0 bg-white">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-6 py-2 bg-saffron hover:bg-saffron/90 text-stone-900 font-bold rounded-lg transition-colors"
                            >
                                <Save size={16} />
                                {isNewRoom ? 'Create Room' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* INVENTORY MODAL */}
            {isInventoryOpen && selectedRoomForInventory && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-stone-50 p-6 border-b border-stone-200 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg text-stone-900">Manage Inventory</h3>
                                <p className="text-stone-500 text-sm">{selectedRoomForInventory.name}</p>
                            </div>
                            <button
                                onClick={() => setIsInventoryOpen(false)}
                                className="p-2 hover:bg-stone-200 rounded-full transition-colors"
                            >
                                <X size={20} className="text-stone-500" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            {/* Add Form */}
                            <form onSubmit={handleAddUnit} className="flex gap-2 mb-6">
                                <input
                                    type="text"
                                    value={newUnitName}
                                    onChange={(e) => setNewUnitName(e.target.value)}
                                    placeholder="Unit Name (e.g. 101)"
                                    className="flex-1 px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-saffron"
                                />
                                <button
                                    type="submit"
                                    disabled={isAddingUnit || !newUnitName.trim()}
                                    className="px-4 py-2 bg-stone-900 text-white font-bold rounded-lg hover:bg-saffron hover:text-stone-900 transition-colors disabled:opacity-50"
                                >
                                    {isAddingUnit ? "..." : <Plus size={20} />}
                                </button>
                            </form>

                            {/* List */}
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {units.filter(u => u.roomTypeSlug === selectedRoomForInventory.slug).length > 0 ? (
                                    units
                                        .filter(u => u.roomTypeSlug === selectedRoomForInventory.slug)
                                        .map(unit => (
                                            <div key={unit._id} className="flex justify-between items-center p-3 bg-stone-50 border border-stone-100 rounded-lg group">
                                                <div className="flex items-center gap-3">
                                                    <Home size={16} className="text-stone-400" />
                                                    <span className="font-medium text-stone-700">{unit.name}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteUnit(unit._id)}
                                                    className="text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))
                                ) : (
                                    <div className="text-center py-8 text-stone-400 text-sm border-2 border-dashed border-stone-100 rounded-lg">
                                        No physical rooms added yet.
                                        <br />
                                        Availability defaults to 1.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
