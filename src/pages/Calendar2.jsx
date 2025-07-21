import React, { useState } from "react";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
} from "@heroicons/react/24/outline";

const EVENTS = [
    { title: "Project Kick-off", date: "2025-08-31", participants: 4, color: "bg-pink-400", price: "$300" },
    { title: "Monthly Review", date: "2025-09-05", participants: 2, color: "bg-green-400" },
    { title: "Parent Meet", date: "2025-09-12", participants: 3, color: "bg-blue-400" },
    { title: "Workshop", date: "2025-09-20", participants: 5, color: "bg-cyan-400", price: "$120" },
];

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getMonthMatrix(year, month) {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday = 0
    let days = [];

    // Previous month blanks
    for (let i = 0; i < firstDayIndex; i++) days.push(null);

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    // Next month blanks
    while (days.length % 7 !== 0) days.push(null);

    // Split weeks
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
    }
    return weeks;
}

const Calendar2 = () => {
    const [currMonth, setCurrMonth] = useState(7); // August (0-indexed)
    const [currYear, setCurrYear] = useState(2025);
    const [selectedDateEvents, setSelectedDateEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const nextMonth = () => {
        if (currMonth === 11) {
            setCurrMonth(0);
            setCurrYear(currYear + 1);
        } else setCurrMonth(currMonth + 1);
    };

    const prevMonth = () => {
        if (currMonth === 0) {
            setCurrMonth(11);
            setCurrYear(currYear - 1);
        } else setCurrMonth(currMonth - 1);
    };

    const weeks = getMonthMatrix(currYear, currMonth);

    const handleDateClick = (date) => {
        if (!date) return;
        const dayStr = String(date).padStart(2, "0");
        const monthStr = String(currMonth + 1).padStart(2, "0");
        const fullDate = `${currYear}-${monthStr}-${dayStr}`;
        const events = EVENTS.filter(ev => ev.date === fullDate);
        if (events.length > 0) {
            setSelectedDateEvents(events);
            setShowModal(true);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#191B2E] text-white relative">
            {/* Calendar Section */}
            <div className="w-full lg:w-4/6 p-8 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">
                        {new Date(currYear, currMonth).toLocaleString("default", {
                            month: "long",
                            year: "numeric",
                        })}
                    </h2>
                    <div className="flex items-center gap-2">
                        <button onClick={prevMonth} className="p-2 hover:bg-[#222446] rounded">
                            <ChevronLeftIcon className="w-6 h-6" />
                        </button>
                        <button onClick={nextMonth} className="p-2 hover:bg-[#222446] rounded">
                            <ChevronRightIcon className="w-6 h-6" />
                        </button>
                        <button className="ml-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded">
                            New Event
                        </button>
                    </div>
                </div>

                {/* Weekday labels */}
                <div className="grid grid-cols-7 text-center text-gray-400 text-sm">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
                        <div key={idx}>{day}</div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-2 auto-rows-[90px]">
                    {weeks.flat().map((date, idx) => {
                        const paddedDay = date ? String(date).padStart(2, "0") : "";
                        const paddedMonth = String(currMonth + 1).padStart(2, "0");
                        const fullDate = `${currYear}-${paddedMonth}-${paddedDay}`;
                        const events = EVENTS.filter(e => e.date === fullDate);

                        const isHighlighted = events.length > 0 && ["bg-pink-400", "bg-cyan-400"].includes(events[0].color);

                        return (
                            <div
                                key={idx}
                                onClick={() => handleDateClick(date)}
                                className={`cursor-pointer rounded-lg p-2 border border-transparent transition-colors flex flex-col items-center justify-between text-sm
                  ${isHighlighted ? "bg-pink-400/40" : "bg-[#23254B] hover:bg-[#2a2d54]"}
                  ${!date ? "opacity-30" : ""} ${events.length > 0 && !isHighlighted ? "ring-2 ring-blue-400/70" : ""}`}
                            >
                                <span className="font-semibold">{date || ""}</span>
                                <div className="flex gap-1 mt-1">
                                    {events.slice(0, 3).map((e, i) => (
                                        <span key={i} title={e.title} className={`w-3 h-3 rounded-full ${e.color}`}></span>
                                    ))}
                                    {events.length > 3 && <span className="text-xs text-gray-300">+{events.length - 3}</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-2/6 p-6 bg-[#23254B] rounded-l-3xl">
                <h3 className="font-bold text-lg mb-4">Event List</h3>
                <ul className="space-y-4">
                    {EVENTS.map((event, idx) => (
                        <li key={idx} className="bg-[#222446] p-4 rounded shadow flex justify-between">
                            <div>
                                <div className="font-semibold">{event.title}</div>
                                <div className="text-sm text-gray-400">
                                    {new Date(event.date).toLocaleDateString()}
                                </div>
                                <div className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                                    <span className={`h-2 w-2 rounded-full ${event.color}`}></span>
                                    {event.participants} participants
                                </div>
                            </div>
                            {event.price && (
                                <div className="flex flex-col items-end">
                                    <span className="text-purple-300 font-semibold text-sm">{event.price}</span>
                                    <button className="text-xs bg-purple-700 px-2 py-1 mt-2 rounded">Buy</button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-[#222446] p-6 rounded-lg w-96 max-w-full text-white relative">
                        <button onClick={() => setShowModal(false)} className="absolute top-2 right-3 text-gray-300 hover:text-white text-lg">&times;</button>
                        <h3 className="text-xl font-bold mb-4">Events</h3>
                        {selectedDateEvents.map((ev, idx) => (
                            <div key={idx} className="mb-3 border-b border-gray-600 pb-2">
                                <div className="font-semibold">{ev.title}</div>
                                <div className="text-sm text-gray-400">{ev.participants} participants</div>
                                {ev.price && <div className="text-sm text-purple-300">{ev.price}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calendar2;

// import React, { useState } from "react";
// import {
//   ChevronLeftIcon,
//   ChevronRightIcon,
//   PlusIcon,
// } from "@heroicons/react/24/outline"; // CORRECTED IMPORT

// // Sample events data
// const EVENTS = [
//   {
//     title: "Movie Night",
//     date: "2021-12-06",
//     participants: 7,
//     color: "bg-pink-400",
//   },
//   {
//     title: "Hostage Situation",
//     date: "2021-12-28",
//     participants: 2,
//     color: "bg-purple-600",
//   },
//   {
//     title: "Franklin, 2+",
//     date: "2021-12-10",
//     participants: 2,
//     color: "bg-blue-400",
//     price: "$600.00",
//   },
//   {
//     title: "Franklin, 2+",
//     date: "2021-12-18",
//     participants: 2,
//     color: "bg-blue-400",
//     price: "$600.00",
//   },
//   {
//     title: "Hawkins",
//     date: "2021-12-28",
//     participants: 1,
//     color: "bg-green-400",
//     price: "$600.00",
//   },
//   {
//     title: "Multi Event",
//     date: "2021-12-02",
//     participants: 3,
//     color: "bg-cyan-400",
//   },
//   {
//     title: "Multi Event",
//     date: "2021-12-24",
//     participants: 3,
//     color: "bg-cyan-400",
//   },
// ];

// function getDaysInMonth(year, month) {
//   return new Date(year, month + 1, 0).getDate();
// }

// function getMonthMatrix(year, month) {
//   const daysInMonth = getDaysInMonth(year, month);
//   const firstDayIndex = new Date(year, month, 1).getDay();
//   let days = [];

//   // Days from previous month
//   for (let i = 0; i < firstDayIndex; i++) {
//     days.push(null);
//   }

//   // Current month days
//   for (let i = 1; i <= daysInMonth; i++) {
//     days.push(i);
//   }

//   // Days from next month
//   while (days.length % 7 !== 0) {
//     days.push(null);
//   }

//   // Split into weeks
//   const weeks = [];
//   for (let i = 0; i < days.length; i += 7) {
//     weeks.push(days.slice(i, i + 7));
//   }
//   return weeks;
// }

// const dayShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// const Calendar2 = () => {
//   const [currMonth, setCurrMonth] = useState(11); // December (0-indexed)
//   const [currYear, setCurrYear] = useState(2021);

//   const nextMonth = () => {
//     if (currMonth === 11) {
//       setCurrMonth(0);
//       setCurrYear(currYear + 1);
//     } else {
//       setCurrMonth(currMonth + 1);
//     }
//   };

//   const prevMonth = () => {
//     if (currMonth === 0) {
//       setCurrMonth(11);
//       setCurrYear(currYear - 1);
//     } else {
//       setCurrMonth(currMonth - 1);
//     }
//   };

//   const weeks = getMonthMatrix(currYear, currMonth);

//   return (
//     <div className="flex flex-col lg:flex-row min-h-screen bg-[#191B2E] text-white">
//       {/* Calendar Section */}
//       <div className="w-full lg:w-4/6 p-8 flex flex-col gap-4">
//         {/* Month header */}
//         <div className="flex items-center justify-between">
//           <h2 className="text-2xl font-bold">
//             {new Date(currYear, currMonth).toLocaleString("default", {
//               month: "long",
//               year: "numeric",
//             })}
//           </h2>
//           <div className="flex items-center gap-2">
//             <button
//               className="p-2 rounded hover:bg-[#222446]"
//               onClick={prevMonth}
//             >
//               <ChevronLeftIcon className="h-6 w-6" />
//             </button>
//             <button
//               className="p-2 rounded hover:bg-[#222446]"
//               onClick={nextMonth}
//             >
//               <ChevronRightIcon className="h-6 w-6" />
//             </button>
//             <button className="ml-8 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded">
//               New Teachers
//             </button>
//           </div>
//         </div>
//         {/* Weekdays */}
//         <div className="grid grid-cols-7 gap-2 my-2">
//           {dayShort.map((day, i) => (
//             <div key={i} className="text-center text-gray-400">
//               {day}
//             </div>
//           ))}
//         </div>
//         {/* Days Grid */}
//         <div className="grid grid-cols-7 gap-3">
//           {weeks.flat().map((date, i) => {
//             const dayString = date
//               ? String(date).padStart(2, "0")
//               : "";
//             const month = String(currMonth + 1).padStart(2, "0");
//             const cellDate = `${currYear}-${month}-${dayString}`;
//             const dayEvents = EVENTS.filter(ev => ev.date === cellDate);

//             // Check if this date is one of the special highlighted days
//             const isHighlighted =
//               dayEvents.length > 0 &&
//               ["bg-pink-400", "bg-cyan-400"].includes(
//                 dayEvents?.[0]?.color
//               );

//             return (
//               <div
//                 key={i}
//                 className={`relative rounded-lg h-20 flex flex-col items-center justify-center
//                   border border-transparent transition-colors
//                   ${isHighlighted ? "bg-pink-400/40" : "bg-[#23254B] hover:bg-[#2a2d54]"}
//                   ${date ? "" : "opacity-40"} ${dayEvents.length > 0 && !isHighlighted ? "ring-2 ring-blue-400/70" : ""}`
//                 }
//               >
//                 <span className="text-lg font-semibold">{date || ""}</span>
//                 {/* Event Circles */}
//                 <div className="mt-1 flex gap-1">
//                   {dayEvents.slice(0, 3).map((event, idx) => (
//                     <span
//                       key={idx}
//                       className={`inline-block w-3 h-3 rounded-full ring-2 ring-[#191B2E] ${event.color}`}
//                       title={event.title}
//                     />
//                   ))}
//                   {dayEvents.length > 3 && (
//                     <span className="text-xs text-gray-300">
//                       +{dayEvents.length - 3}
//                     </span>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//       {/* Sidebar: Event List */}
//       <div className="w-full lg:w-2/6 p-6 bg-[#23254B] flex flex-col rounded-l-3xl">
//         <h3 className="font-bold text-lg mb-6">Event List</h3>
//         <ul className="flex flex-col gap-6">
//           {EVENTS.slice(0, 4).map((event, idx) => (
//             <li
//               key={idx}
//               className="p-4 rounded-lg bg-[#222446] flex items-center justify-between shadow"
//             >
//               <div>
//                 <div className="font-semibold">{event.title}</div>
//                 <div className="text-gray-400 text-sm mt-1">
//                   {new Date(event.date).toLocaleDateString(undefined, {
//                     month: "short",
//                     day: "numeric",
//                     year: "numeric",
//                   })}
//                 </div>
//                 <div className="flex items-center gap-2 mt-1">
//                   <span className={`h-2 w-2 rounded-full ${event.color}`}></span>
//                   <span className="text-gray-400 text-sm">{event.participants} participants</span>
//                 </div>
//               </div>
//               <div className="flex flex-col items-end">
//                 {event.price && (
//                   <span className="text-sm font-bold text-purple-300">
//                     {event.price}
//                   </span>
//                 )}
//                 <button className="mt-2 px-2 py-1 bg-purple-700 rounded text-xs font-medium">
//                   Buy
//                 </button>
//               </div>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default Calendar2;
