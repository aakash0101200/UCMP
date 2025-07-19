import React from 'react';

import Calendar from '../components/Calendar/EventCalendar';
import Attendance from "../components/Dashboard/AttendenceWidget";
import '../components/Calendar/styles/calendar.css'
import '../components/Calendar/styles/notification.css'
export default function StudentDashboard() {
    return (
        <div className="student-dashboard">
            <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>
            <Attendance />
            <Calendar />
        </div>
       

    );
}