"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import AvailabilityModal from "@/components/AvailabilityModal";
import ReviewForm from "@/components/ReviewForm";
import ReviewsList from "@/components/ReviewsList";

// 1. THIS WAS MISSING: The Room Data Array
const roomsData = [
  {
    slug: "skyline-haven",
    name: "Skyline Haven",
    price: "From ₹8,500",
    image: "/skyline-main.jpg",
    gallery: ["/skyline-1.jpg", "/skyline-2.jpg", "/bath-1.jpg"],
    description: "Perched high above the valley, the Skyline Haven is designed for the observer. Step out onto your private balcony to witness the mist rolling over the Himalayas. The interior blends warm wood tones with modern luxury.",
    amenities: ["Private Mountain Balcony", "Valley View", "King Size Bed", "Heated Floors", "Work Desk", "High-Speed Wi-Fi"],
  },
  {
    slug: "zen-nest",
    name: "Zen Nest",
    price: "From ₹6,500",
    image: "/zen-main.jpg",
    gallery: ["/zen-1.jpg", "/zen-2.jpg", "/bath-2.jpg"],
    description: "A sanctuary dedicated to mindfulness. The Zen Nest features designated space for yoga, meditation, and stillness. Minimalist decor and soft ambient lighting allow you to disconnect from the noise and reconnect with yourself.",
    amenities: ["Yoga & Meditation Space", "Soundproofing", "Meditation Cushions", "Herbal Tea Station", "Dimmable Lighting", "Queen Bed"],
  },
  {
    slug: "sunlit-studio",
    name: "Sunlit Studio",
    price: "From ₹7,200",
    image: "/sunlit-main.jpg",
    gallery: ["/sunlit-1.jpg", "/sunlit-2.jpg", "/bath-1.jpg"],
    description: "Bathed in natural light, the Sunlit Studio blurs the line between indoors and out. Located on the ground floor for easy access, the massive front-facing windows frame the pine forest, bringing the golden hour directly to your bedside.",
    amenities: ["Floor-to-Ceiling Windows", "Ground Floor Access", "Sitting Area", "Natural Light", "Rain Shower", "Smart TV"],
  },
];

export default function RoomPage() {
  const params = useParams();

  // 2. FIND ROOM (Now this will work because roomsData exists)
  const room = roomsData.find((r) => r.slug === params.slug);

  // 3. STATE for Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Logic for Previous / Next Links
  const currentIndex = roomsData.findIndex((r) => r?.slug === room?.slug);
  const nextRoom = roomsData[(currentIndex + 1) % roomsData.length];
  const prevRoom = roomsData[(currentIndex - 1 + roomsData.length) % roomsData.length];

  if (!room) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-white bg-stone-900">
        <h1 className="text-2xl font-serif mb-4">Suite Not Found</h1>
        <Link href="/#rooms" className="text-saffron hover:text-white underline">Return to Suites</Link>
      </div>
    );
  }

  // Extract numeric price for the modal
  const priceNumber = parseInt(room.price.replace(/[^\d]/g, ""));

  return (
    <main className="min-h-screen bg-cream text-stone-dark">

      {/* MODAL COMPONENT */}
      <AvailabilityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        roomName={room.name}
        roomSlug={room.slug}
        pricePerNight={priceNumber}
      />

      {/* HERO SECTION */}
      <div className="relative h-screen w-full">
        <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/30" />

        {/* Note: I removed the extra 'Back to Suites' link here since you have the global navbar now */}

        <div className="absolute bottom-12 left-6 md:left-12 text-white z-10">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-2">{room.name}</h1>
          <p className="text-xl text-saffron font-light">{room.price} <span className="text-sm text-white/80">/ night</span></p>
        </div>
      </div>

      {/* DETAILS SECTION */}
      <div className="max-w-6xl mx-auto px-6 py-24">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="md:col-span-2">
            <h2 className="text-saffron font-extrabold tracking-wider text-3xl md:text-4xl uppercase mb-6 block">
              The Experience
            </h2>
            <p className="text-lg font-light leading-relaxed text-stone-dark/80 mb-8">
              {room.description}
            </p>

            <h3 className="font-serif font-bold text-xl mb-6">Room Features</h3>
            <ul className="grid grid-cols-2 gap-y-4 gap-x-8">
              {room.amenities.map((item, index) => (
                <li key={index} className="flex items-center text-stone-600 text-sm tracking-wide">
                  <div className="w-1.5 h-1.5 bg-saffron rounded-full mr-3" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="bg-stone-100 p-8 rounded-sm border border-stone-200">
              <h3 className="font-serif font-bold text-xl mb-4">Reserve Your Stay</h3>
              <p className="text-sm text-stone-500 mb-6">Best rates guaranteed when booking directly.</p>

              {/* BUTTON OPENS MODAL */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-stone-900 text-white py-4 text-xs font-bold tracking-widest uppercase hover:bg-saffron hover:text-stone-900 transition-colors"
              >
                Check Availability
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURE GALLERY */}
      <div className="w-full bg-stone-900 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="font-serif font-bold text-2xl mb-12 text-stone-100">Closer Look</h3>

          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-5 w-full">
            <div className="relative h-[500px] md:h-[800px] w-full">
              <img src={room.gallery[0]} alt="Feature View" className="w-full h-full object-cover block" />
            </div>
            <div className="flex flex-col gap-5 h-full">
              <div className="relative h-[240px] md:h-[390px] w-full">
                <img src={room.gallery[1]} alt="Detail" className="w-full h-full object-cover block" />
              </div>
              <div className="relative h-[240px] md:h-[390px] w-full">
                <img src={room.gallery[2]} alt="Bath Detail" className="w-full h-full object-cover block" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REVIEWS SECTION */}
      <div className="bg-stone-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="font-serif font-bold text-2xl mb-12 text-stone-900">Guest Reviews</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* Reviews List */}
            <div>
              <ReviewsList roomSlug={room.slug} />
            </div>

            {/* Submit Review Form */}
            <div>
              <h4 className="font-semibold text-lg mb-6 text-stone-800">Share Your Experience</h4>
              <ReviewForm roomSlug={room.slug} />
            </div>
          </div>
        </div>
      </div>

      {/* MINIMALIST NAVIGATION */}
      <div className="max-w-6xl mx-auto px-6">
        {nextRoom && prevRoom && (
          <div className="py-24 flex justify-between items-center">

            <Link href={`/rooms/${prevRoom.slug}`} className="group text-left">
              <span className="block text-[10px] font-bold tracking-[0.2em] text-stone-400 mb-2 group-hover:text-saffron transition-colors uppercase">
                Previous Suite
              </span>
              <span className="font-serif text-xl text-stone-900 group-hover:text-stone-600 transition-colors flex items-center gap-2">
                <ArrowLeft className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                {prevRoom.name}
              </span>
            </Link>

            <div className="h-px w-12 bg-stone-300 hidden md:block opacity-50"></div>

            <Link href={`/rooms/${nextRoom.slug}`} className="group text-right">
              <span className="block text-[10px] font-bold tracking-[0.2em] text-stone-400 mb-2 group-hover:text-saffron transition-colors uppercase">
                Next Suite
              </span>
              <span className="font-serif text-xl text-stone-900 group-hover:text-stone-600 transition-colors flex items-center gap-2 justify-end">
                {nextRoom.name}
                <ArrowLeft className="w-4 h-4 rotate-180 opacity-0 -mr-4 group-hover:opacity-100 group-hover:mr-0 transition-all duration-300" />
              </span>
            </Link>

          </div>
        )}
      </div>

    </main>
  );
}