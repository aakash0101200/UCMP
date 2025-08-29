// // src/components/Calendar.jsx
// import React, { useState, useEffect, useRef } from 'react';
// import {
//   format,
//   startOfMonth,
//   endOfMonth,
//   startOfWeek,
//   endOfWeek,
//   eachDayOfInterval,
//   isSameMonth,
//   isToday,
//   addMonths,
//   subMonths,
//   isSameDay,
//   setMonth,
// } from 'date-fns';
// import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
// import EventModal from './EventModal';
// import {calEvent} from "../utils/calEvent.js"
// // import CalendarLayout from '../components/Dashboard/CalendarLayout';


// const Calendar = () => {
//   // Core calendar state
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [events, setEvents] = useState(calEvent);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedDate, setSelectedDate] = useState(new Date());


//   // Month‐picker dropdown state
//   const [isMonthPickerOpen, setMonthPickerOpen] = useState(false);
//   const monthPickerRef = useRef(null);

//   const months = [
//     'January','February','March','April','May','June',
//     'July','August','September','October','November','December'
//   ];

// // Calculate interval for calendar grid (start from Monday)
// const monthStart = startOfMonth(currentDate);
// const monthEnd = endOfMonth(monthStart);
// const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday = 1
// const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
// const days = eachDayOfInterval({ start: startDate, end: endDate });

// const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

//   // Close the month dropdown when clicking outside
//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (
//         monthPickerRef.current &&
//         !monthPickerRef.current.contains(event.target)
//       ) {
//         setMonthPickerOpen(false);
//       }
//     }
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);



//   // Handler: pick a new month
//   const handleMonthSelect = (monthIndex) => {
//     setCurrentDate(prev => setMonth(prev, monthIndex));
//     setMonthPickerOpen(false);
//   };

//   // Handler: add event from modal
//   const handleAddEvent = (eventData) => {
//     const newEvent = {
//       date: format(new Date(eventData.date), 'yyyy-MM-dd'),
//       title: eventData.title,
//     };
//     setEvents([...events, newEvent]);
//     setIsModalOpen(false);
//   };

//   return (

//     // <div className="relative min-h-screen bg-gray-100">
//     //  <div className="container mx-auto px-4 sm:px-6 lg:px-8
//     //                  flex justify-end items-center min-h-screen">
    
//     <div className="inline-block mr-2 mb-2 min-h-min relative rounded-lg bg-gray-100 dark:bg-gray-800 max-w-xs sm:max-w-sm md:max-w-md">
//       <div className="relative mx-auto px-2 sm:px-0
//                       flex justify-center items-start ">
//         <div className="w-[340px] sm:w-[420px] md:w-[500px] bg-white dark:bg-gray-900 p-2 sm:p-4
//                         rounded-lg shadow dark:shadow-none">
          
//           {/* Header with Month Picker */}
//           <div className="flex flex-col sm:flex-row
//                           items-center justify-between mb-4 gap-2 text-sm dark:text-gray-200">
//             <div ref={monthPickerRef}
//                  className="relative inline-block">
//               <button
//                 onClick={() => setMonthPickerOpen(o => !o)}
//                 className="px-2 py-1 border rounded
//                            flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs dark:border-gray-600 dark:bg-gray-800"
//               >
//                 Month <span className="text-gray-400 dark:text-gray-500">▼</span>
//               </button>
//               {isMonthPickerOpen && (
//                 <ul className="absolute right-0 mt-1 w-32 bg-white
//                                border rounded shadow-max-h-40
//                                max-h-40 overflow-auto z-20 text-xs">
//                   {months.map((m, i) => (
//                     <li
//                       key={m}
//                       onClick={() => handleMonthSelect(i)}
//                       className="px-2 py-1 hover:bg-gray-100
//                                  cursor-pointer"
//                     >
//                       {m}
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//             <button
//               onClick={() => setIsModalOpen(true)}
//               className="w-full sm:w-auto px-2 py-1
//                           bg-blue-600 text-white font-semibold
//                           rounded flex items-center justify-center gap-1
//                           hover:bg-blue-700 text-xs"
//             >
//               <Plus size={14} /> New Event
//             </button>
//           </div>

