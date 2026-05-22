import React from 'react';
import WeeklyScheduleGrid from '../../components/Schedule/WeeklyScheduleGrid';

export default function FacultyDashboard() {
  return (
    <div className="scroll-style space-y-6">
      <h2 className="text-2xl font-bold">Faculty Dashboard</h2>
      {/* Quick overview of today's schedule */}
      <WeeklyScheduleGrid />
    </div>
  );
}
