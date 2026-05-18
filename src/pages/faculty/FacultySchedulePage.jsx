import React from 'react';
import WeeklyScheduleGrid from '../../components/Schedule/WeeklyScheduleGrid';

export default function FacultySchedulePage() {
  return (
    <div className="scroll-style space-y-4">
      <WeeklyScheduleGrid term="2026-27-ODD" />
    </div>
  );
}
