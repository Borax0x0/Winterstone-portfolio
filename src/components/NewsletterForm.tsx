"use client";

import React, { useState } from "react";
import { Mail, ArrowRight, Loader2, CheckCircle } from "lucide-react";

/**
 * NewsletterForm Component
 * 
 * Props:
 * - variant: "vertical" (default) or "horizontal" for footer row layout
 */

interface NewsletterFormProps {
    variant?: "vertical" | "horizontal";
}

export default function NewsletterForm({ variant = "vertical" }: NewsletterFormProps) {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (status === "loading" || !email.trim()) return;

        setStatus("loading");
        setMessage("");

        try {
            const res = await fetch("/api/newsletter/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Subscription failed");
            }

            setStatus("success");
            setMessage(data.message);
            setEmail("");

        } catch (error: unknown) {
            setStatus("error");
            const errorMessage = error instanceof Error ? error.message : "Something went wrong";
            setMessage(errorMessage);
        }
    };

    // Horizontal layout for footer row
    if (variant === "horizontal") {
        return (
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                <div className="text-center md:text-left">
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-1">Stay Updated</h4>
                    <p className="text-xs opacity-60">Subscribe for exclusive offers & alpine news</p>
                </div>

                {status === "success" ? (
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                        <CheckCircle size={16} />
                        <span>{message}</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex gap-3 w-full md:w-auto">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            disabled={status === "loading"}
                            className="flex-1 md:w-72 px-4 py-2.5 bg-stone-900 border border-stone-800 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-saffron disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={status === "loading" || !email.trim()}
                            className="px-6 py-2.5 bg-white text-stone-900 text-xs font-bold uppercase tracking-widest hover:bg-saffron transition-colors whitespace-nowrap disabled:opacity-50"
                        >
                            {status === "loading" ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "Subscribe"
                            )}
                        </button>
                        {status === "error" && (
                            <p className="text-red-400 text-xs absolute mt-12">{message}</p>
                        )}
                    </form>
                )}
            </div>
        );
    }

    // Default vertical layout
    return (
        <div className="space-y-4">
            <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-2">
                    Stay Updated
                </h4>
                <p className="text-xs opacity-60">
                    Subscribe for exclusive offers & alpine news
                </p>
            </div>

            {status === "success" ? (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                    <CheckCircle size={16} />
                    <span>{message}</span>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-stone-500" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            disabled={status === "loading"}
                            className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-800 text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-saffron transition-colors disabled:opacity-50"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status === "loading" || !email.trim()}
                        className="w-full flex items-center justify-center gap-2 bg-white text-stone-900 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-saffron transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {status === "loading" ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                Subscribe
                                <ArrowRight size={14} />
                            </>
                        )}
                    </button>

                    {status === "error" && (
                        <p className="text-red-400 text-xs">{message}</p>
                    )}
                </form>
            )}
        </div>
    );
}
