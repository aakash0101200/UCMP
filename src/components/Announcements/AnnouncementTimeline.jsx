import React, { useEffect, useState } from "react";
import { Clock, MapPin, User, ArrowRight } from "lucide-react"; // Icons
import API from "../../Services/announcements.js"; // API service for fetching announcements

const AnnouncementTimeline = () => {
  // State to store announcements fetched from the API
  const [announcements, setAnnouncements] = useState([]);

  // Function to return style classes based on the announcement type
  const getTypeStyles = (type) => {
    switch (type) {
      case "event":
        return {
          dot: "bg-purple-500",     // color of the timeline dot
          line: "bg-purple-200",    // color of the vertical line
          bg: "bg-purple-50",       // background for the card
          text: "text-purple-800",  // text color
        };
      case "deadline":
        return {
          dot: "bg-red-500",
          line: "bg-red-200",
          bg: "bg-red-50",
          text: "text-red-800",
        };
      case "update":
        return {
          dot: "bg-blue-500",
          line: "bg-blue-200",
          bg: "bg-blue-50",
          text: "text-blue-800",
        };
      default:
        return {
          dot: "bg-orange-500",
          line: "bg-orange-200",
          bg: "bg-orange-50",
          text: "text-orange-800",
        };
    }
  };

  // Fetch announcements from the API when component mounts
  useEffect(() => {
    API.get('/')
      .then(response => setAnnouncements(response.data)) // Set data in state
      .catch(err => console.log('Failed to fetch announcements:', err));
  }, []); // Empty dependency array = run only once on load

  return (
    <>
      {/* Container for the timeline */}
      <div className="p-4 max-w-160  shadow-lg  bg-sidebar rounded-2xl">

        {/* Header section with title and "View All" button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Updates</h2>
          <button className="flex items-center space-x-1 font-medium text-blue-600 transition-colors hover:text-blue-800">
            <span className="text-md">View All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline content container */}
        <div className="relative">

          {/* Loop through all announcements and render them */}
          {announcements.map((announcement, index) => {
            const styles = getTypeStyles(announcement.type); // Get style based on type
            const isLast = index === announcements.length - 1; // Check if last item in list

            return (
              <div key={announcement.id} className="relative flex items-start group">
                

                {/* Dot for each timeline entry */}
                <div
                  className={`relative mt-2 z-10 w-5 h-5 ${styles.dot} rounded-full flex items-center justify-center shadow-md ${
                    announcement.isCompleted ? "ring-4 ring-green-200" : ""
                  } transition-all duration-300 group-hover:scale-110`}
                >

                  {/* Inner white dot */}
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>

                {/* Right section (card with announcement content) */}
                <div className="flex-1 pb-4 ml-3">
                  <div
                    className={`${styles.bg} rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group-hover:scale-[1.01]`}
                  >

                    {/* Title and type badge */}
                    <div className="flex items-start justify-between ">
                      <h3 className="text-md font-semibold text-gray-900 transition-colors group-hover:text-gray-700">
                        {announcement.title}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${styles.bg} ${styles.text} capitalize`}
                      >
                        {announcement.type}
                      </span>
                    </div>


                    {/* Announcement description */}
                    <p className="mb-0.5 text-sm leading-relaxed text-gray-700">
                      {announcement.description}
                    </p>

                    {/* Footer with time, location, and author */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                     
                      {/* Left side: time and location */}
                      <div className="flex items-center space-x-4">
                       
                        {/* Time */}
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs">{announcement.time}</span>
                        </div>

                        {/* Location (only if present) */}
                        {announcement.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span className="text-xs">{announcement.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Right side: author */}
                      <div className="flex items-center space-x-1 p-auto">
                        <User className="w-4 h-4" />
                        <span className="text-xs">{announcement.author}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default AnnouncementTimeline;
