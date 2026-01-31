"use client";

import React, { useState, useEffect } from "react";
import { Star, Send, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/**
 * ReviewForm Component
 * 
 * Props:
 * - roomSlug: Which room this review is for
 * - onSuccess: Optional callback after successful submission
 * 
 * Features:
 * - 5-star rating picker (clickable stars)
 * - Text comment field
 * - Name and email fields
 * - Loading/success states
 */

interface ReviewFormProps {
    roomSlug: string;
    onSuccess?: () => void;
}

export default function ReviewForm({ roomSlug, onSuccess }: ReviewFormProps) {
    // Get logged-in user info (to auto-fill name/email)
    const { user } = useAuth();

    // Form state
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [guestName, setGuestName] = useState("");
    const [guestEmail, setGuestEmail] = useState("");

    // UI state
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    // Auto-fill user info when logged in (but still editable)
    useEffect(() => {
        if (user) {
            setGuestName(user.name || "");
            setGuestEmail(user.email || "");
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate
        if (rating === 0) {
            setMessage("Please select a rating");
            setStatus("error");
            return;
        }
        if (!guestName.trim() || !guestEmail.trim()) {
            setMessage("Please enter your name and email");
            setStatus("error");
            return;
        }

        setStatus("loading");
        setMessage("");

        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    roomSlug,
                    rating,
                    comment,
                    guestName,
                    guestEmail,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to submit review");
            }

            setStatus("success");
            setMessage(data.message);

            // Reset form
            setRating(0);
            setComment("");
            setGuestName("");
            setGuestEmail("");

            onSuccess?.();

        } catch (error: any) {
            setStatus("error");
            setMessage(error.message);
        }
    };

    // Render stars
    const renderStars = () => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-110"
                    >
                        <Star
                            size={24}
                            className={`transition-colors ${star <= (hoverRating || rating)
                                ? "fill-saffron text-saffron"
                                : "text-stone-300"
                                }`}
                        />
                    </button>
                ))}
            </div>
        );
    };

    if (status === "success") {
        return (
            <div className="bg-green-50 border border-green-200 p-6 rounded-sm text-center">
                <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
                <p className="text-green-800 font-medium">{message}</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Star Rating */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Your Rating
                </label>
                {renderStars()}
            </div>

            {/* Comment */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Your Review (Optional)
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience..."
                    rows={4}
                    maxLength={1000}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron resize-none"
                />
            </div>

            {/* Name & Email Row */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                        Your Name
                    </label>
                    <input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                        Your Email
                    </label>
                    <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron"
                    />
                </div>
            </div>

            {/* Error message */}
            {status === "error" && (
                <p className="text-red-500 text-sm">{message}</p>
            )}

            {/* Submit button */}
            <button
                type="submit"
                disabled={status === "loading"}
                className="w-full flex items-center justify-center gap-2 bg-stone-900 text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-saffron hover:text-stone-900 transition-colors disabled:opacity-50"
            >
                {status === "loading" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <>
                        <Send size={14} />
                        Submit Review
                    </>
                )}
            </button>
        </form>
    );
}
