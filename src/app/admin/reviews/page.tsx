"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Star,
    Trash2,
    Loader2,
    MessageSquare,
} from "lucide-react";

/**
 * Admin Reviews Page
 * 
 * Shows all reviews and lets admin delete inappropriate ones.
 * Reviews are auto-published - no approval needed.
 */

interface Review {
    _id: string;
    roomSlug: string;
    rating: number;
    comment: string;
    guestName: string;
    guestEmail: string;
    createdAt: string;
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/reviews?all=true");
            const data = await res.json();
            if (res.ok) {
                setReviews(data.reviews);
            }
        } catch (error) {
            console.error("Failed to fetch reviews:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Permanently delete this review?")) return;

        setActionLoading(id);
        try {
            const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
            if (res.ok) {
                setReviews(reviews.filter(r => r._id !== id));
            }
        } catch (error) {
            console.error("Failed to delete:", error);
        } finally {
            setActionLoading(null);
        }
    };

    const renderStars = (rating: number) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={12}
                    className={star <= rating ? "fill-amber-400 text-amber-400" : "text-stone-600"}
                />
            ))}
        </div>
    );

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="min-h-screen bg-stone-950 text-white">
            {/* Header */}
            <div className="bg-stone-900 border-b border-stone-800">
                <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin"
                            className="p-2 hover:bg-stone-800 rounded-lg transition"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Guest Reviews</h1>
                            <p className="text-sm text-stone-400">
                                {reviews.length} review{reviews.length !== 1 ? 's' : ''} total
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-stone-500" />
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-20 text-stone-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-stone-700" />
                        <p>No reviews yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <div
                                key={review._id}
                                className="bg-stone-900 border border-stone-800 rounded-lg p-6"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    {/* Left: Review Content */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-semibold">{review.guestName}</span>
                                            {renderStars(review.rating)}
                                        </div>

                                        <p className="text-stone-400 text-sm mb-3">
                                            {review.comment || <em className="text-stone-600">No comment</em>}
                                        </p>

                                        <div className="flex gap-4 text-xs text-stone-500">
                                            <span>Room: <strong className="text-stone-300">{review.roomSlug}</strong></span>
                                            <span>Email: {review.guestEmail}</span>
                                            <span>{formatDate(review.createdAt)}</span>
                                        </div>
                                    </div>

                                    {/* Right: Delete Button */}
                                    <div>
                                        {actionLoading === review._id ? (
                                            <Loader2 className="w-5 h-5 animate-spin text-stone-500" />
                                        ) : (
                                            <button
                                                onClick={() => handleDelete(review._id)}
                                                className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition"
                                                title="Delete Review"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
