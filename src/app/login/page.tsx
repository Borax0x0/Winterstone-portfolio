"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail, Loader2 } from "lucide-react";

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            await login("Admin User", email, "admin", password);
        } catch (err: any) {
            setError(err.message || "Invalid credentials. Try admin@winterstone.com / admin123");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-950 px-4">
            <div className="bg-white w-full max-w-md p-8 rounded-sm shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="font-serif text-3xl font-bold text-stone-900">Admin Access</h1>
                    <p className="text-stone-500 text-sm mt-2">Enter your secured credentials.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 text-xs p-3 rounded-sm mb-6 border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold tracking-widest uppercase text-stone-500 mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all rounded-sm text-stone-900"
                                placeholder="admin@winterstone.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold tracking-widest uppercase text-stone-500 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all rounded-sm text-stone-900"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-stone-900 text-white py-4 text-xs font-bold tracking-widest uppercase hover:bg-saffron hover:text-stone-900 transition-colors flex items-center justify-center gap-2 rounded-sm"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Secure Login"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest">Authorized Personnel Only</p>
                </div>
            </div>
        </div>
    );
}
