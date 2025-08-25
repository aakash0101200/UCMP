// src/utils/features.js
import { BrainCircuit, CalendarSearch, ChartNoAxesCombined, FileCog, FileCog2, FileCogIcon, ServerCog, UserCheck,UserCheck2, UserRound, UsersRound } from "lucide-react";
import Analysis from "../assets/cardnew/Analysis.png";
import AttendanceIcon from "../assets/cardnew/attendance.png";
import CentralizedManagement from "../assets/cardnew/CentralisedManagement.png";
import RealTimeUpdates from "../assets/cardnew/RealTimeUpdates.png";
export const features = [
  {
    id: 1,
    icon: UsersRound,
    title: "Attendance Tracking",
    description: "Real-time attendance monitoring with percentage calculations"
  },
  {
    id: 2,
    icon:  ServerCog,
    title: "Centralized Management",
    description: "Replace multiple disconnected tools with one unified platform for all academic and administrative needs."
  },
  {
    id: 3,
    icon:  CalendarSearch ,
    title: "Real-time Updates",
    description: "Instant notifications and live updates ensure everyone stays informed about important announcements and deadlines."
  },
  {
    id: 4,
    icon:  ChartNoAxesCombined,
    title: "Smart Analytics",
    description: "Comprehensive attendance tracking with automated alerts when students fall below the 75% threshold."
  }
];