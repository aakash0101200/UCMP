import React from "react";

// Import the widgets that will be displayed on this page
// import Calendar from "./Calendar";
import AttendanceWidget from "../components/Dashboard/AttendanceWidget";
import AnnouncementTimeline from "../components/Announcements/AnnouncementTimeline";
import AnnouncementPublisher from "../components/Announcements/AnnouncementPuiblisher";

import Calendar from "./Calendar";
import DashboardLayout from '@/components/layout/DashboardLayout';
import TimetableWidget from "../components/Dashboard/TimetableWidget.jsx";
import ProfileCard from "@/components/Profile/ProfileCard";


export default function StudentDashboard() {
  return (
    <div className="scroll-style ">

      <h2 className="mb-4 text-2xl font-bold">Student Dashboard</h2>

      <div className="p-6 space-y-6">
        {/* Top widgets */}
        <div className="flex flex-col gap-6 md:flex-row">
          <AttendanceWidget />
          <TimetableWidget />

          {/* Insert LineChart component here if needed */}
        </div>

        {/* Announcements */}
        <div className="my-10" >
          <AnnouncementTimeline />
        </div>
         <AnnouncementPublisher />
        
        <Calendar />
        {/* <ProfileCard/> */}
      </div>





    </div>


  );
}



// // This is the main container for the dashboard page's content
//     <div>
//       {/* Page Title */}
//       <h1 className="mb-6 text-3xl font-bold text-gray-800">
//         Student Dashboard
//       </h1>

//       {/* GRID*/}

//       <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">

//         {/*SIDEBAR*/}

//         <div className="p-4 bg-white shadow-md lg:col-span-2 sm:p-6 rounded-xl">
//           <Sidebar />
//         </div>

//         {/*CALENDAR*/}

//         <div className="p-4 bg-white shadow-md lg:col-span-2 sm:p-6 rounded-xl">
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
