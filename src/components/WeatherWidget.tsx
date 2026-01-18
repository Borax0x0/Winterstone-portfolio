"use client";

import React, { useState, useEffect } from "react"; // Added React imports
import { CloudSnow, Wind } from "lucide-react";
import { useMotionValue, useMotionTemplate, motion } from "framer-motion";

export default function WeatherWidget() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <div
            onMouseMove={handleMouseMove}
            className="group relative h-full bg-stone-900/50 p-8 rounded-sm border border-stone-800 flex flex-col justify-between overflow-hidden transition-colors hover:border-saffron/30"
        >
            {/* SPOTLIGHT EFFECT */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            200px circle at ${mouseX}px ${mouseY}px,
                            rgba(212, 175, 55, 0.15),
                            transparent 80%
                        )
                    `,
                }}
            />

            <div>
                <div className="flex items-center justify-between mb-2 relative z-10">
                    <span className="text-xs font-bold tracking-widest uppercase text-saffron">Current Conditions</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                </div>
                <h4 className="text-stone-300 font-serif text-lg relative z-10">Mcleodganj, Dharamshala</h4>
            </div>

            <div className="flex items-end gap-4 mt-6 relative z-10">
                <CloudSnow size={48} className="text-white group-hover:scale-110 transition-transform duration-500" />
                <div>
                    <span className="text-4xl font-bold text-white">-2°C</span>
                    <p className="text-sm text-stone-400">Light Snowfall</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-stone-800 relative z-10">
                <div className="flex items-center gap-2 text-xs">
                    <Wind size={14} />
                    <span>8 km/h NE</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <CloudSnow size={14} />
                    <span>4" Fresh Powder</span>
                </div>
            </div>
        </div>
    );
}
