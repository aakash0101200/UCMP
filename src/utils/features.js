// src/utils/features.js
import Analysis from "../assets/card/Analysis.png";
import AttendanceIcon from "../assets/card/attendance.png";
import CentralizedManagement from "../assets/card/centralisedManagement.png";
import RealTimeUpdates from "../assets/card/RealTimeUpdates.png";
export const features = [
  {
    id: 1,
    icon: AttendanceIcon,
    title: "Attendance Tracking",
    description: "Real-time attendance monitoring with percentage calculations"
  },
  {
    id: 2,
    icon: CentralizedManagement,
    title: "Centralized Management",
    description: "Replace multiple disconnected tools with one unified platform for all academic and administrative needs."
  },
  {
    id: 3,
    icon: RealTimeUpdates ,
    title: "Real-time Updates",
    description: "Instant notifications and live updates ensure everyone stays informed about important announcements and deadlines."
  },
  {
    id: 4,
    icon: Analysis,
    title: "Smart Analytics",
    description: "Comprehensive attendance tracking with automated alerts when students fall below the 75% threshold."
  }
];