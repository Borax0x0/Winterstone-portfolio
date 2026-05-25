"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, X, Clock, RotateCcw } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AvailabilityModal from "@/components/AvailabilityModal";
import ReviewForm from "@/components/ReviewForm";
import ReviewsList from "@/components/ReviewsList";
import HeroSlideshow from "@/components/HeroSlideshow";

// Fallback data in case API is not populated yet
const fallbackRoomsData = [
  {
    slug: "skyline-haven",
    name: "Skyline Haven",
    price: 2499,
    heroImage: "/skyline-room-1.jpg",
    gallery: ["/skyline-balcony-4.jpg", "/skyline-room-2.jpg", "/skyline-balcony-1.jpg", "/skyline-balcony-2.jpg", "/skyline-balcony-3.jpg", "/skyline-bathroom-1.jpg", "/skyline-bathroom-2.jpg"],
    videoUrl: "/skyline-room-tour.mp4",
    description: "Our premier offering, defined by its warm intimacy and classic alpine elegance. The Skyline Haven features a striking solid wood headboard and premium linens, creating a deeply private retreat. Soft sconce lighting sets the mood, making it the perfect end-of-day sanctuary after exploring the mountains.",
    amenities: ["Private Mountain Balcony", "Valley View", "King Size Bed", "Heated Floors", "Work Desk", "High-Speed Wi-Fi"],
  },
  {
    slug: "zen-nest",
    name: "Zen Nest",
    price: 1499,
    heroImage: "/zen-room-1.jpg",
    gallery: ["/zen-room-2.jpg", "/zen-window.jpg", "/zen-bathroom-1.jpg", "/zen-bathroom-2.jpg"],
    videoUrl: null,
    description: "A spacious, grounded escape bathed in mountain light. The Zen Nest features wall-to-wall windows draped in rich golden textiles, plush velvet seating, and a striking wooden bedframe. With plenty of open floor space and sunlight reflecting across the pristine tilework, it's designed for absolute comfort and quiet reflection.",
    amenities: ["Yoga & Meditation Space", "Soundproofing", "Meditation Cushions", "Herbal Tea Station", "Dimmable Lighting", "Queen Bed"],
  },
  {
    slug: "sunlit-studio",
    name: "Sunlit Studio",
    price: 1799,
    heroImage: "/sunlit-room-1.jpg",
    gallery: ["/sunlit-room-3.jpg", "/sunlit-balcony.jpg", "/sunlit-room-2.jpg", "/sunlit-bathroom-1.jpg", "/sunlit-bathroom-2.jpg"],
    videoUrl: "/sunlit-room-tour.mp4",
    description: "A breathtaking intersection of comfort and the outdoors. The Sunlit Studio earns its name from the magnificent natural sunlight that floods through its large glass doors. Enjoy your morning coffee on the private balcony, or relax in the deep green velvet seating while the golden hour illuminates your suite.",
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
  videoUrl?: string | null;
}

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [units, setUnits] = useState<{ _id: string; name: string; isActive: boolean; image: string; shortDescription: string; features: string[] }[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [settings, setSettings] = useState<{ checkInTime: string; checkOutTime: string } | null>(null);

  // Inline calendar state
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [isLoadingDates, setIsLoadingDates] = useState(true);

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

  // Fetch blocked dates when slug changes
  useEffect(() => {
    if (!params.slug) return;
    const fetchBlocked = async () => {
      setIsLoadingDates(true);
      try {
        const res = await fetch(`/api/bookings/availability?room=${params.slug}`);
        const data = await res.json();
        if (res.ok && data.blockedDates) {
          setBlockedDates(data.blockedDates.map((d: string) => new Date(d)));
        }
      } catch {
        // silently fail — calendar still works without blocked dates
      } finally {
        setIsLoadingDates(false);
      }
    };
    fetchBlocked();
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

          {/* Booking Sidebar */}
          <div className="relative">
            <div className="bg-stone-100 p-6 rounded-sm border border-stone-200">
              <h3 className="font-serif font-bold text-xl mb-1">Reserve Your Stay</h3>
              <p className="text-xs text-stone-500 mb-5 tracking-wide">Best rates guaranteed when booking directly.</p>

              {/* Inline Calendar */}
              <div className="relative mb-3">
                {isLoadingDates && (
                  <div className="absolute inset-0 bg-stone-100/80 z-10 flex items-center justify-center rounded-sm">
                    <span className="text-[10px] text-stone-400 uppercase tracking-widest animate-pulse">Loading availability...</span>
                  </div>
                )}
                <DatePicker
                  selected={checkInDate}
                  onChange={(dates: [Date | null, Date | null]) => {
                    const [start, end] = dates;
                    setCheckInDate(start);
                    setCheckOutDate(end);
                  }}
                  startDate={checkInDate}
                  endDate={checkOutDate}
                  selectsRange
                  inline
                  monthsShown={1}
                  minDate={new Date()}
                  excludeDates={blockedDates}
                  dateFormat="MMM d, yyyy"
                />
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                <span className="flex items-center gap-1.5 text-[10px] text-stone-400 uppercase tracking-wider">
                  <span className="inline-block w-2.5 h-2.5 rounded-sm bg-saffron/70"></span>Selected
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-stone-400 uppercase tracking-wider">
                  <span className="inline-block w-2.5 h-2.5 rounded-sm bg-red-200"></span>Booked
                </span>
              </div>

              {/* Selected date summary */}
              {checkInDate && (
                <div className="mb-4 p-3 bg-white border border-stone-200 text-xs">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div>
                        <span className="text-stone-400 uppercase tracking-widest block">Check In</span>
                        <span className="font-semibold text-stone-800">{checkInDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 uppercase tracking-widest block">Check Out</span>
                        <span className="font-semibold text-stone-800">{checkOutDate ? checkOutDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => { setCheckInDate(null); setCheckOutDate(null); }}
                      className="text-stone-300 hover:text-red-400 transition-colors"
                      aria-label="Clear dates"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* CTA */}
              <button
                disabled={!checkInDate || !checkOutDate}
                onClick={() => {
                  if (!checkInDate || !checkOutDate) return;
                  const params = new URLSearchParams({
                    room: room!.slug,
                    checkin: checkInDate.toISOString(),
                    checkout: checkOutDate.toISOString(),
                  });
                  router.push(`/book?${params.toString()}`);
                }}
                className="w-full bg-stone-900 text-white py-4 text-xs font-bold tracking-widest uppercase hover:bg-saffron hover:text-stone-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-stone-900 disabled:hover:text-white"
              >
                {checkInDate && checkOutDate ? 'Book These Dates →' : 'Select Dates Above'}
              </button>

              {/* Unit-specific availability link */}
              <button
                onClick={() => { setSelectedUnit(null); setIsModalOpen(true); }}
                className="w-full mt-2 py-2 text-[10px] text-stone-400 hover:text-saffron transition-colors uppercase tracking-widest"
              >
                Browse specific rooms →
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
      {room.gallery && room.gallery.length > 0 && (() => {
        const totalItems = room.gallery.length + (room.videoUrl ? 1 : 0);
        return (
        <div className="w-full bg-stone-900 py-24">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="font-serif font-bold text-2xl mb-12 text-stone-100">Closer Look</h3>

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
                    {totalItems > 3 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                        <span className="text-white text-lg font-bold">+{totalItems - 3} more</span>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>

            {totalItems > 3 && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => { setCurrentSlide(0); setIsGalleryOpen(true); }}
                  className="px-8 py-3 bg-saffron hover:bg-saffron/90 text-stone-900 font-bold text-sm uppercase tracking-wider rounded-lg transition-colors"
                >
                  View All {totalItems} Photos{room.videoUrl ? ' & Tour' : ''}
                </button>
              </div>
            )}
          </div>
        </div>
        );
      })()}

      {/* FULLSCREEN GALLERY MODAL */}
      {isGalleryOpen && room.gallery && (() => {
        const totalItems = room.gallery.length + (room.videoUrl ? 1 : 0);
        const isVideoSlide = room.videoUrl && currentSlide === room.gallery.length;
        return (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <button
            onClick={() => setIsGalleryOpen(false)}
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white/80 hover:text-white p-2 z-10"
            aria-label="Close gallery"
          >
            <X size={32} />
          </button>

          <div className="absolute top-4 left-4 md:top-8 md:left-8 text-white/80 text-sm font-medium">
            {currentSlide + 1} / {totalItems}
          </div>

          <button
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? totalItems - 1 : prev - 1))}
            className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 z-10"
            aria-label="Previous image"
          >
            <ChevronLeft size={48} />
          </button>

          <div className="w-full h-full flex items-center justify-center p-4 md:p-20 relative">
            {isVideoSlide ? (
              <video
                src={room.videoUrl!}
                controls
                autoPlay
                className="max-w-full max-h-full rounded-lg"
              />
            ) : (
              <Image
                src={room.gallery[currentSlide]}
                alt={`Room view ${currentSlide + 1}`}
                fill
                className="object-contain"
              />
            )}
          </div>

          <button
            onClick={() => setCurrentSlide((prev) => (prev === totalItems - 1 ? 0 : prev + 1))}
            className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 z-10"
            aria-label="Next image"
          >
            <ChevronRight size={48} />
          </button>

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
            {room.videoUrl && (
              <button
                onClick={() => setCurrentSlide(room.gallery.length)}
                className={`relative flex-shrink-0 w-16 h-12 md:w-20 md:h-14 rounded overflow-hidden border-2 transition-all flex items-center justify-center bg-stone-800 ${currentSlide === room.gallery.length ? 'border-saffron' : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
              >
                <span className="text-white text-[8px] font-bold uppercase tracking-wider">Tour</span>
              </button>
            )}
          </div>
        </div>
        );
      })()}

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
