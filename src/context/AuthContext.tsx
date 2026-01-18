"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Define User Type
interface User {
    name: string;
    email: string;
    role: "guest" | "admin";
}

interface AuthContextType {
    user: User | null;
    login: (name: string, email: string, role: "guest" | "admin") => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("winterstone_user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = (name: string, email: string, role: "guest" | "admin") => {
        const newUser = { name, email, role };
        setUser(newUser);
        localStorage.setItem("winterstone_user", JSON.stringify(newUser));

        // Redirect based on role
        if (role === "admin") {
            router.push("/admin");
        } else {
            router.push("/");
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("winterstone_user");
        router.push("/"); // Always go to home on logout
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook for easy usage
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
