import React from "react";
import BottomNavBar from "@/components/navigation/BottomNavBar";
import WeeklyScheduleGrid from "../../components/Schedule/WeeklyScheduleGrid";

export default function SchedulePage() {
  return (
    <div className="scroll-style">
      <WeeklyScheduleGrid />
      <BottomNavBar />
    </div>
  );
}