import React from "react";
import { format } from "date-fns";

const HeaderControls = ({
  selectedDate,
  onPrev,
  onNext,
  onToday,
  currentView,
  onViewChange,
  onNewEventClick,
  filterOptions = [],
  selectedFilter,
  onFilterChange,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
      {/* Date Navigation */}
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          onClick={onPrev}
        >
          ←
        </button>
        <button
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          onClick={onToday}
        >
          Today
        </button>
        <button
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          onClick={onNext}
        >
          →
        </button>

        <div className="ml-4 text-lg font-semibold">
          {format(selectedDate, "MMMM yyyy")}
        </div>
      </div>

      {/* View Switcher */}
      <div className="flex items-center gap-2">
        {["month", "day", "list"].map((view) => (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            className={`px-3 py-1 rounded ${
              currentView === view
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      {/* Filter Dropdown (e.g., Course) */}
      {filterOptions.length > 0 && (
        <select
          value={selectedFilter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">All Courses</option>
          {filterOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name}
            </option>
          ))}
        </select>
      )}

      {/* New Event Button */}
      <button
        onClick={onNewEventClick}
        className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
      >
        + New Event
      </button>
    </div>
  );
};

export default HeaderControls;
