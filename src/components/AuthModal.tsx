"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, ArrowRight, Loader2, AlertCircle, X, CheckCircle, Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";

type AuthMode = "signin" | "signup" | "forgot-password";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultMode?: AuthMode;
}

export default function AuthModal({ isOpen, onClose, defaultMode = "signin" }: AuthModalProps) {
    const { login } = useAuth();
    const [authMode, setAuthMode] = useState<AuthMode>(defaultMode);

    React.useEffect(() => {
        if (isOpen) {
            setAuthMode(defaultMode);
        }
    }, [isOpen, defaultMode]);

    // Form States
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Feedback States
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const resetForm = () => {
        setError("");
        setSuccessMsg("");
        setEmail("");
        setPassword("");
        setName("");
    };

    const handleClose = () => {
        resetForm();
        setAuthMode(defaultMode);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccessMsg("");

        // Simulate Network Delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            if (authMode === "forgot-password") {
                if (!email.includes("@")) {
                    throw new Error("Please enter a valid email");
                }

                // Call real reset password API
                const response = await fetch('/api/auth/reset-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to send reset link');
                }

                setSuccessMsg("If an account exists with this email, you'll receive a reset link. Check your console (dev) or email.");
                setIsLoading(false);
                return;
            }

            if (authMode === "signup") {
                if (name.length < 2 || !email.includes("@") || password.length < 6) {
                    throw new Error("Please provide valid details (Password min 6 chars)");
                }

                // Call registration API
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Registration failed');
                }

                // Auto-login after successful signup
                await login(name, email, "guest", password);
                handleClose();
                return;
            }

            // Sign In Logic - both admin and guest use same DB-backed auth
            if (!email.includes("@") || password.length < 1) {
                throw new Error("Please enter valid email and password");
            }
            await login("", email, "guest", password); // Role determined by DB
            handleClose();
        } catch (err: unknown) {
            console.error("Auth Fail:", err);
            const errorMessage = err instanceof Error ? err.message : "Something went wrong";
            // Translate generic error if needed
            if (errorMessage === "Invalid credentials") {
                setError("Incorrect email or password");
            } else {
                setError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* BACKDROP */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 z-[60] bg-stone-900/60 backdrop-blur-sm"
                    />

                    {/* MODAL */}
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-stone-50 w-full max-w-md shadow-2xl overflow-hidden pointer-events-auto relative"
                        >
                            {/* CLOSE BUTTON */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 transition-colors z-10"
                            >
                                <X size={20} />
                            </button>

                            <div className="p-8 sm:p-12">
                                {/* HEADER */}
                                <div className="text-center mb-6">
                                    <h2 className="font-serif text-3xl font-bold text-stone-900 mb-2">
                                        {authMode === "signin" && "Welcome Back"}
                                        {authMode === "signup" && "Join Winterstone"}
                                        {authMode === "forgot-password" && "Reset Password"}
                                    </h2>
                                    <p className="text-stone-500 text-sm">
                                        {authMode === "signin" && "Sign in to access your dashboard"}
                                        {authMode === "signup" && "Create an account to manage bookings"}
                                        {authMode === "forgot-password" && "Enter your email to receive a reset link"}
                                    </p>
                                </div>



                                {/* FEEDBACK ALERTS */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="bg-red-50 text-red-600 px-4 py-3 rounded text-xs flex items-center gap-2 mb-6"
                                        >
                                            <AlertCircle size={14} />
                                            {error}
                                        </motion.div>
                                    )}
                                    {successMsg && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="bg-green-50 text-green-600 px-4 py-3 rounded text-xs flex items-center gap-2 mb-6"
                                        >
                                            <CheckCircle size={14} />
                                            {successMsg}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* GOOGLE SSO BUTTON */}
                                {(authMode === "signin" || authMode === "signup") && (
                                    <>
                                        <button
                                            onClick={() => signIn("google", { callbackUrl: window.location.href })}
                                            className="w-full bg-white border border-stone-200 py-3 text-sm font-bold tracking-widest text-stone-700 flex items-center justify-center gap-3 hover:bg-stone-50 transition-colors mb-4"
                                        >
                                            {/* Google "G" SVG */}
                                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                            </svg>
                                            CONTINUE WITH GOOGLE
                                        </button>

                                        <div className="relative my-6">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-stone-200" />
                                            </div>
                                            <div className="relative flex justify-center text-xs text-stone-400 font-bold tracking-widest uppercase">
                                                <span className="bg-stone-50 px-3">or use email</span>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* FORM */}
                                <form onSubmit={handleSubmit} className="space-y-4">

                                    {/* Name Field (Signup only) */}
                                    {authMode === "signup" && (
                                        <div className="relative">
                                            <User className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 text-sm focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all"
                                                placeholder={authMode === "signup" ? "Full Name" : "Guest Name"}
                                            />
                                        </div>
                                    )}

                                    {/* Email Field (Always visible) */}
                                    <div className="relative">
                                        <User className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 text-sm focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all"
                                            placeholder="Email Address"
                                        />
                                    </div>

                                    {/* Password Field (Sign In & Support) */}
                                    {(authMode === "signup" || authMode === "signin") && (
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full pl-10 pr-12 py-3 bg-white border border-stone-200 text-sm focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all"
                                                placeholder="Password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-3.5 text-stone-400 hover:text-stone-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    )}

                                    {/* Forgot Password Link */}
                                    {authMode === "signin" && (
                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => { setAuthMode("forgot-password"); resetForm(); }}
                                                className="text-[10px] text-stone-400 hover:text-saffron uppercase font-bold tracking-wider"
                                            >
                                                Forgot Password?
                                            </button>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-stone-900 text-white py-3 text-xs font-bold tracking-widest uppercase hover:bg-saffron hover:text-stone-900 transition-colors flex items-center justify-center gap-2 group mt-6"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                {authMode === "signin" && "Sign In"}
                                                {authMode === "signup" && "Create Account"}
                                                {authMode === "forgot-password" && "Send Reset Link"}
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* FOOTER LINKS */}
                                <div className="mt-6 text-center text-xs text-stone-400 space-y-2">
                                    {authMode === "signin" ? (
                                        <p>
                                            New here?{" "}
                                            <button
                                                onClick={() => { setAuthMode("signup"); resetForm(); }}
                                                className="text-stone-900 hover:text-saffron font-bold underline decoration-1 underline-offset-2"
                                            >
                                                Create an account
                                            </button>
                                        </p>
                                    ) : (
                                        <p>
                                            Already have an account?{" "}
                                            <button
                                                onClick={() => { setAuthMode("signin"); resetForm(); }}
                                                className="text-stone-900 hover:text-saffron font-bold underline decoration-1 underline-offset-2"
                                            >
                                                Sign in
                                            </button>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
