import React from 'react';
import { format, addMonths, subMonths } from 'date-fns';

export default function CalendarHeader({
  currentDate,
  currentView,
  onViewChange,
  onDateChange,
  onNewEventClick
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b bg-white">
      <div className="flex items-center space-x-4">
        <button
          className="px-2 py-1 bg-gray-200 rounded"
          onClick={() => onDateChange(subMonths(currentDate, 1))}
        >
          ◀
        </button>
        <h2 className="text-xl font-semibold">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <button
          className="px-2 py-1 bg-gray-200 rounded"
          onClick={() => onDateChange(addMonths(currentDate, 1))}
        >
          ▶
        </button>
      </div>

      <div className="flex items-center space-x-2 mt-2 sm:mt-0">
        <select
          value={currentView}
          onChange={(e) => onViewChange(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="month">Month</option>
          <option value="list">Upcoming</option>
        </select>
        <button
          onClick={onNewEventClick}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + New Event
        </button>
      </div>
    </div>
  );
}
