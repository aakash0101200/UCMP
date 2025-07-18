import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import CalendarGrid from './CalendarGrid';
import EventModal  from "./EventModal";
import EventList from "@/components/Calendar/EventList"; // ✅ CORRECT
import axios from "axios";

//const API_BASE = "http://localhost:8080/api/events"; // Your Spring Boot backend

export default function CalendarContainer() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [currentView, setCurrentView] = useState("month"); // "month" or "upcoming"

  // Fetch events on mount or when selectedDate changes
  // useEffect(() => {
  //   const fetchEvents = async () => {
  //     try {
  //       const res = await axios.get(
  //         `${API_BASE}?view=month&date=${selectedDate.toISOString().slice(0, 10)}`
  //       );
  //       setEvents(res.data);
  //     } catch (err) {
  //       console.error("Error fetching events", err);
  //     }
  //   };

  //   fetchEvents();
  // }, [selectedDate]);

  useEffect(() => {
  // TEMPORARY MOCK DATA
  const mockEvents = [
    {
      id: 1,
      title: "Mock Event A",
      description: "Test description A",
      startDateTime: "2025-07-17T10:00:00",
      endDateTime: "2025-07-17T12:00:00"
    },
    {
      id: 2,
      title: "Mock Event B",
      description: "Test description B",
      startDateTime: "2025-07-18T09:00:00",
      endDateTime: "2025-07-18T10:00:00"
    }
  ];

  setEvents(mockEvents);
}, [selectedDate]);


  const handleNewEvent = () => {
    setEditingEvent(null);
    setShowModal(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowModal(true);
  };

  const handleSaveEvent = async (eventData) => {
    try {
      if (eventData.id) {
        await axios.put(`${API_BASE}/${eventData.id}`, eventData);
      } else {
        await axios.post(API_BASE, eventData);
      }

      setShowModal(false);
      setEditingEvent(null);

      const res = await axios.get(
        `${API_BASE}?view=month&date=${selectedDate.toISOString().slice(0, 10)}`
      );
      setEvents(res.data);
    } catch (err) {
      console.error("Error saving event", err);
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await axios.delete(`${API_BASE}/${id}`);
      const res = await axios.get(
        `${API_BASE}?view=month&date=${selectedDate.toISOString().slice(0, 10)}`
      );
      setEvents(res.data);
    } catch (err) {
      console.error("Error deleting event", err);
    }
  };

  const upcomingEvents = events
    .filter((event) => new Date(event.startDateTime) >= new Date())
    .sort(
      (a, b) =>
        new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
    );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">My Calendar</h2>
        <div className="flex gap-2">
          <Button
            variant={currentView === "month" ? "default" : "outline"}
            onClick={() => setCurrentView("month")}
          >
            Month View
          </Button>
          <Button
            variant={currentView === "upcoming" ? "default" : "outline"}
            onClick={() => setCurrentView("upcoming")}
          >
            Upcoming
          </Button>
          <Button onClick={handleNewEvent}>+ New Event</Button>
        </div>
      </div>

      {currentView === "month" && (
        <CalendarGrid
          events={events}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onEventClick={handleEditEvent}
        />
      )}

      {currentView === "upcoming" && (
        <EventList
          events={upcomingEvents}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
        />
      )}

      {showModal && (
        <EventModal
          event={editingEvent}
          onClose={() => setShowModal(false)}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
}
