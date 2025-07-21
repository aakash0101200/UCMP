import React from "react";

// Import the widgets that will be displayed on this page
import Calendar from "./Calendar";
import AttendanceWidget from "../components/Dashboard/AttendanceWidget";
import AnnouncementTimeline from "../components/Announcements/AnnouncementTimeline";
import Sidebar from "../components/Dashboard/Sidebar";

export default function StudentDashboard() {
  return (
    <>
      <div>
        <div className="grid grid-col">
            
        </div>
      </div>
    </>
  );
}

// // This is the main container for the dashboard page's content
//     <div>
//       {/* Page Title */}
//       <h1 className="text-3xl font-bold text-gray-800 mb-6">
//         Student Dashboard
//       </h1>

//       {/* GRID*/}

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">

//         {/*SIDEBAR*/}

//         <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-xl shadow-md">
//           <Sidebar />
//         </div>

//         {/*CALENDAR*/}

//         <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-xl shadow-md">
//           <Calendar />
//         </div>

//         {/*Attendance & Announcement */}

//         <div className="space-y-6">

//           <AttendanceWidget />
//           <AnnouncementTimeline />

//           {/* You can add more widgets here and they will stack vertically */}

//         </div>

//       </div>

//     </div>
