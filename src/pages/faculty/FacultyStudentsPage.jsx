import React from 'react';
import FacultyAttendanceSession from '../../components/Attendance/FacultyAttendanceSession';

export default function FacultyStudentsPage() {
  return (
    <div className="scroll-style space-y-4">
      <h2 className="text-2xl font-bold">Students & Attendance</h2>
      <FacultyAttendanceSession />
    </div>
  );
}
