"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MapPin, Phone, Mail, Instagram, Twitter, ExternalLink, ChevronDown } from "lucide-react";
import WeatherWidget from "./WeatherWidget";
import NewsletterForm from "./NewsletterForm";
import { motion, AnimatePresence } from "framer-motion";

// Collapsible Section Component for Mobile
function CollapsibleSection({
  title,
  children,
  defaultOpen = false
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="md:contents">
      {/* Mobile: Collapsible Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden w-full flex items-center justify-between py-4 border-b border-stone-800 text-white"
      >
        <span className="text-sm font-bold tracking-widest uppercase">{title}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={18} className="text-stone-500" />
        </motion.div>
      </button>

      {/* Mobile: Collapsible Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden"
          >
            <div className="py-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop: Always visible */}
      <div className="hidden md:block">
        {children}
      </div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-stone-950 text-stone-400 py-12 md:py-16 border-t border-stone-900">
      <div className="max-w-7xl mx-auto px-6">

        {/* Mobile: Brand always visible at top */}
        <div className="md:hidden mb-6">
          <h3 className="text-2xl font-serif font-bold text-white tracking-widest mb-2">WINTERSTONE</h3>
          <p className="text-xs uppercase tracking-[0.2em] opacity-60">The Silent Valley • Est. 1984</p>
        </div>

        {/* Grid for Desktop / Stacked for Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-12">

          {/* COL 1: BRAND & CONTACT */}
          <CollapsibleSection title="Contact Us" defaultOpen={true}>
            <div className="space-y-6">
              {/* Desktop Brand (hidden on mobile - shown above) */}
              <div className="hidden md:block">
                <h3 className="text-2xl font-serif font-bold text-white tracking-widest mb-2">WINTERSTONE</h3>
                <p className="text-xs uppercase tracking-[0.2em] opacity-60">The Silent Valley • Est. 1984</p>
              </div>

              <div className="space-y-3 text-sm font-light">
                <a href="https://maps.app.goo.gl/zVVEHuLHSPsPuKDs6" className="flex items-start gap-3 hover:text-white transition-colors">
                  <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                  <span>Bhagsunag Rd, near Taxi Stand, Mcleodganj, Himachal Pradesh 176216</span>
                </a>
                <a href="tel:+919958270492" className="flex items-center gap-3 hover:text-white transition-colors">
                  <Phone size={16} />
                  <span>+91 99582 70492</span>
                </a>
                <a href="mailto:winterstone110104@gmail.com" className="flex items-center gap-3 hover:text-white transition-colors">
                  <Mail size={16} />
                  <span>winterstone110104@gmail.com</span>
                </a>
              </div>

              <div className="flex gap-4">
                <a href="https://www.instagram.com/thewinterstone/" target="_blank" rel="noopener noreferrer" className="p-2 -m-2">
                  <Instagram className="w-5 h-5 hover:text-saffron transition-colors" />
                </a>
                <a href="#" className="p-2 -m-2">
                  <Twitter className="w-5 h-5 hover:text-saffron transition-colors" />
                </a>
              </div>
            </div>
          </CollapsibleSection>

          {/* COL 2: LIVE WEATHER WIDGET */}
          <CollapsibleSection title="Weather">
            <WeatherWidget />
          </CollapsibleSection>

          {/* COL 3: THE CLICKABLE MAP */}
          <CollapsibleSection title="Find Us">
            <a
              href="https://maps.app.goo.gl/zVVEHuLHSPsPuKDs6?g_st=iw"
              target="_blank"
              rel="noopener noreferrer"
              className="h-48 md:h-full md:min-h-[200px] w-full bg-stone-900 rounded-sm overflow-hidden relative border border-stone-800 group block"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 to-transparent pointer-events-none z-10 transition-opacity duration-500 group-hover:opacity-50" />
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3375.919536109345!2d76.3265!3d32.2458!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391b5391c7848e3d%3A0x4037568582457c15!2sBhagsunag%20Taxi%20Stand!5e0!3m2!1sen!2sin!4v1705300000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "grayscale(100%) invert(90%) contrast(80%)" }}
                allowFullScreen={false}
                loading="lazy"
                className="absolute inset-0 w-full h-full opacity-60 group-hover:opacity-40 transition-all duration-500 pointer-events-none"
              ></iframe>
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <div className="bg-stone-950/80 backdrop-blur-md px-6 py-3 rounded-full border border-stone-700 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  <span className="text-xs font-bold tracking-widest text-white uppercase flex items-center gap-2">
                    Open in Maps <ExternalLink size={12} className="text-saffron" />
                  </span>
                </div>
              </div>
            </a>
          </CollapsibleSection>

        </div>
      </div>

      {/* NEWSLETTER ROW - Full width, compact */}
      <div className="max-w-7xl mx-auto px-6 mt-10 pt-8 border-t border-stone-800">
        <NewsletterForm variant="horizontal" />
      </div>

      {/* COPYRIGHT BAR */}
      <div className="max-w-7xl mx-auto px-6 mt-8 pt-6 border-t border-stone-900 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest opacity-40">
        <p>© 2026 Winterstone Lodge. All Rights Reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <Link href="#" className="hover:text-white py-2">Privacy</Link>
          <Link href="#" className="hover:text-white py-2">Terms</Link>
          <Link href="#" className="hover:text-white py-2">Sitemap</Link>
        </div>
      </div>
    </footer>
  );
}