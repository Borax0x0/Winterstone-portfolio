"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            // Allow both admin and superadmin
            if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
                router.push("/"); // Redirect unauthorized users to home
            } else {
                setIsAuthorized(true);
            }
        }
    }, [user, isLoading, router]);

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
