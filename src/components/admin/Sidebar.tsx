"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookKey, Users, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Bookings", href: "/admin/bookings", icon: BookKey },
    { name: "Team", href: "/admin/team", icon: Users },
    { name: "Guests", href: "/admin/guests", icon: Users },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-stone-900 text-stone-300 flex flex-col shadow-xl z-50">
            {/* Header */}
            <div className="p-8 border-b border-stone-800">
                <Link href="/" className="text-xl font-serif font-bold text-white tracking-widest">
                    WINTERSTONE
                </Link>
                <p className="text-xs uppercase tracking-widest text-stone-500 mt-2">Admin Portal</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-8 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${isActive
                                ? "bg-stone-800 text-white"
                                : "hover:bg-stone-800/50 hover:text-white"
                                }`}
                        >
                            <item.icon size={18} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-stone-800">
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
