"use client";

import React from "react";
import { motion } from "framer-motion";
// import Image from "next/image"; // Uncomment when you have real images

const events = [
  {
    title: "The Winter Solstice",
    date: "December 21st",
    desc: "An annual tradition where we shut off all electricity and light the Great Hall solely with beeswax candles and the central hearth. A celebration of darkness and return to light.",
    image: "/event-fire.jpg" 
  },
  {
    title: "Alpine Yoga Retreat",
    date: "Every Morning",
    desc: "Greet the sun as it rises over the Himalayas. Our resident instructor leads a flow designed to acclimate your body to the altitude and stillness.",
    image: "/event-yoga.jpg"
  },
  {
    title: "Stargazing & Astronomy",
    date: "Clear Nights",
    desc: "At 8,000 feet, the atmosphere is thin and the stars are piercingly bright. Join us on the terrace for guided constellation mapping with our telescope.",
    image: "/event-star.jpg"
  }
];

export default function BlogPage() {
  return (
    <main className="bg-cream min-h-screen pt-24">
      
      {/* 1. HERO HEADER */}
      <section className="relative h-[60vh] w-full overflow-hidden flex items-center justify-center bg-stone-900">
        {/* Background Image Placeholder */}
        <div className="absolute inset-0 bg-black/40 z-0" />
        
        <div className="relative z-10 text-center text-white px-6">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="block text-saffron font-bold tracking-[0.3em] text-xs uppercase mb-4"
          >
            Est. 1984
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-serif font-bold"
          >
            The Journal
          </motion.h1>
          <p className="mt-4 text-white/80 font-light max-w-lg mx-auto">
            Chronicles of history, culture, and life at 8,000 feet.
          </p>
        </div>
      </section>

      {/* 2. HISTORY (The Narrative) */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-stone-dark">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="prose prose-lg mx-auto text-center"
        >
          <span className="text-saffron text-xs tracking-widest uppercase mb-4 block">Our Heritage</span>
          <h2 className="font-serif text-4xl mb-8">Forged from the Mountain</h2>
          <p className="font-light text-lg leading-relaxed mb-8">
            Winterstone began not as a hotel, but as a refuge for mountaineers attempting the northern ascent. 
            The original structure was a simple stone cabin, built by hand using granite quarried from the very ridge it sits upon.
          </p>
          <p className="font-light text-lg leading-relaxed mb-12">
            Surrounded by ancient Deodar forests and overlooking the Silent Valley, the location was chosen for its 
            unnatural stillness. The wind here doesn't howl; it whispers. Today, we honor that heritage by maintaining 
            the original raw stone walls in our lobby, reminding every guest that luxury here is defined by nature, not gold.
          </p>
          
          <div className="w-24 h-[1px] bg-saffron mx-auto opacity-50 my-16"></div>
        </motion.div>
      </section>

      {/* 3. EVENTS GRID */}
      <section className="bg-stone-900 text-cream py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-white/10 pb-6">
            <div>
              <span className="text-saffron text-xs tracking-widest uppercase mb-2 block">Gatherings</span>
              <h2 className="font-serif text-4xl">Upcoming Events</h2>
            </div>
            <p className="text-white/60 text-sm max-w-md mt-4 md:mt-0 font-light">
              We organize intimate events designed to connect you with the landscape and fellow travelers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                {/* Image Placeholder */}
                <div className="h-64 w-full bg-stone-800 rounded-sm overflow-hidden mb-6 relative">
                   {/* <Image src={event.image} fill className="object-cover" /> */}
                   <div className="absolute inset-0 flex items-center justify-center text-white/20 font-serif text-4xl">
                      {index + 1}
                   </div>
                </div>
                
                <span className="text-xs text-saffron tracking-widest uppercase mb-2 block">{event.date}</span>
                <h3 className="text-xl font-serif font-bold mb-3 group-hover:text-saffron transition-colors">{event.title}</h3>
                <p className="text-sm text-white/60 font-light leading-relaxed">
                  {event.desc}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. SURROUNDINGS / LOCATION */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
           <div className="order-2 md:order-1">
             <span className="text-saffron text-xs tracking-widest uppercase mb-4 block">The Surroundings</span>
             <h2 className="font-serif text-4xl text-stone-dark mb-6">The Silent Valley</h2>
             <p className="text-stone-600 font-light mb-6 leading-relaxed">
               Winterstone is isolated by design. To reach us, you travel 45 minutes up a private winding road 
               lined with rhododendrons. The air is crisp, carrying the scent of pine and wet earth.
             </p>
             <ul className="space-y-4 text-sm text-stone-800 font-medium tracking-wide">
               <li className="flex items-center"><div className="w-1.5 h-1.5 bg-saffron rounded-full mr-3"/> 8,000 ft Elevation</li>
               <li className="flex items-center"><div className="w-1.5 h-1.5 bg-saffron rounded-full mr-3"/> Private Pine Forest Access</li>
               <li className="flex items-center"><div className="w-1.5 h-1.5 bg-saffron rounded-full mr-3"/> Natural Spring Water Source</li>
             </ul>
           </div>
           
           {/* Map or Landscape Image Placeholder */}
           <div className="order-1 md:order-2 h-[500px] bg-stone-200 w-full relative rounded-sm overflow-hidden">
              {/* <Image src="/surroundings.jpg" fill className="object-cover" /> */}
              <div className="absolute inset-0 flex items-center justify-center text-stone-400 font-serif">
                [Landscape Image]
              </div>
           </div>
        </div>
      </section>

    </main>
  );
}