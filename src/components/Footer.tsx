"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Phone, Mail, Instagram, Twitter, ExternalLink } from "lucide-react";
import WeatherWidget from "./WeatherWidget";

export default function Footer() {
  return (
    <footer className="bg-stone-950 text-stone-400 py-20 border-t border-stone-900">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16">

        {/* COL 1: BRAND & CONTACT */}
        <div className="space-y-8">
          <div>
            <h3 className="text-2xl font-serif font-bold text-white tracking-widest mb-2">WINTERSTONE</h3>
            <p className="text-xs uppercase tracking-[0.2em] opacity-60">The Silent Valley • Est. 1984</p>
          </div>

          <div className="space-y-4 text-sm font-light">
            <div className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer">
              <MapPin size={16} />
              <span>Bhagsunag Rd, near Taxi Stand, Bhagsu Nag, Uppar Bhagsu, Mcleodganj, Himachal Pradesh 176216</span>
            </div>
            <div className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer">
              <Phone size={16} />
              <span>+91 99582 70492</span>
            </div>
            <div className="flex items-center gap-3 hover:text-white transition-colors cursor-pointer">
              <Mail size={16} />
              <span>winterstone110104@gmail.com</span>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Instagram className="w-5 h-5 hover:text-saffron transition-colors cursor-pointer" />
            <Twitter className="w-5 h-5 hover:text-saffron transition-colors cursor-pointer" />
          </div>
        </div>

        {/* COL 2: LIVE WEATHER WIDGET */}
        <WeatherWidget />

        {/* COL 3: THE CLICKABLE MAP */}
        <a
          // LINK: Redirects to your exact link
          href="https://maps.app.goo.gl/zVVEHuLHSPsPuKDs6?g_st=iw"
          target="_blank"
          rel="noopener noreferrer"
          className="h-full min-h-[250px] w-full bg-stone-900 rounded-sm overflow-hidden relative border border-stone-800 group block cursor-pointer"
        >
          {/* Map Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 to-transparent pointer-events-none z-10 transition-opacity duration-500 group-hover:opacity-50" />

          {/* Google Map Embed - PREVIEW: Uses 'q=' parameter to pin your EXACT address */}
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3375.919536109345!2d76.3265!3d32.2458!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391b5391c7848e3d%3A0x4037568582457c15!2sBhagsunag%20Taxi%20Stand!5e0!3m2!1sen!2sin!4v1705300000000!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0, filter: "grayscale(100%) invert(90%) contrast(80%)" }}
            allowFullScreen={false}
            loading="lazy"
            className="absolute inset-0 w-full h-full opacity-60 group-hover:opacity-40 transition-all duration-500 pointer-events-none"
          ></iframe>

          {/* Hover Action Text */}
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <div className="bg-stone-950/80 backdrop-blur-md px-6 py-3 rounded-full border border-stone-700 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
              <span className="text-xs font-bold tracking-widest text-white uppercase flex items-center gap-2">
                Open in Maps <ExternalLink size={12} className="text-saffron" />
              </span>
            </div>
          </div>
        </a>

      </div>

      {/* COPYRIGHT BAR */}
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-stone-900 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest opacity-40">
        <p>© 2026 Winterstone Lodge. All Rights Reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <Link href="#" className="hover:text-white">Privacy</Link>
          <Link href="#" className="hover:text-white">Terms</Link>
          <Link href="#" className="hover:text-white">Sitemap</Link>
        </div>
      </div>
    </footer>
  );
}