import React from 'react';
import { FaUserGraduate, FaChartLine, FaCalendarAlt, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = () => {
  return (
    <div className="h-screen w-60 bg-[#1f2937] text-white p-4">
      <div className="text-2xl font-bold mb-8">🎓 react</div>
      <nav className="flex flex-col space-y-4">
        <a href="#" className="flex items-center gap-2 hover:text-blue-400">
          <FaUserGraduate /> Dashboard
        </a>
        <a href="#" className="flex items-center gap-2 hover:text-blue-400">
          <FaChartLine /> Attendance
        </a>
        <a href="#" className="flex items-center gap-2 hover:text-blue-400">
          <FaCalendarAlt /> Timetable
        </a>
        <a href="#" className="flex items-center gap-2 hover:text-red-400 mt-auto">
          <FaSignOutAlt /> Logout
        </a>
      </nav>
    </div>
  );
};

export default Sidebar;