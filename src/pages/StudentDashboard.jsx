import React from "react";

// Import the widgets that will be displayed on this page
// import Calendar from "./Calendar";
import AttendanceWidget from "../components/Dashboard/AttendanceWidget";
import AnnouncementTimeline from "../components/Announcements/AnnouncementTimeline";
import Calendar from "./Calendar";
import DashboardLayout from '@/components/layout/DashboardLayout';


export default function StudentDashboard() {
  return (
    <DashboardLayout userRole="student">
      <h2 className="text-2xl font-bold mb-4">Student Dashboard</h2>
     <div className="flex flex-col md:flex-row gap-6">
      <AttendanceWidget/>
      <AttendanceWidget/>
      <AttendanceWidget/>
      </div>
     <div className="flex h-screen">
      <Calendar />
      </div>
     
    </DashboardLayout>


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
