import React from "react";

import BottomNavBar from "@/components/navigation/BottomNavBar";
import ScheduleTable from "../../components/ScheduleTable"
export default function SchedulePage() {
  return (
    <div className="scroll-style ">

      <h2 className="mb-4 text-2xl font-bold">Schedule: </h2>
     



      <ScheduleTable />
      <BottomNavBar />


    </div>


  );
}