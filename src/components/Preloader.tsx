"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          style={{ willChange: "opacity" }} // Keep GPU optimization
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            transition: { duration: 1, ease: "easeInOut" } // Slower, elegant fade
          }}

          className="fixed inset-0 z-[9999] flex items-center justify-center bg-stone-950 text-white"
        >
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="font-serif text-4xl md:text-6xl tracking-widest uppercase mb-4"
            >
              Winterstone
            </motion.h1>
            
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100px" }}
              transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
              className="h-[1px] bg-saffron mx-auto"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}