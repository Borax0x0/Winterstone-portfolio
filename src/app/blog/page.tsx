"use client";

import React from "react";
import { motion } from "framer-motion";

import { useAuth } from "@/context/AuthContext";
import { useEvents, Event } from "@/context/EventContext";
import { Plus, Edit2, Trash2 } from "lucide-react";
import EventModal from "@/components/EventModal";
import toast from "react-hot-toast";
import { useState } from "react";

export default function BlogPage() {
  const { user } = useAuth();
  const { upcomingEvents, pastEvents, addEvent, updateEvent, deleteEvent } = useEvents();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>(undefined);

  const openModal = (mode: "add" | "edit", event?: Event) => {
    setModalMode(mode);
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleSave = (eventData: Omit<Event, "id">) => {
    if (modalMode === "add") {
      addEvent(eventData);
      toast.success("Event created successfully!");
    } else if (modalMode === "edit" && selectedEvent) {
      updateEvent(selectedEvent.id, eventData);
      toast.success("Event updated!");
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      deleteEvent(id);
      toast.success("Event deleted.");
    }
  };

  return (
    <main className="bg-cream min-h-screen">
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        title={modalMode === "add" ? "Create New Event" : "Edit Event"}
        initialData={selectedEvent}
      />

      {/* 1. HERO HEADER */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-stone-900">

        {/* Background Image */}
        <img
          src="/blog-header.jpg"
          alt="Himalayan Background"
          className="absolute inset-0 w-full h-full object-cover opacity-80" // Increased opacity slightly for drama
        />

        {/* Dark Overlay to ensure white text is readable */}
        <div className="absolute inset-0 bg-black/30 z-0" />

        <div className="relative z-10 text-center text-white px-6 mt-12"> {/* Added mt-12 to visually center content better against navbar */}
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="block text-saffron font-bold tracking-[0.3em] text-xs uppercase mb-4"
          >
            Est. 1984
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-8xl font-serif font-bold" // Made text slightly larger
          >
            The Journal
          </motion.h1>
          <p className="mt-6 text-white/90 font-light max-w-lg mx-auto text-lg">
            Chronicles of history, culture, and life at 8,000 feet.
          </p>
        </div>
      </section>

      {/* 2. HISTORY (The Narrative) */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-stone-dark">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="prose prose-lg mx-auto text-center"
        >
          <span className="text-saffron text-xs tracking-widest uppercase mb-4 block">Our Heritage</span>
          <h2 className="font-serif text-4xl mb-8">Forged from the Mountain</h2>
          <p className="font-light text-lg leading-relaxed mb-8">
            Winterstone began not as a hotel, but as a refuge for mountaineers attempting the northern ascent.
            The original structure was a simple stone cabin, built by hand using granite quarried from the very ridge it sits upon.
          </p>
          <p className="font-light text-lg leading-relaxed mb-12">
            Surrounded by ancient Deodar forests and overlooking the Silent Valley, the location was chosen for its
            unnatural stillness. The wind here doesn't howl; it whispers. Today, we honor that heritage by maintaining
            the original raw stone walls in our lobby, reminding every guest that luxury here is defined by nature, not gold.
          </p>

          <div className="w-24 h-[1px] bg-saffron mx-auto opacity-50 my-16"></div>
        </motion.div>
      </section>

      {/* 3. THE GUARDIAN (The Dog) */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-saffron text-xs tracking-widest uppercase mb-4 block">The Guardian</span>
            <h2 className="font-serif text-4xl text-stone-dark mb-6">A Silent Companion</h2>
            <p className="text-stone-600 font-light leading-relaxed mb-6">
              If you wake early enough to catch the sunrise, you might spot him. "Buster" isn't technically on the payroll,
              but he has been the soul of Winterstone for over a decade. A local mountain shepherd mix with eyes as deep
              as the valley, he roams the grounds with a quiet dignity.
            </p>
            <p className="text-stone-600 font-light leading-relaxed">
              He rarely enters the lodge, preferring the crisp air of the terrace. He chooses who he greets,
              and guests often say that a nod from Buster is the truest sign of welcome this mountain can offer.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[500px] w-full bg-stone-100 rounded-sm overflow-hidden"
          >
            <img
              src="/blog-dog.jpg"
              alt="Mountain Dog"
              className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </motion.div>
        </div>
      </section>

      {/* 4. WINTER VIEWS (Snowfall) */}
      <section className="py-24 bg-stone-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-2 md:order-1 relative h-[500px] w-full bg-white rounded-sm overflow-hidden"
          >
            <img
              src="/blog-snow.jpg"
              alt="Heavy Snow"
              className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-1 md:order-2"
          >
            <span className="text-saffron text-xs tracking-widest uppercase mb-4 block">The Season</span>
            <h2 className="font-serif text-4xl text-stone-dark mb-6">The White Silence</h2>
            <p className="text-stone-600 font-light leading-relaxed mb-6">
              When winter arrives, it doesn't just snow—it transforms the world. Winterstone is famous for its
              "astonishing snowfall," where feet of fresh powder can fall overnight, blanketing the sharp jagged
              peaks in soft, rolling white.
            </p>
            <p className="text-stone-600 font-light leading-relaxed">
              The view from the Great Hall during a storm is hypnotic; a wall of white moving against the glass
              while you sit by the fire. And when the storm breaks, the sun hitting the fresh snow creates a
              blinding, diamond-like clarity that simply doesn't exist at lower altitudes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 5. UPCOMING EVENTS */}
      <section className="bg-stone-900 text-cream py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-white/10 pb-6">
            <div>
              <span className="text-saffron text-xs tracking-widest uppercase mb-2 block">Gatherings</span>
              <h2 className="font-serif text-4xl">Upcoming Events</h2>
            </div>
            <div className="flex flex-col items-end gap-4 mt-4 md:mt-0">
              <p className="text-white/60 text-sm max-w-md font-light text-right">
                We organize intimate events designed to connect you with the landscape and fellow travelers.
              </p>
              {/* ADMIN: Add Event Button */}
              {user?.role === "admin" && (
                <button
                  onClick={() => openModal("add")}
                  className="bg-saffron text-stone-900 px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2"
                >
                  <Plus size={16} /> Add Event
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="group relative"
                >
                  <div className="h-64 w-full bg-stone-800 rounded-sm overflow-hidden mb-6 relative">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    />

                    {/* ADMIN ACTIONS OVERLAY */}
                    {user?.role === "admin" && (
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                          onClick={(e) => { e.stopPropagation(); openModal("edit", event); }}
                          className="bg-white/90 p-2 rounded-full text-stone-900 hover:text-saffron hover:bg-white transition-colors"
                          title="Edit Event"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(event.id); }}
                          className="bg-red-500/90 p-2 rounded-full text-white hover:bg-red-600 transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  <span className="text-xs text-saffron tracking-widest uppercase mb-2 block">{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  <h3 className="text-xl font-serif font-bold mb-3 group-hover:text-saffron transition-colors">{event.title}</h3>
                  <p className="text-sm text-white/60 font-light leading-relaxed">{event.desc}</p>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 border border-dashed border-stone-800 rounded-lg">
                <p className="text-stone-500">No upcoming events scheduled.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. PAST EVENTS */}
      <section className="bg-stone-800 text-cream py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">

          <div className="mb-12">
            <span className="text-stone-500 text-xs tracking-widest uppercase mb-2 block">Archives</span>
            <h2 className="font-serif text-3xl text-white/80">Past Gatherings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pastEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group opacity-60 hover:opacity-100 transition-opacity duration-500 relative"
              >
                <div className="h-48 w-full bg-stone-700 rounded-sm overflow-hidden mb-6 relative grayscale group-hover:grayscale-0 transition-all">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100"
                  />

                  {/* ADMIN ACTIONS OVERLAY (For Past Events too) */}
                  {user?.role === "admin" && (
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={(e) => { e.stopPropagation(); openModal("edit", event); }}
                        className="bg-white/90 p-2 rounded-full text-stone-900 hover:text-saffron hover:bg-white transition-colors"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(event.id); }}
                        className="bg-red-500/90 p-2 rounded-full text-white hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-stone-400 tracking-widest uppercase mb-2 block">{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <h3 className="text-lg font-serif font-bold mb-2 text-white/90">{event.title}</h3>
                <p className="text-xs text-white/50 font-light leading-relaxed">{event.desc}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. SURROUNDINGS */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
            <span className="text-saffron text-xs tracking-widest uppercase mb-4 block">The Surroundings</span>
            <h2 className="font-serif text-4xl text-stone-dark mb-6">The Silent Valley</h2>
            <p className="text-stone-600 font-light mb-6 leading-relaxed">
              Winterstone is isolated by design. To reach us, you travel 45 minutes up a private winding road
              lined with rhododendrons. The air is crisp, carrying the scent of pine and wet earth.
            </p>
            <ul className="space-y-4 text-sm text-stone-800 font-medium tracking-wide">
              <li className="flex items-center"><div className="w-1.5 h-1.5 bg-saffron rounded-full mr-3" /> 8,000 ft Elevation</li>
              <li className="flex items-center"><div className="w-1.5 h-1.5 bg-saffron rounded-full mr-3" /> Private Pine Forest Access</li>
              <li className="flex items-center"><div className="w-1.5 h-1.5 bg-saffron rounded-full mr-3" /> Natural Spring Water Source</li>
            </ul>
          </div>

          <div className="order-1 md:order-2 h-[500px] bg-stone-200 w-full relative rounded-sm overflow-hidden">
            <img
              src="/blog-surroundings.jpg"
              alt="Silent Valley"
              className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </section>

    </main>
  );
}