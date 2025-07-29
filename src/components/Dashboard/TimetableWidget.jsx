import React, { useState } from "react";
import "./TimetableWidget.css"; // For custom styles

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const today = new Date();
const currentDayIndex = today.getDay();

const TimetableWidget = () => {
  const [view, setView] = useState("Day");
  const [selectedDay, setSelectedDay] = useState("Today");

  const timetableData = {
    Monday: [
      { time: "9:00 AM", subject: "Math", room: "A101", teacher: "Prof. X" },
      { time: "11:00 AM", subject: "Physics", room: "B201", teacher: "Dr. Y" },
    ],
    Tuesday: [
      { time: "9:00 AM", subject: "Data Structures", room: "B201", teacher: "abc" },
      { time: "11:00 AM", subject: "Web Dev", room: "Lab-1", teacher: "abc" },
    ],
    Wednesday: [
      { time: "10:00 AM", subject: "DBMS", room: "B203", teacher: "abc" },
      { time: "1:00 PM", subject: "Software Engineering", room: "C104", teacher: "abc" },
    ],
    Thursday: [
      { time: "10:00 AM", subject: "DBMS", room: "B203", teacher: "abc" },
      { time: "1:00 PM", subject: "Software Engineering", room: "C104", teacher: "abc" },
    ],
    Friday: [
      { time: "8:00 AM", subject: "Maths", room: "A101", teacher: "abc" },
      { time: "12:00 PM", subject: "Operating Systems", room: "Lab-2", teacher: "abc" },
    ],
    Saturday: [
      { time: "9:00 AM", subject: "Python", room: "B101", teacher: "abc" },
      { time: "11:00 AM", subject: "DBMS", room: "Lab-2", teacher: "abc" },
    ],
    Sunday: [],
  };

  const getDayFromView = () => {
    if (selectedDay === "Today") return days[currentDayIndex];
    if (selectedDay === "Tomorrow") return days[(currentDayIndex + 1) % 7];
    if (selectedDay === "Yesterday") return days[(currentDayIndex - 1 + 7) % 7];
    return days[currentDayIndex];
  };

  const dayToShow = getDayFromView();
  const dataToShow = timetableData[dayToShow] || [];

  return (
    <div className="bg-[#1f2937] text-white p-4 rounded-lg  relative w-full max-w-[420px] border border-white shadow-[0_0_40px_5px_rgba(52,211,153,0.4)] ml-4 ">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Timetable</h2>

        {/* Toggle Switch */}
        <label className="switch">
          <input
            type="checkbox"
            checked={view === "Weekly"}
            onChange={() => setView(view === "Day" ? "Weekly" : "Day")}
          />
          <span className="slider round"></span>
        </label>
      </div>

      {/* Dropdown for Day selection */}
      {view === "Day" && (
        <div className="mb-4">
          <select
            className="px-3 py-1 text-white bg-gray-800 rounded"
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
          >
            <option value="Yesterday">Yesterday</option>
            <option value="Today">Today</option>
            <option value="Tomorrow">Tomorrow</option>
          </select>
        </div>
      )}

      {/* Table Rendering */}
      {view === "Day" ? (
        <table className="w-full text-sm table-fixed">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="w-1/4 px-3 py-2 text-left">Time</th>
              <th className="w-1/3 px-3 py-2 text-left">Subject</th>
              <th className="w-1/6 px-3 py-2 text-left">Room</th>
              <th className="w-1/6 px-3 py-2 text-left">Teacher</th>
            </tr>
          </thead>
          <tbody>
            {dataToShow.length > 0 ? (
              dataToShow.map((entry, index) => (
                <tr key={index} className="border-b border-gray-700">
                  <td className="px-3 py-2">{entry.time}</td>
                  <td className="px-3 py-2">{entry.subject}</td>
                  <td className="px-3 py-2">{entry.room}</td>
                  <td className="px-3 py-2">{entry.teacher}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-4 text-center text-gray-400">
                  No classes scheduled for {dayToShow}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      ) : (
        // Weekly overlay container
        <div className="weekly-overlay absolute top-16 left-0 w-full max-w-[420px] z-50 bg-[#1f2937] border border-gray-600 rounded-lg shadow-lg max-h-[400px] overflow-y-auto p-3">
          {Object.keys(timetableData).map((day, idx) => (
            <div key={idx} className="mb-4">
              <h3 className="mt-2 font-semibold text-blue-400">{day}</h3>
              {timetableData[day].length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-600">
                      <th className="px-3 py-2">Time</th>
                      <th className="px-3 py-2">Subject</th>
                      <th className="px-3 py-2">Room</th>
                      <th className="px-3 py-2">Teacher</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timetableData[day].map((entry, i) => (
                      <tr key={i} className="border-b border-gray-700">
                        <td className="px-3 py-2">{entry.time}</td>
                        <td className="px-3 py-2">{entry.subject}</td>
                        <td className="px-3 py-2">{entry.room}</td>
                        <td className="px-3 py-2">{entry.teacher}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-400">No classes</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimetableWidget;



