// import React, { useEffect, useState } from "react";
// import { Button } from "../ui/button";
// import CalendarGrid from './CalendarGrid';
// import EventModal  from "./EventModal";
// import EventList from "@/components/Calendar/EventList"; // ✅ CORRECT
// import axios from "axios";

// //const API_BASE = "http://localhost:8080/api/events"; // Your Spring Boot backend

// export default function CalendarContainer() {
//   const [events, setEvents] = useState([]);
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [showModal, setShowModal] = useState(false);
//   const [editingEvent, setEditingEvent] = useState(null);
//   const [currentView, setCurrentView] = useState("month"); // "month" or "upcoming"

//   // Fetch events on mount or when selectedDate changes
//   // useEffect(() => {
//   //   const fetchEvents = async () => {
//   //     try {
//   //       const res = await axios.get(
//   //         `${API_BASE}?view=month&date=${selectedDate.toISOString().slice(0, 10)}`
//   //       );
//   //       setEvents(res.data);
//   //     } catch (err) {
//   //       console.error("Error fetching events", err);
//   //     }
//   //   };

//   //   fetchEvents();
//   // }, [selectedDate]);

//   useEffect(() => {
//   // TEMPORARY MOCK DATA
//   const mockEvents = [
//     {
//       id: 1,
//       title: "Mock Event A",
//       description: "Test description A",
//       startDateTime: "2025-07-17T10:00:00",
//       endDateTime: "2025-07-17T12:00:00"
//     },
//     {
//       id: 2,
//       title: "Mock Event B",
//       description: "Test description B",
//       startDateTime: "2025-07-18T09:00:00",
//       endDateTime: "2025-07-18T10:00:00"
//     }
//   ];

//   setEvents(mockEvents);
// }, [selectedDate]);


//   const handleNewEvent = () => {
//     setEditingEvent(null);
//     setShowModal(true);
//   };

//   const handleEditEvent = (event) => {
//     setEditingEvent(event);
//     setShowModal(true);
//   };

//   const handleSaveEvent = async (eventData) => {
//     try {
//       if (eventData.id) {
//         await axios.put(`${API_BASE}/${eventData.id}`, eventData);
//       } else {
//         await axios.post(API_BASE, eventData);
//       }

//       setShowModal(false);
//       setEditingEvent(null);

//       const res = await axios.get(
//         `${API_BASE}?view=month&date=${selectedDate.toISOString().slice(0, 10)}`
//       );
//       setEvents(res.data);
//     } catch (err) {
//       console.error("Error saving event", err);
//     }
//   };

//   const handleDeleteEvent = async (id) => {
//     try {
//       await axios.delete(`${API_BASE}/${id}`);
//       const res = await axios.get(
//         `${API_BASE}?view=month&date=${selectedDate.toISOString().slice(0, 10)}`
//       );
//       setEvents(res.data);
//     } catch (err) {
//       console.error("Error deleting event", err);
//     }
//   };

//   const upcomingEvents = events
//     .filter((event) => new Date(event.startDateTime) >= new Date())
//     .sort(
//       (a, b) =>
//         new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
//     );

//   return (
//     <div className="p-4">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-2xl font-bold">My Calendar</h2>
//         <div className="flex gap-2">
//           <Button
//             variant={currentView === "month" ? "default" : "outline"}
//             onClick={() => setCurrentView("month")}
//           >
//             Month View
//           </Button>
//           <Button
//             variant={currentView === "upcoming" ? "default" : "outline"}
//             onClick={() => setCurrentView("upcoming")}
//           >
//             Upcoming
//           </Button>
//           <Button onClick={handleNewEvent}>+ New Event</Button>
//         </div>
//       </div>

//       {currentView === "month" && (
//         <CalendarGrid
//           events={events}
//           selectedDate={selectedDate}
//           onDateChange={setSelectedDate}
//           onEventClick={handleEditEvent}
//         />
//       )}

//       {currentView === "upcoming" && (
//         <EventList
//           events={upcomingEvents}
//           onEdit={handleEditEvent}
//           onDelete={handleDeleteEvent}
//         />
//       )}

//       {showModal && (
//         <EventModal
//           event={editingEvent}
//           onClose={() => setShowModal(false)}
//           onSave={handleSaveEvent}
//           onDelete={handleDeleteEvent}
//         />
//       )}
//     </div>
//   );
// }





import React, { useState, useEffect } from "react";
import { DayPilotCalendar, DayPilotMonth } from "@daypilot/daypilot-lite-react";
import EventModal from "./EventModal";
import AdminEventManager from "./AdminEventManager";
import StudentEventManager from "./StudentEventManager";
import NotificationSystem from "./NotificationSystem";
import { useRole } from "../../hooks/useRole";
import { useEvents } from "../../hooks/useEvents";

