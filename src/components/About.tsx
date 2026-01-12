"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const About = () => {
  return (
    <section className="relative w-full py-24 md:py-32 bg-cream text-stone-dark">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        
        {/* LEFT: The Narrative */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <span className="text-saffron font-bold tracking-[0.2em] text-xs uppercase mb-4 block">
            The Sanctuary
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8 leading-tight text-forest-dark">
            Silence is the <br /> ultimate luxury.
          </h2>
          <p className="text-stone-dark/80 leading-relaxed mb-6 font-light text-lg">
            Winter Stone isn't just a hotel; it is a pause button for the world. 
            Nestled 8,000 feet above the noise, we offer a retreat where the only 
            playlists are the wind in the pines and the crackle of the hearth.
          </p>
          <p className="text-stone-dark/80 leading-relaxed mb-8 font-light text-lg">
            Built from local granite and reclaimed cedar, our walls breathe 
            with the mountain. Here, you don't check in—you come home.
          </p>
          
          <Link href="/blog">
            <button className="group flex items-center text-xs font-bold tracking-widest uppercase text-forest hover:text-saffron transition-colors">
              Read Our Story 
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          
        </motion.div>

        {/* RIGHT: The Image Grid */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4"
          >
            {/* Tall Image */}
            <img 
              src="/about-1.jpg" 
              alt="Stone Interior" 
              className="w-full h-80 object-cover rounded-sm grayscale hover:grayscale-0 transition-all duration-700"
            />
            {/* Small Detail Image */}
            <img 
              src="/about-2.jpg" 
              alt="Winter Texture" 
              className="w-full h-48 object-cover rounded-sm grayscale hover:grayscale-0 transition-all duration-700"
            />
          </motion.div>
          
          <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="pt-12"
          >
              {/* Offset Tall Image */}
              <img 
              src="/about-3.jpg" 
              alt="Snow View" 
              className="w-full h-96 object-cover rounded-sm grayscale hover:grayscale-0 transition-all duration-700"
            />
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default About;