//           {/* Navigation */}
//           <div className="flex items-center justify-between mb-3 text-xs dark:text-gray-200">
//             <button
//               onClick={() => setCurrentDate(subMonths(currentDate, 1))}
//               className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
//             >
//               <ChevronLeft size={16} />
//             </button>
//             <h2 className="text-xl font-bold text-blue-700 dark:text-blue-300">
//               {format(currentDate, 'MMMM yyyy')}
//             </h2>
//             <button
//               onClick={() => setCurrentDate(addMonths(currentDate, 1))}
//               className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
//             >
//               <ChevronRight size={16} className="dark:text-gray-200" />
//             </button>
//           </div>

//           {/* Weekdays */}
//           <div className="grid grid-cols-7 text-center
//                           font-semibold text-gray-600 dark:text-gray-400 border-b pb-1 text-xs">
//             {weekdays.map(day => (
//               <div key={day} className="py-0.5">{day}</div>
//             ))}
//           </div>

//           {/* Calendar Grid */}
//           <div className="w-full max-h-[340px] aspect-[1/1]">
//             <div className="grid grid-cols-7 grid-rows-6 w-full h-full">
//               {days.map(day => {
//                 const dayEvents = events.filter(
//                   e => e.date === format(day, 'yyyy-MM-dd')
//                 );
//                 const isSelected = isSameDay(day, selectedDate);

//                 return (
//                   <div
//                     key={day.toString()}
//                     onClick={() => setSelectedDate(day)}
//                     className={`relative p-1.5 border-t border-r
//                       cursor-pointer transition-colors duration-200 text-xs  aspect-square overflow-hidden
//                       ${!isSameMonth(day, monthStart)
//                         ? 'bg-gray-50 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
//                         : 'bg-white hover:bg-blue-50 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-gray-200'}
//                       ${isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''}
//                       aspect-square overflow-hidden`}
//                   >
//                     <div className="absolute top-1 left-1">
//                       <span className={`text-xm font-medium
//                         ${isToday(day)
//                           ? 'bg-blue-600 text-white rounded-full h-5 w-5 flex items-center justify-center'
//                           : ''}`}>
//                         {format(day, 'd')}
//                       </span>
//                     </div>

//                     <div className="mt-6 space-y-0.5 overflow-y-auto max-h-10 pr-1">
//                       {dayEvents.map((event, i) => (
//                         <div
//                           key={i}
//                           className="flex items-center gap-1 text-[10px]
//                                      bg-red-100 text-red-700
//                                      rounded-md px-1 py-0.5 dark:bg-red-900 dark:text-red-300"
//                         >
//                           <span className="w-1.5 h-1.5 bg-red-500 rounded-full dark:bg-red-400"></span>
//                           <span className="truncate">{event.title}</span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>

//         {/* Event Modal */}
//         {isModalOpen && (
//           <EventModal
//             initialDate={selectedDate}
//             onClose={() => setIsModalOpen(false)}
//             onSave={handleAddEvent}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default Calendar;





import React, { useState, useEffect } from "react";
import { parseISO } from "date-fns";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import EventPopup from "./eventPopup";
import { motion } from "framer-motion";
import { fetchMonthlyEvents } from "@/Services/eventService";

