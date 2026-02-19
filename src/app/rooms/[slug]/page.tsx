"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, X, Clock } from "lucide-react";
import AvailabilityModal from "@/components/AvailabilityModal";
import ReviewForm from "@/components/ReviewForm";
import ReviewsList from "@/components/ReviewsList";
import HeroSlideshow from "@/components/HeroSlideshow";

// Fallback data in case API is not populated yet
const fallbackRoomsData = [
  {
    slug: "skyline-haven",
    name: "Skyline Haven",
    price: 8500,
    heroImage: "/skyline-main.jpg",
    gallery: ["/skyline-hero-1.jpg", "/skyline-hero-2.jpg", "/skyline-1.jpg", "/skyline-2.jpg", "/bath-1.jpg"],
    description: "Perched high above the valley, the Skyline Haven is designed for the observer. Step out onto your private balcony to witness the mist rolling over the Himalayas. The interior blends warm wood tones with modern luxury.",
    amenities: ["Private Mountain Balcony", "Valley View", "King Size Bed", "Heated Floors", "Work Desk", "High-Speed Wi-Fi"],
  },
  {
    slug: "zen-nest",
    name: "Zen Nest",
    price: 6500,
    heroImage: "/zen-main.jpg",
    gallery: ["/zen-hero-1.jpg", "/zen-hero-2.jpg", "/zen-1.jpg", "/zen-2.jpg", "/bath-2.jpg"],
    description: "A sanctuary dedicated to mindfulness. The Zen Nest features designated space for yoga, meditation, and stillness. Minimalist decor and soft ambient lighting allow you to disconnect from the noise and reconnect with yourself.",
    amenities: ["Yoga & Meditation Space", "Soundproofing", "Meditation Cushions", "Herbal Tea Station", "Dimmable Lighting", "Queen Bed"],
  },
  {
    slug: "sunlit-studio",
    name: "Sunlit Studio",
    price: 7200,
    heroImage: "/sunlit-main.jpg",
    gallery: ["/sunlit-hero-1.jpg", "/sunlit-hero-2.jpg", "/sunlit-1.jpg", "/sunlit-2.jpg", "/bath-1.jpg"],
    description: "Bathed in natural light, the Sunlit Studio blurs the line between indoors and out. Located on the ground floor for easy access, the massive front-facing windows frame the pine forest, bringing the golden hour directly to your bedside.",
    amenities: ["Floor-to-Ceiling Windows", "Ground Floor Access", "Sitting Area", "Natural Light", "Rain Shower", "Smart TV"],
  },
];

interface Room {
  _id?: string;
  slug: string;
  name: string;
  price: number;
  description: string;
  amenities: string[];
  heroImage: string;
  gallery: string[];
}

