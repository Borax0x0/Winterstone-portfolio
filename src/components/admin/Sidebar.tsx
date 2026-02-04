"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { LayoutDashboard, BookKey, Users, Settings, LogOut, MessageSquare, ShieldCheck, X, ChevronRight, BedDouble, LucideIcon, DoorOpen } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Bookings", href: "/admin/bookings", icon: BookKey },
    { name: "Rooms", href: "/admin/rooms", icon: BedDouble },
    { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
    { name: "Team", href: "/admin/team", icon: Users },
    { name: "Guests", href: "/admin/guests", icon: Users },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

// NavContent as a separate component to avoid recreating during render
interface NavContentProps {
    allNavItems: { name: string; href: string; icon: LucideIcon }[];
    pathname: string;
    onNavClick: () => void;
    onLogout: () => void;
}

function NavContent({ allNavItems, pathname, onNavClick, onLogout }: NavContentProps) {
    return (
        <>
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-stone-800">
                <Link href="/" className="text-xl font-serif font-bold text-white tracking-widest">
                    WINTERSTONE
                </Link>
                <p className="text-xs uppercase tracking-widest text-stone-500 mt-2">Admin Portal</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 md:py-8 space-y-2">
                {allNavItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavClick}
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
                    onClick={onLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </>
    );
}

export default function Sidebar() {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [touchStart, setTouchStart] = useState<number | null>(null);

    // Add Users link only for superadmin
    const allNavItems = user?.role === 'superadmin'
        ? [...navItems, { name: "Users", href: "/admin/users", icon: ShieldCheck }]
        : navItems;
    
    // Handlers for NavContent
    const handleNavClick = () => setIsMobileOpen(false);
    const handleLogout = () => { setIsMobileOpen(false); logout(); };

    // Swipe gesture detection
    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => {
            // Only detect swipes starting from left edge (within 30px)
            if (e.touches[0].clientX < 30) {
                setTouchStart(e.touches[0].clientX);
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (touchStart === null) return;
            const touchEnd = e.touches[0].clientX;
            const diff = touchEnd - touchStart;

            // If swiped right more than 50px, open sidebar
            if (diff > 50) {
                setIsMobileOpen(true);
                setTouchStart(null);
            }
        };

        const handleTouchEnd = () => {
            setTouchStart(null);
        };

        // Add listeners for swipe detection
        document.addEventListener('touchstart', handleTouchStart);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleTouchEnd);

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [touchStart]);

    return (
        <>
            {/* Mobile Edge Swipe Indicator - subtle visual cue */}
            <div className="md:hidden fixed left-0 top-1/2 -translate-y-1/2 z-30 pointer-events-none">
                <motion.div
                    className="flex items-center gap-1 bg-stone-800/80 backdrop-blur-sm rounded-r-lg py-4 px-1 border-y border-r border-stone-700"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 0.6 }}
                    transition={{ delay: 1, duration: 0.3 }}
                >
                    <ChevronRight size={14} className="text-stone-400" />
                </motion.div>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-stone-900 text-stone-300 flex-col shadow-xl z-50">
                <NavContent allNavItems={allNavItems} pathname={pathname} onNavClick={handleNavClick} onLogout={handleLogout} />
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="md:hidden fixed inset-0 bg-black/60 z-50"
                        />

                        {/* Drawer */}
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.1}
                            onDragEnd={(_, info) => {
                                // Close if dragged left more than 100px
                                if (info.offset.x < -100) {
                                    setIsMobileOpen(false);
                                }
                            }}
                            className="md:hidden fixed left-0 top-0 h-screen w-72 bg-stone-900 text-stone-300 flex flex-col shadow-xl z-50"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setIsMobileOpen(false)}
                                className="absolute top-4 right-4 text-stone-400 hover:text-white p-2"
                                aria-label="Close menu"
                            >
                                <X size={24} />
                            </button>
                            <NavContent allNavItems={allNavItems} pathname={pathname} onNavClick={handleNavClick} onLogout={handleLogout} />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
