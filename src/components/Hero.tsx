"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const Hero = () => {

  return (
    <section className="relative h-screen w-full overflow-hidden">
      
      {/* 1. BACKGROUND VIDEO */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/bgvideo.mp4" type="video/mp4" />
        </video>
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* 2. HERO CONTENT (Centered Text) */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <span className="block text-saffron font-bold tracking-[0.3em] text-xs uppercase mb-6">
            The Himalayas
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-tight mb-8">
            Where Stone <br /> Meets Sky
          </h1>
        </motion.div>
      </div>

      {/* 3. SCROLL INDICATOR */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 text-white flex flex-col items-center gap-2"
      >
        <span className="text-[10px] tracking-widest uppercase opacity-80">Scroll</span>
        <ChevronDown className="w-5 h-5 animate-bounce opacity-80" />
      </motion.div>

    </section>
  );
};

export default Hero;