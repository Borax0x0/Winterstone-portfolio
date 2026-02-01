"use client";
import React, { useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    
    // Derive authorization state from user data (no setState needed)
    const isAuthorized = useMemo(() => {
        if (isLoading || !user) return false;
        return user.role === "admin" || user.role === "superadmin";
    }, [user, isLoading]);

    // Handle redirect in useEffect (side effect only, no setState)
    useEffect(() => {
        if (!isLoading && !isAuthorized) {
            router.push("/"); // Redirect unauthorized users to home
        }
    }, [isLoading, isAuthorized, router]);

    // Show loading spinner while Auth checks
    if (isLoading || !isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-950">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
                    <p className="font-serif text-lg text-stone-500 animate-pulse">Verifying Access...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-stone-950">
            <Sidebar />
            <main className="flex-1 p-4 md:p-8 ml-0 md:ml-64 overflow-y-auto h-screen pt-20 md:pt-28">
                {children}
            </main>
        </div>
    );
}
