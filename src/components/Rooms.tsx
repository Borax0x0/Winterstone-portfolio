"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const rooms = [
  {
    id: 1,
    name: "Skyline Haven",
    slug: "skyline-haven",
    image: "/skyline-main.jpg", // UPDATED: Uses new hero
    desc: "Balcony suites with sweeping mountain and valley views.",
  },
  {
    id: 2,
    name: "Zen Nest",
    slug: "zen-nest",
    image: "/zen-main.jpg", // UPDATED: Uses new hero
    desc: "A sanctuary designed for yoga, meditation, and stillness.",
  },
  {
    id: 3,
    name: "Sunlit Studio",
    slug: "sunlit-studio",
    image: "/sunlit-main.jpg", // UPDATED: Uses new hero
    desc: "Bright, airy ground-floor rooms with expansive windows.",
  },
];

const Rooms = () => {
  return (
    <section id="rooms" className="py-24 bg-stone-900 text-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
          The Suites
        </h2>
        <p className="text-white/60 font-light max-w-xl">
          Designed to disappear into the landscape.
        </p>
      </div>

      <div className="flex overflow-x-auto space-x-6 px-6 pb-8 snap-x snap-mandatory scrollbar-hide">
        {rooms.map((room) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: room.id * 0.2 }}
            className="snap-center shrink-0 w-[85vw] md:w-[600px] group relative"
          >
            <div className="h-[400px] md:h-[500px] overflow-hidden rounded-sm relative">
              <img
                src={room.image}
                alt={room.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all" />
            </div>

            <div className="mt-6 flex justify-between items-end">
              <div>
                <h3 className="text-2xl font-serif font-bold mb-2">{room.name}</h3>
                <p className="text-sm text-white/60 tracking-wide uppercase max-w-xs">{room.desc}</p>
              </div>
              
              <Link 
                href={`/rooms/${room.slug}`}
                className="text-xs font-bold uppercase tracking-widest text-saffron border-b border-saffron pb-1 hover:text-white hover:border-white transition-colors"
              >
                View Room
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Rooms;