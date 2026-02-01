"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/reset-password/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to reset password");
            }

            setSuccess(true);
            setTimeout(() => router.push("/"), 3000);

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to reset password';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-stone-900 mb-2">Invalid Link</h2>
                <p className="text-stone-600 mb-6">This password reset link is invalid or has expired.</p>
                <Link href="/" className="text-saffron hover:underline">
                    Return to Home
                </Link>
            </div>
        );
    }

    if (success) {
        return (
            <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-stone-900 mb-2">Password Reset!</h2>
                <p className="text-stone-600 mb-6">Your password has been updated. Redirecting to login...</p>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2 text-center">
                Reset Password
            </h2>
            <p className="text-stone-600 text-sm text-center mb-8">
                Enter your new password below.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                        New Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-12 pr-12 py-3 border border-stone-200 focus:outline-none focus:border-saffron text-sm"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-3.5 text-stone-400 hover:text-stone-600"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-12 pr-4 py-3 border border-stone-200 focus:outline-none focus:border-saffron text-sm"
                            required
                        />
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                        <AlertCircle size={14} />
                        {error}
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-stone-900 text-white py-3 text-xs font-bold tracking-widest uppercase hover:bg-saffron hover:text-stone-900 transition-colors disabled:opacity-50"
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                        "Reset Password"
                    )}
                </button>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
            <div className="bg-white p-12 shadow-xl max-w-md w-full">
                <Suspense fallback={
                    <div className="text-center">
                        <Loader2 className="w-10 h-10 animate-spin text-stone-400 mx-auto mb-4" />
                        <p className="text-stone-600">Loading...</p>
                    </div>
                }>
                    <ResetPasswordContent />
                </Suspense>
            </div>
        </div>
    );
}
