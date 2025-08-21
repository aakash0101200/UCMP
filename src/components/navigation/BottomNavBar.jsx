import React from "react";
import { Home, Calendar, Bell, User } from "lucide-react"; // you can change icons

export default function BottomNavBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-md lg:hidden">
      <div className="flex justify-around items-center h-14">
        
        {/* Home */}
        <button className="flex flex-col items-center text-gray-600 hover:text-blue-500">
          <Home size={22} />
          <span className="text-xs">Home</span>
        </button>

        {/* Calendar */}
        <button className="flex flex-col items-center text-gray-600 hover:text-blue-500">
          <Calendar size={22} />
          <span className="text-xs">Calendar</span>
        </button>

        {/* Announcements */}
        <button className="flex flex-col items-center text-gray-600 hover:text-blue-500">
          <Bell size={22} />
          <span className="text-xs">Alerts</span>
        </button>

        {/* Profile */}
        <button className="flex flex-col items-center text-gray-600 hover:text-blue-500">
          <User size={22} />
          <span className="text-xs">Profile</span>
        </button>

      </div>
    </nav>
  );
}
