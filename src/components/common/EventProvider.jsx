import React, { createContext, useContext, useState, useEffect } from 'react';

const EventContext = createContext();

export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sample initial events
  const initialEvents = [
    {
      id: 1,
      title: "Faculty Meeting",
      text: "Faculty Meeting",
      start: "2025-07-21T10:00:00",
      end: "2025-07-21T12:00:00",
      color: "#4B9CE2",
      type: "faculty_meeting",
      createdBy: "admin",
      assignedTo: ["FAC001", "FAC002"],
      description: "Monthly faculty meeting to discuss curriculum updates"
    },
    {
      id: 2,
      title: "Math Exam - CSE A",
      text: "Math Exam - CSE A",
      start: "2025-07-23T09:00:00",
      end: "2025-07-23T11:00:00",
      color: "#EA5455",
      type: "exam",
      createdBy: "admin",
      assignedTo: ["STU001", "STU005"],
      description: "Mid-semester mathematics examination"
    },
    {
      id: 3,
      title: "Study Session",
      text: "Study Session",
      start: "2025-07-24T14:00:00",
      end: "2025-07-24T16:00:00",
      color: "#50C878",
      type: "personal_study",
      createdBy: "STU001",
      assignedTo: ["STU001"],
      description: "Personal study time for data structures"
    }
  ];

  // Load events from localStorage on mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('calendarEvents');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    } else {
      setEvents(initialEvents);
    }
  }, []);

  // Save events to localStorage whenever events change
  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem('calendarEvents', JSON.stringify(events));
    }
  }, [events]);

  const addEvent = (event) => {
    const newEvent = {
      ...event,
      id: event.id || Date.now() + Math.random(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setEvents(prev => [...prev, newEvent]);
    return newEvent;
  };

  const updateEvent = (updatedEvent) => {
    setEvents(prev => prev.map(event => 
      event.id === updatedEvent.id 
        ? { ...updatedEvent, updatedAt: new Date().toISOString() }
        : event
    ));
  };

  const deleteEvent = (eventId) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

  const getEventsByUser = (userId) => {
    return events.filter(event => 
      event.createdBy === userId || event.assignedTo?.includes(userId)
    );
  };

  const getEventsByType = (eventType) => {
    return events.filter(event => event.type === eventType);
  };

  const getEventsByDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return events.filter(event => {
      const eventStart = new Date(event.start);
      return eventStart >= start && eventStart <= end;
    });
  };

  const clearAllEvents = () => {
    setEvents([]);
    localStorage.removeItem('calendarEvents');
  };

  const value = {
    events,
    loading,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsByUser,
    getEventsByType,
    getEventsByDateRange,
    clearAllEvents
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};