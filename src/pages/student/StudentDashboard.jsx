import React from "react";
import Calendar from "../Calendar";
import BottomNavBar from "../../components/navigation/BottomNavBar";

export default function StudentDashboard() {
  return (
    <div className="scroll-style">
      <h2 className="mb-4 text-2xl font-bold">Student Dashboard</h2>

      <div className="p-6 space-y-6">
        <div className="flex justify-center gap-3">
          <Calendar />
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
}
