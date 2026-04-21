import React from "react";

import AttendanceWidget from "@/components/Dashboard/AttendanceWidget";
import StudentAttendanceScanner from "@/components/Attendance/StudentAttendanceScanner";

import BottomNavBar from "../../components/navigation/BottomNavBar";

export default function AttendancePage() {
    return (
        <div className="scroll-style ">

            <h2 className="mb-4 text-2xl font-bold">Attendance: </h2>
            <StudentAttendanceScanner />
            <AttendanceWidget/>
            <BottomNavBar />


        </div>


    );
}