const ResponsiveEventCalendar = () => {
  const { userRole, studentId } = useRole();
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const [viewType, setViewType] = useState("Week");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showStudentPanel, setShowStudentPanel] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Responsive breakpoint detection
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      
      // Auto-adjust view type based on screen size
      if (width < 480) {
        setViewType("Day"); // Force day view on very small screens
      } else if (width < 768) {
        setViewType("Week"); // Week view for mobile
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter events based on user role
  const filteredEvents = events.filter(event => {
    if (userRole === 'admin') return true;
    if (userRole === 'faculty') return event.createdBy === studentId || event.assignedTo?.includes(studentId);
    if (userRole === 'student') return event.assignedTo?.includes(studentId) || event.createdBy === studentId;
    return false;
  });

  const handleViewChange = (newView) => {
    setViewType(newView);
  };

  const handleTimeRangeSelected = (args) => {
    setSelectedEvent({
      start: args.start,
      end: args.end,
      isNew: true
    });
    setShowEventModal(true);
  };

  const handleEventClick = (args) => {
    setSelectedEvent(args.e.data);
    setShowEventModal(true);
  };

  const handleEventSave = (eventData) => {
    if (eventData.isNew) {
      addEvent(eventData);
    } else {
      updateEvent(eventData);
    }
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  const handleEventDelete = (eventId) => {
    deleteEvent(eventId);
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Responsive calendar configuration
  const getCalendarConfig = () => {
    const baseConfig = {
      events: filteredEvents,
      startDate: formatDate(selectedDate),
      onTimeRangeSelected: handleTimeRangeSelected,
      onEventClick: handleEventClick,
      timeRangeSelectingStartEndEnabled: true,
      eventMoveHandling: "Update",
      eventResizeHandling: "Update",
      onEventMoved: (args) => {
        const updatedEvent = {
          ...args.e.data,
          start: args.newStart,
          end: args.newEnd
        };
        updateEvent(updatedEvent);
      },
      onEventResized: (args) => {
        const updatedEvent = {
          ...args.e.data,
          start: args.newStart,
          end: args.newEnd
        };
        updateEvent(updatedEvent);
      }
    };

    if (isMobile) {
      return {
        ...baseConfig,
        eventHeight: 24,
        cellHeight: 36,
        columnWidthMin: 80,
        businessBeginsHour: 8,
        businessEndsHour: 18,
        headerHeight: 40
      };
    } else if (isTablet) {
      return {
        ...baseConfig,
        eventHeight: 28,
        cellHeight: 42,
        columnWidthMin: 100,
        businessBeginsHour: 7,
        businessEndsHour: 19,
        headerHeight: 45
      };
    } else {
      return {
        ...baseConfig,
        eventHeight: 32,
        cellHeight: 48,
        columnWidthMin: 120,
        businessBeginsHour: 6,
        businessEndsHour: 22,
        headerHeight: 50
      };
    }
  };

  const getMonthConfig = () => {
    const baseConfig = {
      events: filteredEvents,
      startDate: formatDate(selectedDate),
      onTimeRangeSelected: handleTimeRangeSelected,
      onEventClick: handleEventClick,
      timeRangeSelectingStartEndEnabled: true,
      eventMoveHandling: "Update",
      eventResizeHandling: "Update",
      onEventMoved: (args) => {
        const updatedEvent = {
          ...args.e.data,
          start: args.newStart,
          end: args.newEnd
        };
        updateEvent(updatedEvent);
      }
    };

    if (isMobile) {
      return {
        ...baseConfig,
        eventHeight: 18,
        cellHeight: 60,
        eventBarVisible: false
      };
    } else if (isTablet) {
      return {
        ...baseConfig,
        eventHeight: 22,
        cellHeight: 70,
        eventBarVisible: false
      };
    } else {
      return {
        ...baseConfig,
        eventHeight: 25,
        cellHeight: 80,
        eventBarVisible: false
      };
    }
  };

  return (
    <div className="responsive-calendar-container">
      {/* Header with responsive controls */}
      <div className="calendar-header">
        <div className="header-left">
          <h2 className="calendar-title">
            {isMobile ? "Calendar" : "College Dashboard Calendar"}
          </h2>
          <NotificationSystem 
            events={filteredEvents}
            userRole={userRole}
            studentId={studentId}
          />
        </div>

        <div className="view-controls">
          {!isMobile && (
            <button
              className={`view-btn ${viewType === "Day" ? "active" : ""}`}
              onClick={() => handleViewChange("Day")}
            >
              {isTablet ? "D" : "Day"}
            </button>
          )}
          <button
            className={`view-btn ${viewType === "Week" ? "active" : ""}`}
            onClick={() => handleViewChange("Week")}
          >
            {isTablet ? "W" : "Week"}
          </button>
          <button
            className={`view-btn ${viewType === "Month" ? "active" : ""}`}
            onClick={() => handleViewChange("Month")}
          >
            {isTablet ? "M" : "Month"}
          </button>
        </div>

        <div className="role-controls">
          {(userRole === 'admin' || userRole === 'faculty') && (
            <button
              className="admin-btn"
              onClick={() => setShowAdminPanel(!showAdminPanel)}
            >
              {isMobile ? "+" : "Manage"}
            </button>
          )}
          {userRole === 'student' && (
            <button
              className="student-btn"
              onClick={() => setShowStudentPanel(!showStudentPanel)}
            >
              {isMobile ? "My" : "My Events"}
            </button>
          )}
        </div>
      </div>

      {/* Role-Based Management Panels */}
      {showAdminPanel && (userRole === 'admin' || userRole === 'faculty') && (
        <AdminEventManager
          onClose={() => setShowAdminPanel(false)}
          onEventAdd={addEvent}
          userRole={userRole}
          isMobile={isMobile}
        />
      )}

      {showStudentPanel && userRole === 'student' && (
        <StudentEventManager
          onClose={() => setShowStudentPanel(false)}
          onEventAdd={addEvent}
          studentId={studentId}
          isMobile={isMobile}
        />
      )}

      {/* Responsive Calendar */}
      <div className="calendar-main">
        {viewType === "Month" ? (
          <DayPilotMonth {...getMonthConfig()} />
        ) : (
          <DayPilotCalendar
            viewType={viewType}
            {...getCalendarConfig()}
          />
        )}
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <EventModal
          event={selectedEvent}
          onSave={handleEventSave}
          onDelete={handleEventDelete}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
          userRole={userRole}
          studentId={studentId}
          isMobile={isMobile}
        />
      )}
    </div>
  );
};

export default ResponsiveEventCalendar;
