"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Event {
    id: string;
    title: string;
    date: string; // ISO Date String YYYY-MM-DD
    desc: string;
    image: string;
}

interface EventContextType {
    events: Event[];
    upcomingEvents: Event[];
    pastEvents: Event[];
    addEvent: (event: Omit<Event, "id">) => void;
    updateEvent: (id: string, updatedEvent: Partial<Event>) => void;
    deleteEvent: (id: string) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

// Initial Mock Data (Converted to specific dates for demo logic)
const INITIAL_EVENTS: Event[] = [
    {
        id: "1",
        title: "Aprés Ski DJ Nights",
        date: "2026-02-14", // Future
        desc: "As the sun sets behind the peaks, the Great Hall comes alive. Our curated lineup of electronic and downtempo artists provides the perfect soundtrack to your evening cocktail.",
        image: "/event-dj.jpg"
    },
    {
        id: "2",
        title: "The Winter Solstice",
        date: "2026-12-21", // Future
        desc: "An annual tradition where we shut off all electricity and light the Great Hall solely with beeswax candles and the central hearth. A celebration of darkness and return to light.",
        image: "/event-fire.jpg"
    },
    {
        id: "3",
        title: "Alpine Yoga Retreat",
        date: "2026-03-01", // Future
        desc: "Greet the sun as it rises over the Himalayas. Our resident instructor leads a flow designed to acclimate your body to the altitude and stillness.",
        image: "/event-yoga.jpg"
    },
    {
        id: "4",
        title: "Autumn Jazz Evening",
        date: "2025-10-14", // Past
        desc: "A night of smooth jazz and local wine by the fire, featuring the quartet from Shimla.",
        image: "/event-jazz.jpg"
    },
    {
        id: "5",
        title: "Himalayan Photography",
        date: "2025-09-05", // Past
        desc: "A weekend workshop with renowned nature photographer Arjun Mark, capturing the valley's transition.",
        image: "/event-photo.jpg"
    },
    {
        id: "6",
        title: "Chef's Foraging Table",
        date: "2025-08-20", // Past
        desc: "Guests joined our head chef to forage wild mushrooms, followed by a 7-course tasting menu.",
        image: "/event-food.jpg"
    }
];

export function EventProvider({ children }: { children: React.ReactNode }) {
    const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
    const [isMounted, setIsMounted] = useState(false);

    // Load from LocalStorage
    useEffect(() => {
        setIsMounted(true);
        const storedEvents = localStorage.getItem("winterstone_events");
        if (storedEvents) {
            setEvents(JSON.parse(storedEvents));
        }
    }, []);

    // Save to LocalStorage
    useEffect(() => {
        if (isMounted) {
            localStorage.setItem("winterstone_events", JSON.stringify(events));
        }
    }, [events, isMounted]);

    const addEvent = (newEvent: Omit<Event, "id">) => {
        const event = { ...newEvent, id: crypto.randomUUID() };
        setEvents((prev) => [...prev, event]);
    };

    const updateEvent = (id: string, updatedEvent: Partial<Event>) => {
        setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updatedEvent } : e)));
    };

    const deleteEvent = (id: string) => {
        setEvents((prev) => prev.filter((e) => e.id !== id));
    };

    // Derived State: Split & Sort
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD comparison

    const upcomingEvents = events
        .filter((e) => e.date >= today)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Ascending

    const pastEvents = events
        .filter((e) => e.date < today)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Descending (Most recent first)

    return (
        <EventContext.Provider value={{ events, upcomingEvents, pastEvents, addEvent, updateEvent, deleteEvent }}>
            {children}
        </EventContext.Provider>
    );
}

export const useEvents = () => {
    const context = useContext(EventContext);
    if (!context) {
        throw new Error("useEvents must be used within an EventProvider");
    }
    return context;
};
