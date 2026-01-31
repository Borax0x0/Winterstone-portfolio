"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { useState, useEffect } from "react"; // Added hooks

function VerifyContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    // Local state for verification status
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setErrorMessage("missing_token");
            return;
        }

        const verifyToken = async () => {
            try {
                const res = await fetch(`/api/auth/verify?token=${token}`);
                const data = await res.json();

                if (res.ok && data.verified) {
                    setStatus('success');
                } else {
                    setStatus('error');
                    setErrorMessage(data.error || "verification_failed");
                }
            } catch (error) {
                setStatus('error');
                setErrorMessage("verification_failed");
            }
        };

        verifyToken();
    }, [token]);

    if (status === 'success') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="font-serif text-3xl font-bold text-stone-900 mb-4">
                    Email Verified!
                </h1>
                <p className="text-stone-600 mb-8">
                    Your account has been verified successfully. You can now sign in.
                </p>
                <Link
                    href="/"
                    className="inline-block bg-stone-900 text-white px-8 py-3 text-sm font-bold tracking-widest uppercase hover:bg-saffron hover:text-stone-900 transition-colors"
                >
                    Continue to Booking
                </Link>
            </motion.div>
        );
    }

    if (status === 'error') {
        const errorText: Record<string, string> = {
            missing_token: "Invalid verification link (Token missing).",
            invalid_or_expired_token: "This verification link has expired or is invalid.",
            verification_failed: "Verification failed. Please try again.",
        };

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-10 h-10 text-red-600" />
                </div>
                <h1 className="font-serif text-3xl font-bold text-stone-900 mb-4">
                    Verification Failed
                </h1>
                <p className="text-stone-600 mb-8">
                    {errorText[errorMessage] || "An error occurred during verification."}
                </p>
                <Link
                    href="/"
                    className="inline-block bg-stone-900 text-white px-8 py-3 text-sm font-bold tracking-widest uppercase hover:bg-saffron hover:text-stone-900 transition-colors"
                >
                    Back to Home
                </Link>
            </motion.div>
        );
    }

    return (
        <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-stone-400 mx-auto mb-4" />
            <p className="text-stone-600">Verifying your email...</p>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
            <div className="bg-white p-12 shadow-xl max-w-md w-full">
                <Suspense fallback={
                    <div className="text-center">
                        <Loader2 className="w-10 h-10 animate-spin text-stone-400 mx-auto mb-4" />
                        <p className="text-stone-600">Loading...</p>
                    </div>
                }>
                    <VerifyContent />
                </Suspense>
            </div>
        </div>
    );
}
