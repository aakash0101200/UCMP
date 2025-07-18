import Attendance from "../components/Dashboard/AttendenceWidget";

import AttendanceWidget from "../components/Dashboard/AttendenceWidget";
import CalendarContainer from "@/components/Calendar/CalendarContainer";
export default function StudentDashboard() {
    return (
        <div className="student-dashboard">
            <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>
            <AttendanceWidget />
            
            <CalendarContainer />
        </div>
       

    );
}