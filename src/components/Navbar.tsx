"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react"; // Import Icons
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          isScrolled 
            ? "bg-[#1a2e26] py-4 shadow-md" 
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-white">
          
          {/* LOGO */}
          <Link href="/" className="text-2xl font-serif font-bold tracking-widest cursor-pointer z-50 relative">
            WINTERSTONE
          </Link>
          
          {/* DESKTOP LINKS (Hidden on Mobile) */}
          <div className="hidden md:flex space-x-12 text-xs tracking-[0.2em] uppercase font-medium">
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
          <div className="flex items-center gap-4">
            
            {/* BOOK BUTTON (Visible on both, but maybe hide on very small phones if needed) */}
            <Link href="/book" className="hidden sm:block bg-white text-[#1A2F25] px-6 py-3 text-[10px] font-bold tracking-widest uppercase hover:bg-saffron hover:text-white transition-colors">
              Book Now
            </Link>

            {/* HAMBURGER ICON (Visible ONLY on Mobile) */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white hover:text-saffron transition-colors z-50 relative"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

          </div>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
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

            <div className="w-12 h-[1px] bg-white/20 my-4"></div>

            <Link 
              href="/book" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-bold tracking-widest uppercase text-saffron hover:text-white transition-colors"
            >
              Book Your Stay
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}