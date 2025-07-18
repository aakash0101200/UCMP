import React from 'react';


import Attendance from "../components/Dashboard/AttendenceWidget";

export default function StudentDashboard() {
    return (
        <div className="student-dashboard">
            <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>
            <Attendance />
        </div>
       

    );
}