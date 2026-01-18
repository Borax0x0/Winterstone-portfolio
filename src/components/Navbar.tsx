"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, CloudSnow, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";
import SignOutModal from "@/components/SignOutModal";
import { ChevronDown, User, Calendar, LogOut, ArrowLeft } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOutConfirm = () => {
    logout();
    setIsSignOutModalOpen(false);
    setIsMobileMenuOpen(false);
  };

  // Scroll Logic
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <SignOutModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={handleSignOutConfirm}
      />

      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled
          ? "bg-[#1a2e26] py-4 shadow-md"
          : "bg-transparent py-6"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-white">

          {/* LOGO AREA */}
          <div className="flex items-center gap-8">
            {/* BACK BUTTON (Visible on non-home pages) */}
            {pathname !== "/" && (
              <button
                onClick={() => router.back()}
                className="hidden md:flex items-center gap-2 text-xs font-bold tracking-widest uppercase hover:text-saffron transition-colors"
                title="Go Back"
              >
                <ArrowLeft size={24} />
              </button>
            )}

            {/* LOGO */}
            <Link href="/" className="text-2xl font-serif font-bold tracking-widest cursor-pointer z-50 relative">
              WINTERSTONE
            </Link>
          </div>

          {/* DESKTOP LINKS */}
          <div className="hidden md:flex space-x-12 text-xs tracking-[0.2em] uppercase font-medium items-center">
            <Link href="/#sanctuary" className="hover:text-saffron transition-colors cursor-pointer">
              Sanctuary
            </Link>
            <Link href="/#rooms" className="hover:text-saffron transition-colors cursor-pointer">
              Rooms
            </Link>
            <Link href="/blog" className="hover:text-saffron transition-colors cursor-pointer">
              Journal
            </Link>
          </div>

          {/* RIGHT SIDE ACTIONS */}
          <div className="flex items-center gap-6">

            {/* WEATHER PILL */}
            <div className="hidden md:flex items-center gap-2 text-white/80 pr-4 border-r border-white/20">
              <CloudSnow size={16} />
              <span className="text-xs font-medium tracking-wider">-4°C</span>
            </div>

            {/* AUTH & BOOK BUTTONS */}
            <div className="hidden sm:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  {user.role === "admin" && (
                    <Link href="/admin" className="text-xs font-bold tracking-widest uppercase hover:text-saffron flex items-center gap-2">
                      <LayoutDashboard size={14} />
                      Admin
                    </Link>
                  )}

                  {/* USER DROPDOWN */}
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="text-xs font-bold tracking-widest uppercase hover:text-saffron flex items-center gap-2"
                    >
                      <div className="w-6 h-6 bg-stone-700 rounded-full flex items-center justify-center text-white">
                        <User size={12} />
                      </div>
                      <span className="hidden lg:inline">{user.name.split(' ')[0]}</span>
                      <ChevronDown size={12} />
                    </button>

                    <AnimatePresence>
                      {isProfileDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 top-full mt-4 w-48 bg-white text-stone-900 shadow-xl rounded overflow-hidden z-50 border border-stone-100"
                        >
                          <div className="p-4 border-b border-stone-100">
                            <p className="font-bold text-sm truncate">{user.name}</p>
                            <p className="text-[10px] text-stone-500 truncate">{user.email}</p>
                          </div>
                          <div className="py-2">
                            <Link
                              href="/profile"
                              onClick={() => setIsProfileDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-stone-50 hover:text-saffron transition-colors"
                            >
                              <User size={14} />
                              Profile
                            </Link>
                            <Link
                              href="/profile" // Ideally pass query param ?tab=bookings but strictly layout for now
                              onClick={() => setIsProfileDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-stone-50 hover:text-saffron transition-colors"
                            >
                              <Calendar size={14} />
                              Bookings
                            </Link>
                            <button
                              onClick={() => { setIsProfileDropdownOpen(false); setIsSignOutModalOpen(true); }}
                              className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 transition-colors text-left"
                            >
                              <LogOut size={14} />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-xs font-bold tracking-widest uppercase hover:text-saffron flex items-center gap-2"
                >
                  <User size={14} />
                  Sign In
                </button>
              )}

              <Link href="/book" className="bg-white text-[#1A2F25] px-6 py-3 text-[10px] font-bold tracking-widest uppercase hover:bg-saffron hover:text-white transition-colors">
                Book Now
              </Link>
            </div>

            {/* HAMBURGER ICON */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white hover:text-saffron transition-colors z-50 relative"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

          </div>
        </div>
      </nav >

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {
          isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-stone-900 text-white flex flex-col items-center justify-center space-y-8 md:hidden"
            >
              {/* Mobile Links */}
              <Link
                href="/#sanctuary"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-serif hover:text-saffron transition-colors"
              >
                Sanctuary
              </Link>
              <Link
                href="/#rooms"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-serif hover:text-saffron transition-colors"
              >
                Rooms
              </Link>
              <Link
                href="/blog"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-serif hover:text-saffron transition-colors"
              >
                Journal
              </Link>

              {/* Mobile Weather Display */}
              <div className="flex items-center gap-3 text-white/60">
                <CloudSnow size={20} />
                <span className="text-lg font-serif">-4°C • Heavy Snow</span>
              </div>

              <div className="w-12 h-[1px] bg-white/20 my-4"></div>

              {/* Mobile Auth Actions */}
              {user ? (
                <div className="flex flex-col items-center gap-4">
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-sm font-bold tracking-widest uppercase hover:text-saffron flex items-center gap-2"
                    >
                      <LayoutDashboard size={16} />
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); setIsSignOutModalOpen(true); }}
                    className="text-sm font-bold tracking-widest uppercase text-red-400 hover:text-red-300 flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Sign Out ({user.name})
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setIsMobileMenuOpen(false); setIsAuthModalOpen(true); }}
                  className="text-sm font-bold tracking-widest uppercase hover:text-saffron flex items-center gap-2"
                >
                  <User size={16} />
                  Sign In
                </button>
              )}

              <Link
                href="/book"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-4 text-sm font-bold tracking-widest uppercase text-saffron hover:text-white transition-colors border border-saffron px-8 py-3"
              >
                Book Your Stay
              </Link>
            </motion.div >
          )
        }
      </AnimatePresence >
    </>
  );
}
