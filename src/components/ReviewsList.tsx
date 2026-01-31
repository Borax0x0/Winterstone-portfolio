"use client";

import React, { useEffect, useState } from "react";
import { Star, Loader2, MessageSquare } from "lucide-react";

/**
 * ReviewsList Component
 * 
 * Displays reviews for a specific room.
 * Fetches approved reviews from the API and renders them.
 */

interface Review {
    _id: string;
    rating: number;
    comment: string;
    guestName: string;
    createdAt: string;
}

interface ReviewsListProps {
    roomSlug: string;
    refreshTrigger?: number;  // Change this to force refresh
}

export default function ReviewsList({ roomSlug, refreshTrigger }: ReviewsListProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [averageRating, setAverageRating] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, [roomSlug, refreshTrigger]);

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/reviews?room=${roomSlug}`);
            const data = await res.json();
            if (res.ok) {
                setReviews(data.reviews);
                setAverageRating(data.averageRating);
            }
        } catch (error) {
            console.error("Failed to fetch reviews:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Render star rating (static, display-only)
    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={14}
                        className={
                            star <= rating
                                ? "fill-saffron text-saffron"
                                : "text-stone-300"
                        }
                    />
                ))}
            </div>
        );
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            month: 'short',
            year: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-12 text-stone-500">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 text-stone-300" />
                <p>No reviews yet.</p>
                <p className="text-sm mt-1">Be the first to share your experience!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-stone-200">
                <div className="flex items-center gap-2">
                    {renderStars(Math.round(averageRating))}
                    <span className="text-lg font-bold text-stone-900">{averageRating}</span>
                </div>
                <span className="text-stone-500 text-sm">
                    {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </span>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
                {reviews.map((review) => (
                    <div key={review._id} className="pb-6 border-b border-stone-100 last:border-0">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <p className="font-semibold text-stone-900">{review.guestName}</p>
                                <p className="text-xs text-stone-400">{formatDate(review.createdAt)}</p>
                            </div>
                            {renderStars(review.rating)}
                        </div>
                        {review.comment && (
                            <p className="text-stone-600 text-sm leading-relaxed mt-2">
                                {review.comment}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
