import React from "react";

import AnnouncementTimeline from "@/components/Announcements/AnnouncementTimeline";

import BottomNavBar from "@/components/navigation/BottomNavBar";

export default function UpdatesPage() {
  return (
    <div className="scroll-style ">

      <h2 className="mb-4 text-2xl font-bold">Updates: </h2>
        < AnnouncementTimeline/>



    
<BottomNavBar />


    </div>


  );
}