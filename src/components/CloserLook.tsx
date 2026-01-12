"use client";

import Image from "next/image";
import { motion } from "framer-motion";

// Define the props to pass different images for different rooms
interface CloserLookProps {
  image1: string;
  image2: string;
}

export default function CloserLook({ image1, image2 }: CloserLookProps) {
  return (
    <section className="bg-cream py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Text Section - Fades Up */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="font-serif text-4xl text-stone-dark mb-4">A Closer Look</h2>
          <p className="text-stone font-sans max-w-2xl mx-auto">
            Discover the details that make Winterstone a sanctuary for the soul.
          </p>
        </motion.div>

        {/* IMAGE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* LEFT IMAGE - Slides from Left */}
          <motion.div
            initial={{ opacity: 0, x: -100 }} 
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }} // Smooth 1s glide
            viewport={{ once: true, margin: "-100px" }}   // Triggers when 100px is visible
            className="relative h-[500px] w-full shadow-2xl"
          >
            <Image 
              src={image1} 
              alt="Room Detail 1"
              fill
              className="object-cover rounded-sm"
            />
          </motion.div>

          {/* RIGHT IMAGE - Slides from Right */}
          <motion.div
            initial={{ opacity: 0, x: 100 }} 
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }} // Slight delay for elegance
            viewport={{ once: true, margin: "-100px" }}
            className="relative h-[500px] w-full shadow-2xl"
          >
            <Image 
              src={image2} 
              alt="Room Detail 2"
              fill
              className="object-cover rounded-sm"
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}