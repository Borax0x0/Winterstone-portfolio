"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Event {
    _id: string; // MongoDB uses _id
    id?: string; // Fallback for frontend compatibility
    title: string;
    date: string;
    desc: string;
    image: string;
}

interface EventContextType {
    events: Event[];
    upcomingEvents: Event[];
    pastEvents: Event[];
    isLoading: boolean;
    addEvent: (event: Omit<Event, "_id" | "id">) => Promise<void>;
    updateEvent: (id: string, updatedEvent: Partial<Event>) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch Events from API
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch('/api/events');
                if (res.ok) {
                    const data = await res.json();
                    setEvents(data);
                }
            } catch (error) {
                console.error("Failed to fetch events:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const addEvent = async (newEvent: Omit<Event, "_id" | "id">) => {
        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEvent),
            });

            if (res.ok) {
                const savedEvent = await res.json();
                setEvents((prev) => [...prev, savedEvent]);
            }
        } catch (error) {
            console.error("Failed to add event:", error);
            throw error;
        }
    };

    const updateEvent = async (id: string, updatedEvent: Partial<Event>) => {
        // Handle both _id and id for compatibility
        const targetId = id;

        try {
            const res = await fetch(`/api/events/${targetId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedEvent),
            });

            if (res.ok) {
                const savedEvent = await res.json();
                setEvents((prev) => prev.map((e) => (e._id === targetId || e.id === targetId ? savedEvent : e)));
            }
        } catch (error) {
            console.error("Failed to update event:", error);
            throw error;
        }
    };

    const deleteEvent = async (id: string) => {
        try {
            const res = await fetch(`/api/events/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setEvents((prev) => prev.filter((e) => e._id !== id && e.id !== id));
            }
        } catch (error) {
            console.error("Failed to delete event:", error);
            throw error;
        }
    };

    // Derived State: Split & Sort
    const today = new Date().toISOString().split("T")[0];

    const upcomingEvents = events
        .filter((e) => e.date >= today)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const pastEvents = events
        .filter((e) => e.date < today)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <EventContext.Provider value={{ events, upcomingEvents, pastEvents, isLoading, addEvent, updateEvent, deleteEvent }}>
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