const backendUrl = import.meta.env.VITE_API_URL;

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [time, setTime] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const daysArray = [...Array(daysInMonth).keys()].map((day) => day + 1);

  const handlePrevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  const handleNextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );

  const fetchEvents = async () => {
  setLoading(true);
  setError("");
  try {
    const response = await fetchMonthlyEvents(currentDate.getFullYear(), currentDate.getMonth() + 1);

    if (response.success) {
      const allEvents = response.data || [];
      setEvents(allEvents);

      const today = new Date();
      const futureEvents = allEvents
        .filter((ev) => new Date(ev.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      setUpcomingEvents(futureEvents.slice(0, 2));
    } else {
      throw new Error(response.error || "Unknown error");
    }
  } catch (err) {
    console.error("Error fetching events:", err);
    setError("Failed to load events. Please try again later.");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [currentDate]);

  const handleDayClick = (day) => {
    const date = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const event = events.find((e) => {
      const eventDate = new Date(e.date);
      return (
        eventDate.getFullYear() === currentDate.getFullYear() &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getDate() === day
      );
    });

    setSelectedDay(date);
    setSelectedEvent(event || { date });
  };

  const handleClosePopup = () => {
    setSelectedDay(null);
    setSelectedEvent(null);
  };

  const blankDays = Array(firstDayOfMonth).fill(null);

  const formattedTime =
    localStorage.getItem("clock-format") === "24-hour"
      ? time.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      : time.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });

  const [timePart, period = ""] = formattedTime.split(" ");

  return (
    <>
      <div className="bg-sec pt-6 w-[25%] min-w-fit rounded-3xl shadow flex flex-col max-h-[750px]">
        <div className="px-6">
          <h1 className="text-5xl font-thin txt mb-2">
            {timePart} <span className="text-xl">{period}</span>
          </h1>
          <h2 className="text-md txt-dim">
            Today&apos;s {"Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" ")[new Date().getDay()]}
          </h2>
        </div>
        <hr className="my-4 opacity-10" />

        <div className="px-4">
          <div className="flex justify-between items-center mb-6 px-2">
            <h2 className="text-lg font-semibold">
              {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
            </h2>
            <div className="flex gap-3">
              <button onClick={handlePrevMonth} className="p-1.5 rounded-full hover:bg-ter">
                <ChevronLeft />
              </button>
              <button onClick={handleNextMonth} className="p-1.5 rounded-full hover:bg-ter">
                <ChevronRight />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-[0.4rem]">
            {"Su Mo Tu We Th Fr Sa".split(" ").map((day) => (
              <div key={day} className="text-center text-xs font-md txt-dim">
                {day}
              </div>
            ))}

            {blankDays.map((_, idx) => (
              <div key={`blank-${idx}`} className="p-3"></div>
            ))}

            {daysArray.map((day) => {
              const today = new Date();
              const isToday =
                day === today.getDate() &&
                currentDate.getMonth() === today.getMonth() &&
                currentDate.getFullYear() === today.getFullYear();

              const hasEvent = events.some((ev) => {
                const evDate = parseISO(ev.date);
                return (
                  evDate.getDate() === day &&
                  evDate.getMonth() === currentDate.getMonth() &&
                  evDate.getFullYear() === currentDate.getFullYear()
                );
              });

              const isSelected = selectedDay === `${currentDate.getFullYear()}-${String(
                currentDate.getMonth() + 1
              ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

              return (
                <div
                  key={day}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select day ${day}`}
                  onClick={() => handleDayClick(day)}
                  onKeyDown={(e) => e.key === "Enter" && handleDayClick(day)}
                  className={`flex items-center justify-center p-2.5 text-sm rounded-full txt cursor-pointer transition-all duration-200 ease-in-out h-9
                    ${isToday ? "bg-purple-600 hover:bg-purple-700" : ""}
                    ${hasEvent && !isToday ? "bg-ter hover:bg-ter" : ""}
                    ${isSelected ? "ring-2 ring-purple-500" : ""}
                    ${!isToday && !hasEvent && !isSelected ? "hover:bg-ter" : ""}`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-ter flex-1 mt-6">
          <h3 className="text-lg font-semibold txt mb-4">Upcoming Events:</h3>
          {loading ? (
            <p className="txt-dim text-sm">Loading events...</p>
          ) : error ? (
            <p className="txt-dim text-sm text-red-500">{error}</p>
          ) : upcomingEvents.length > 0 ? (
            <motion.ul
              className="txt space-y-6 pl-2"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            >
              {upcomingEvents.map((ev) => {
                const evDate = new Date(ev.date);
                return (
                  <motion.li
                    key={ev.id || ev._id}
                    className="pl-3 border-l-4 border-purple-500"
                    variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm txt-dim">{evDate.toLocaleDateString()}</div>
                      <div className="text-xs txt-dim">
                        {evDate.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </div>
                    </div>
                    <span className="block mt-1">{ev.title}</span>
                  </motion.li>
                );
              })}
            </motion.ul>
          ) : (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="txt-dim text-sm"
            >
              No events.
            </motion.p>
          )}
        </div>
      </div>

      {selectedDay && (
        <EventPopup
          key={selectedDay}
          date={selectedDay}
          onClose={handleClosePopup}
          refreshEvents={fetchEvents}
        />
      )}
    </>
  );
}

export default Calendar;



//_________________________________________________

// import React, { useState } from 'react';
// import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, isSameDay } from 'date-fns';
// import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
// import EventModal from './EventModal';

// const Calendar = () => {
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [events, setEvents] = useState([
//     { date: '2025-07-10', title: 'Assignment Due' },
//     { date: '2025-07-31', title: 'Project Kick-off' },
//   ]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedDate, setSelectedDate] = useState(new Date());

//   const monthStart = startOfMonth(currentDate);
//   const monthEnd = endOfMonth(monthStart);
//   const startDate = startOfWeek(monthStart);
//   const endDate = endOfWeek(monthEnd);

//   const days = eachDayOfInterval({ start: startDate, end: endDate });
//   const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

//   // handleAddEvent now expects an object with title and date
//   const handleAddEvent = (eventData) => {
//     const newEvent = {
//       date: format(new Date(eventData.date), 'yyyy-MM-dd'),
//       title: eventData.title,
//     };
//     setEvents([...events, newEvent]);
//     setIsModalOpen(false);
//   };

//   return (
//     <div className="p-4 min-h-screen bg-gray-50">
//       <div className="max-w-screen-sm 0mx-auto bg-white p-6 rounded-x1 shadow-md">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
//           <div className="flex items-center gap-4">
//             <button className="px-4 py-2 border rounded-md flex items-center gap-2 hover:bg-gray-100">
//               Month <span className="text-gray-400">▼</span>
//             </button>

//           </div>
//           <button
//             onClick={() => setIsModalOpen(true)}
//             className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white font-semibold rounded-md flex items-center justify-center gap-2 hover:bg-blue-700"
//           >
//             <Plus size={18} /> New Event
//           </button>
//         </div>

//         {/* Calendar Navigation and Grid... (rest of the component is the same) */}
//         <div className="flex items-center justify-between mb-4">
//           <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 rounded-full hover:bg-gray-100">
//             <ChevronLeft size={20} />
//           </button>
//           <h2 className="text-xl font-bold text-blue-700">
//             {format(currentDate, 'MMMM yyyy')}
//           </h2>
//           <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 rounded-full hover:bg-gray-100">
//             <ChevronRight size={20} />
//           </button>
//         </div>

//         <div className="grid grid-cols-7 text-center font-semibold text-gray-600">
//           {weekdays.map(day => (
//             <div key={day} className="py-2 border-b">{day}</div>

//           ))}
//         </div>


//       </div>

//       {isModalOpen && (
//         <EventModal
//           initialDate={selectedDate}
//           onClose={() => setIsModalOpen(false)}
//           onSave={handleAddEvent}
//         />
//       )}
//     </div>
//   );
// };

// export default Calendar;



// <div className="grid grid-cols-7">
//   {days.map((day) => {
//     const dayEvents = events.filter(e => e.date === format(day, 'yyyy-MM-dd'));
//     const isSelected = isSameDay(day, selectedDate);
//     return (
//       <div
//         key={day.toString()}
//         onClick={() => setSelectedDate(day)}
//         className={`relative h-24 sm:h-32 p-2 border-t border-r cursor-pointer transition-colors duration-200 ${!isSameMonth(day, monthStart)
//           ? 'bg-gray-50 text-gray-400'
//           : 'bg-white hover:bg-blue-50'
//           } ${isSelected ? 'bg-blue-100' : ''
//           }`}
//       >
//         <span className={`absolute top-2 left-2 text-sm font-medium ${isToday(day) ? 'bg-blue-600 text-white rounded-full h-7 w-7 flex items-center justify-center' : ''}`}>
//           {format(day, 'd')}
//         </span>
//         <div className="mt-8 space-y-1 overflow-y-auto max-h-20">
//           {dayEvents.map((event, i) => (
//             <div key={i} className="flex items-center gap-2 text-xs bg-red-100 text-red-700 rounded-md px-2 py-1">
//               <span className="w-2 h-2 bg-red-500 rounded-full"></span>
//               <span>{event.title}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   })}
// </div> 