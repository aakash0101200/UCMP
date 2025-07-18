import React from "react";
import { format, isToday } from "date-fns";
import clsx from "clsx";

/**
 * Renders a single day in the calendar grid.
 *
 * Props:
 * - date: Date object for this cell
 * - isCurrentMonth: whether this date belongs to the displayed month
 * - isSelected: whether this is the currently selected date
 * - onClick: function to handle cell clicks
 * - events: array of events for this day
 */
const DayCell = ({ date, isCurrentMonth, isSelected, onClick, events = [] }) => {
  return (
    <div
      className={clsx(
        "border p-2 h-24 relative cursor-pointer transition-colors duration-200",
        {
          "bg-blue-50": isSelected,
          "bg-gray-100": !isCurrentMonth,
          "hover:bg-blue-100": isCurrentMonth,
        }
      )}
      onClick={() => onClick(date)}
    >
      <div
        className={clsx("text-xs font-medium", {
          "text-blue-700": isToday(date),
          "text-gray-900": isCurrentMonth,
          "text-gray-400": !isCurrentMonth,
        })}
      >
        {format(date, "d")}
      </div>

      {/* Event indicators */}
      <div className="absolute bottom-1 left-1 right-1 flex flex-wrap gap-1">
        {events.slice(0, 3).map((event) => (
          <div
            key={event.id}
            className="bg-blue-600 rounded-full w-2 h-2"
            title={event.title}
          />
        ))}
        {events.length > 3 && (
          <div className="text-[10px] text-gray-500 ml-1">+{events.length - 3}</div>
        )}
      </div>
    </div>
  );
};

export default DayCell;
