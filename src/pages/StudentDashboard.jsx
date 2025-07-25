import React from "react";

// Import the widgets that will be displayed on this page
// import Calendar from "./Calendar";
import AttendanceWidget from "../components/Dashboard/AttendanceWidget";
import AnnouncementTimeline from "../components/Announcements/AnnouncementTimeline";
import Calendar from "./Calendar";
import DashboardLayout from '@/components/layout/DashboardLayout';
import TimetableWidget from "../components/Dashboard/TimetableWidget.jsx";


export default function StudentDashboard() {
  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Student Dashboard</h2>

      <div className="p-6 space-y-6">
        {/* Top widgets */}
        <div className="flex flex-col md:flex-row gap-6">
          <AttendanceWidget />
          <TimetableWidget />

          {/* Insert LineChart component here if needed */}
        </div>
        <div className="flex flex-col md:flex-row gap-6 border-t-4 border-t-red-500 border-r-4 border-r-blue-500 border-b-4 border-b-green-500 border-l-4 border-l-yellow-500 rounded-xl p-4">
          <AnnouncementTimeline />
          
        </div>
        <Calendar />
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
