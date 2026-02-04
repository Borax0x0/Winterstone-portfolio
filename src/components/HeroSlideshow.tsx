"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface HeroSlideshowProps {
    images: string[];
    roomName: string;
    price: number;
    interval?: number; // Time between slides in ms (default: 5000)
}

export default function HeroSlideshow({
    images,
    roomName,
    price,
    interval = 5000
}: HeroSlideshowProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    // Filter out empty images and ensure we have at least one
    const validImages = images.filter(img => img && img.trim() !== '');
    const slideImages = validImages.length > 0 ? validImages : ['/placeholder.jpg'];

    const nextSlide = useCallback(() => {
        if (slideImages.length <= 1) return;
        setCurrentIndex((prev) => (prev + 1) % slideImages.length);
        setProgress(0);
    }, [slideImages.length]);

    // Auto-advance slides
    useEffect(() => {
        if (slideImages.length <= 1) return;

        const timer = setInterval(nextSlide, interval);
        return () => clearInterval(timer);
    }, [interval, nextSlide, slideImages.length]);

    // Progress bar animation
    useEffect(() => {
        if (slideImages.length <= 1) return;

        const progressInterval = 50; // Update every 50ms
        const step = (progressInterval / interval) * 100;

        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) return 0;
                return prev + step;
            });
        }, progressInterval);

        return () => clearInterval(timer);
    }, [interval, slideImages.length, currentIndex]);

    return (
        <div className="relative h-screen w-full overflow-hidden">
            {/* Background Images with Crossfade */}
            {slideImages.map((image, index) => (
                <div
                    key={image + index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <Image
                        src={image}
                        alt={`${roomName} - View ${index + 1}`}
                        fill
                        priority={index === 0}
                        className="object-cover"
                    />
                </div>
            ))}

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/30" />

            {/* Content Overlay */}
            <div className="absolute bottom-12 left-6 md:left-12 text-white z-10">
                <h1 className="text-4xl md:text-6xl font-serif font-bold mb-2">{roomName}</h1>
                <p className="text-xl text-saffron font-light">
                    From ₹{price.toLocaleString()} <span className="text-sm text-white/80">/ night</span>
                </p>
            </div>

            {/* Slide Indicators */}
            {slideImages.length > 1 && (
                <div className="absolute bottom-12 right-6 md:right-12 flex gap-2 z-10">
                    {slideImages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setCurrentIndex(index);
                                setProgress(0);
                            }}
                            className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                    ? 'bg-saffron w-6'
                                    : 'bg-white/50 hover:bg-white/80 w-2'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Progress Bar */}
            {slideImages.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-10">
                    <div
                        className="h-full bg-saffron transition-[width] duration-75 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    );
}