export default function RoomPage() {
  const params = useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [units, setUnits] = useState<{ _id: string; name: string; isActive: boolean; image: string; shortDescription: string; features: string[] }[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null); // Track selected unit for modal

  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [settings, setSettings] = useState<{ checkInTime: string; checkOutTime: string } | null>(null);

  // Fetch room data from API
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const [allRes, settingsRes, unitsRes] = await Promise.all([
          fetch('/api/rooms', { cache: 'no-store' }),
          fetch('/api/settings', { cache: 'no-store' }),
          fetch('/api/rooms/units', { cache: 'no-store' }) // Fetch units
        ]);

        let roomsData: Room[] = [];

        if (allRes.ok) {
          roomsData = await allRes.json();
        }

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData);
        }

        // Filter units for current room
        if (unitsRes.ok) {
          const allUnits = await unitsRes.json();
          setUnits(allUnits.filter((u: any) => u.roomTypeSlug === params.slug && u.isActive));
        }

        // If no rooms in database, use fallback
        if (roomsData.length === 0) {
          roomsData = fallbackRoomsData;
        }

        setAllRooms(roomsData);

        // Find current room
        const currentRoom = roomsData.find((r) => r.slug === params.slug);
        setRoom(currentRoom || null);
      } catch (error) {
        // On error, use fallback data
        console.error('Failed to fetch room data:', error);
        setAllRooms(fallbackRoomsData);
        const currentRoom = fallbackRoomsData.find((r) => r.slug === params.slug);
        setRoom(currentRoom || null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomData();
  }, [params.slug]);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-stone-900">
        <div className="animate-spin h-8 w-8 border-2 border-saffron border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Room not found
  if (!room) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-white bg-stone-900">
        <h1 className="text-2xl font-serif mb-4">Suite Not Found</h1>
        <Link href="/#rooms" className="text-saffron hover:text-white underline">Return to Suites</Link>
      </div>
    );
  }

  // Logic for Previous / Next Links
  const currentIndex = allRooms.findIndex((r) => r.slug === room.slug);
  const nextRoom = allRooms[(currentIndex + 1) % allRooms.length];
  const prevRoom = allRooms[(currentIndex - 1 + allRooms.length) % allRooms.length];

  // Helper to format time
  const formatTime = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  return (
    <main className="min-h-screen bg-cream text-stone-dark">

      {/* MODAL COMPONENT */}
      <AvailabilityModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedUnit(null); }}
        roomName={selectedUnit ? units.find(u => u._id === selectedUnit)?.name || room.name : room.name}
        roomSlug={room.slug}
        pricePerNight={room.price}
        unitId={selectedUnit || undefined} // Pass unit ID if selected
      />

      {/* HERO SLIDESHOW - Only use main hero + 2 hero images */}
      <HeroSlideshow
        images={[room.heroImage, ...room.gallery.slice(0, 2)]}
        roomName={room.name}
        price={room.price}
        interval={5000}
      />

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

            {/* House Rules / Timings */}
            {settings && (
              <div className="flex gap-8 mb-8 pb-8 border-b border-stone-200/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-stone-100 rounded-full text-stone-500">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Check-in</p>
                    <p className="font-serif font-bold text-stone-900">{formatTime(settings.checkInTime)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-stone-100 rounded-full text-stone-500">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Check-out</p>
                    <p className="font-serif font-bold text-stone-900">{formatTime(settings.checkOutTime)}</p>
                  </div>
                </div>
              </div>
            )}

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

              {/* General Availability */}
              <button
                onClick={() => { setSelectedUnit(null); setIsModalOpen(true); }}
                className="w-full bg-stone-900 text-white py-4 text-xs font-bold tracking-widest uppercase hover:bg-saffron hover:text-stone-900 transition-colors"
              >
                Check Availability
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SUBTYPE CARDS SECTION */}
      {units.filter(u => u.isActive !== false).length > 0 && (
        <div className="w-full bg-stone-50 py-24 border-t border-stone-200">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mb-12">
              <p className="text-xs font-bold uppercase tracking-widest text-saffron mb-2">Choose Your Room</p>
              <h2 className="font-serif font-bold text-3xl text-stone-900">Select Your Preferred Space</h2>
              <p className="text-stone-500 mt-2 text-sm">Each room has its own character. Pick one that speaks to you.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {units.filter(u => u.isActive !== false).map(unit => (
                <div
                  key={unit._id}
                  className="group bg-white rounded-lg overflow-hidden border border-stone-200 hover:border-saffron hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => { setSelectedUnit(unit._id); setIsModalOpen(true); }}
                >
                  {/* Card Image */}
                  <div className="relative h-52 bg-stone-200 overflow-hidden">
                    {unit.image ? (
                      <Image
                        src={unit.image}
                        alt={unit.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-stone-300 to-stone-400 flex items-center justify-center">
                        <span className="text-white/50 text-4xl font-serif">{unit.name[0]}</span>
                      </div>
                    )}
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="bg-saffron text-stone-900 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                        Book →
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    <h3 className="font-serif font-bold text-lg text-stone-900 mb-1 group-hover:text-saffron transition-colors">
                      {unit.name}
                    </h3>
                    {unit.shortDescription && (
                      <p className="text-sm text-stone-500 mb-3 leading-relaxed">{unit.shortDescription}</p>
                    )}
                    {unit.features && unit.features.length > 0 && (
                      <ul className="space-y-1">
                        {unit.features.slice(0, 3).map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-stone-600">
                            <div className="w-1 h-1 bg-saffron rounded-full flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GALLERY PREVIEW + MODAL */}
      {room.gallery && room.gallery.length > 0 && (
        <div className="w-full bg-stone-900 py-24">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="font-serif font-bold text-2xl mb-12 text-stone-100">Closer Look</h3>

            {/* 3-Image Preview Layout */}
            <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-5 w-full">
              {room.gallery[0] && (
                <div
                  className="relative h-[500px] md:h-[800px] w-full cursor-pointer group"
                  onClick={() => { setCurrentSlide(0); setIsGalleryOpen(true); }}
                >
                  <Image
                    src={room.gallery[0]}
                    alt="Feature View"
                    fill
                    className="object-cover block rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
                </div>
              )}
              <div className="flex flex-col gap-5 h-full">
                {room.gallery[1] && (
                  <div
                    className="relative h-[240px] md:h-[390px] w-full cursor-pointer group"
                    onClick={() => { setCurrentSlide(1); setIsGalleryOpen(true); }}
                  >
                    <Image
                      src={room.gallery[1]}
                      alt="Detail"
                      fill
                      className="object-cover block rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
                  </div>
                )}
                {room.gallery[2] ? (
                  <div
                    className="relative h-[240px] md:h-[390px] w-full cursor-pointer group"
                    onClick={() => { setCurrentSlide(2); setIsGalleryOpen(true); }}
                  >
                    <Image
                      src={room.gallery[2]}
                      alt="Bath Detail"
                      fill
                      className="object-cover block rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
                    {/* View More overlay if more than 3 images */}
                    {room.gallery.length > 3 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                        <span className="text-white text-lg font-bold">+{room.gallery.length - 3} more</span>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>

            {/* View More Button */}
            {room.gallery.length > 3 && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => { setCurrentSlide(0); setIsGalleryOpen(true); }}
                  className="px-8 py-3 bg-saffron hover:bg-saffron/90 text-stone-900 font-bold text-sm uppercase tracking-wider rounded-lg transition-colors"
                >
                  View All {room.gallery.length} Photos
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FULLSCREEN GALLERY MODAL */}
      {isGalleryOpen && room.gallery && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={() => setIsGalleryOpen(false)}
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white/80 hover:text-white p-2 z-10"
            aria-label="Close gallery"
          >
            <X size={32} />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-4 md:top-8 md:left-8 text-white/80 text-sm font-medium">
            {currentSlide + 1} / {room.gallery.length}
          </div>

          {/* Arrow Left */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? room.gallery.length - 1 : prev - 1))}
            className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 z-10"
            aria-label="Previous image"
          >
            <ChevronLeft size={48} />
          </button>

          {/* Current Image */}
          <div className="w-full h-full flex items-center justify-center p-4 md:p-20 relative">
            <Image
              src={room.gallery[currentSlide]}
              alt={`Room view ${currentSlide + 1}`}
              fill
              className="object-contain"
            />
          </div>

          {/* Arrow Right */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev === room.gallery.length - 1 ? 0 : prev + 1))}
            className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 z-10"
            aria-label="Next image"
          >
            <ChevronRight size={48} />
          </button>

          {/* Thumbnail Strip */}
          <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto py-2 px-4">
            {room.gallery.map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`relative flex-shrink-0 w-16 h-12 md:w-20 md:h-14 rounded overflow-hidden border-2 transition-all ${currentSlide === index ? 'border-saffron' : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
              >
                <Image src={img} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

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
        {nextRoom && prevRoom && allRooms.length > 1 && (
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
