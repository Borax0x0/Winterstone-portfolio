"use client";

import React from "react";
import { CloudSnow, Wind, Sun, CloudRain, Cloud, Loader2 } from "lucide-react";
import { useMotionValue, useMotionTemplate, motion } from "framer-motion";
import { useWeather } from "@/hooks/useWeather";

export default function WeatherWidget() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const { weather, loading } = useWeather();

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    const spotlightBg = useMotionTemplate`
        radial-gradient(
            200px circle at ${mouseX}px ${mouseY}px,
            rgba(212, 175, 55, 0.15),
            transparent 80%
        )
    `;

    // Helper to get icon based on weather code/condition
    const getWeatherIcon = (code: number, size: number = 24) => {
        if (code === 0) return <Sun size={size} className="text-saffron group-hover:scale-110 transition-transform duration-500" />;
        if (code >= 1 && code <= 3) return <Cloud size={size} className="text-stone-300 group-hover:scale-110 transition-transform duration-500" />;
        if (code >= 51 && code <= 67) return <CloudRain size={size} className="text-blue-300 group-hover:scale-110 transition-transform duration-500" />;
        if (code >= 71 && code <= 77) return <CloudSnow size={size} className="text-white group-hover:scale-110 transition-transform duration-500" />;
        if (code >= 95) return <Wind size={size} className="text-stone-400 group-hover:scale-110 transition-transform duration-500" />;
        return <Sun size={size} className="text-saffron group-hover:scale-110 transition-transform duration-500" />;
    };

    if (loading || !weather) {
        return (
            <div className="h-full bg-stone-900/50 p-8 rounded-sm border border-stone-800 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-stone-600" />
            </div>
        );
    }

    return (
        <div
            onMouseMove={handleMouseMove}
            className="group relative h-full bg-stone-900/50 p-8 rounded-sm border border-stone-800 flex flex-col justify-between overflow-hidden transition-colors hover:border-saffron/30"
        >
            {/* SPOTLIGHT EFFECT */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: spotlightBg }}
            />

            <div>
                <div className="flex items-center justify-between mb-2 relative z-10">
                    <span className="text-xs font-bold tracking-widest uppercase text-saffron">Current Conditions</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                </div>
                <h4 className="text-stone-300 font-serif text-lg relative z-10">Mcleodganj, Dharamshala</h4>
            </div>

            <div className="flex items-end gap-4 mt-6 relative z-10">
                {getWeatherIcon(weather.code, 48)}
                <div>
                    <span className="text-4xl font-bold text-white">{weather.temp}°C</span>
                    <p className="text-sm text-stone-400">{weather.condition}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-stone-800 relative z-10">
                <div className="flex items-center gap-2 text-xs text-stone-400">
                    <Wind size={14} />
                    <span>{weather.windSpeed} km/h</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-400">
                    <CloudRain size={14} />
                    <span>{weather.humidity}% Humidity</span>
                </div>
            </div>
        </div>
    );
}
