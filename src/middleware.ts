import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const isAdminPath = req.nextUrl.pathname.startsWith("/admin");
    const isAuthRoute = req.nextUrl.pathname.startsWith("/api/auth");
    const isLoginRoute = req.nextUrl.pathname.startsWith("/login");

    // Allow Auth API routes
    if (isAuthRoute) return NextResponse.next();

    // Protect Admin Routes
    if (isAdminPath) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL("/login", req.nextUrl));
        }

        // Check Role - allow both admin and superadmin
        const userRole = (req.auth?.user as any)?.role;
        if (userRole !== "admin" && userRole !== "superadmin") {
            // Redirect non-admins to home or show unauthorized
            return NextResponse.redirect(new URL("/", req.nextUrl));
        }
    }

    // Redirect to admin if already logged in and trying to access login
    if (isLoginRoute && isLoggedIn) {
        const userRole = (req.auth?.user as any)?.role;
        if (userRole === "admin" || userRole === "superadmin") {
            return NextResponse.redirect(new URL("/admin", req.nextUrl));
        }
        return NextResponse.redirect(new URL("/", req.nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/admin/:path*", "/login"],
    runtime: "nodejs",
};
