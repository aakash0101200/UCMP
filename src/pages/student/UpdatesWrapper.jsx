import React from "react";

// Import the widgets that will be displayed on this page
// import Calendar from "./Calendar";
import AttendanceWidget from "../../../components/Dashboard/AttendanceWidget";
import AnnouncementTimeline from "../../../components/Announcements/AnnouncementTimeline";
import AssignmentPublisher from "../../../components/Announcements/AssignmentPublisher";

import Calendar from "../../Calendar";
import DashboardLayout from '../../components/layout/DashboardLayout';
import TimetableWidget from "../../../components/Dashboard/TimetableWidget.jsx";
// import ProfileCard from "../../components/Profile/ProfileCard";
import BottomNavBar from "../../../components/navigation/BottomNavBar";

export default function UpdatesWrapper() {
  return (
    <div className="scroll-style ">

      <h2 className="mb-4 text-2xl font-bold">Assignments: </h2>
        < AnnouncementTimeline/>



    
<BottomNavBar />


    </div>


  );
}