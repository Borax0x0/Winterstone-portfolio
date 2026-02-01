"use client";

import React, { createContext, useContext } from "react";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

// Define User Type
interface User {
    name: string;
    email: string;
    role: "guest" | "admin" | "superadmin";
}

interface SessionUser {
    name?: string | null;
    email?: string | null;
    role?: "guest" | "admin" | "superadmin";
}

interface AuthContextType {
    user: User | null;
    login: (name: string, email: string, role: "guest" | "admin" | "superadmin", password?: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthContextContent({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    const user: User | null = session?.user ? {
        name: session.user.name || "",
        email: session.user.email || "",
        role: (session.user as SessionUser).role || "guest"
    } : null;

    const login = async (name: string, email: string, role: "guest" | "admin" | "superadmin", password?: string) => {
        // All logins go through NextAuth credentials provider now
        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (res?.error) {
            console.error("Login failed:", res.error);
            // Always show user-friendly message regardless of internal error
            // NextAuth error codes like "Configuration", "CredentialsSignin" are not helpful to users
            throw new Error("Email not registered or incorrect password");
        }

        // Success - redirect based on role (determined by session)
        router.push("/");
        router.refresh(); // Refresh to get updated session
    };

    const logout = async () => {
        await signOut({ redirect: true, callbackUrl: "/" });
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            isLoading: status === "loading"
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <AuthContextContent>{children}</AuthContextContent>
        </SessionProvider>
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
