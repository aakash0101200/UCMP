// src/components/Dashboard/CalendarLayout.jsx
import React from 'react';
import { format, isSameDay, isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarLayout({
  days,
  monthStart,
  events,
  selectedDate,
  onDayClick,
  onPrevMonth,
  onNextMonth,
  currentDate,
  weekdays,
}) {
  return (
    <div className="flex flex-col md:flex-row gap-6 p-4">
      {/* Sidebar: Events List */}
      <aside className="w-full md:w-1/3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
          Events
        </h3>
        <ul className="space-y-2 max-h-[600px] overflow-y-auto">
          {events.map((e, idx) => (
            <li
              key={idx}
              className="p-2 bg-blue-50 dark:bg-blue-900 rounded cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800 transition"
              onClick={() => onDayClick(new Date(e.date))}
            >
              <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                {e.title}
              </span>
              <span className="block text-xs text-gray-500 dark:text-gray-400">
                {format(new Date(e.date), 'PPP')}
              </span>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main: Calendar */}
      <section className="flex-1 bg-white dark:bg-gray-900 p-4 rounded-lg shadow">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onPrevMonth}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label="Previous Month"
          >
            <ChevronLeft size={20} className="dark:text-gray-200" />
          </button>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button
            onClick={onNextMonth}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label="Next Month"
          >
            <ChevronRight size={20} className="dark:text-gray-200" />
          </button>
        </div>

        {/* Weekdays Header */}
        <div className="grid grid-cols-7 text-center font-semibold text-gray-600 dark:text-gray-400 border-b pb-2 mb-2 text-xs">
          {weekdays.map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 grid-rows-6 gap-px">
          {days.map((day) => {
            const iso = format(day, 'yyyy-MM-dd');
            const dayEvents = events.filter((e) => e.date === iso);
            const isSelected = isSameDay(day, selectedDate);
            const isOutside = !isSameMonth(day, monthStart);

            return (
              <div
                key={iso}
                onClick={() => onDayClick(day)}
                className={`
                  relative aspect-square p-1 cursor-pointer
                  ${isOutside
                    ? 'bg-gray-50 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                    : 'bg-white hover:bg-blue-50 dark:bg-gray-900 dark:hover:bg-gray-800'}
                  ${isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''}
                  transition-colors duration-200
                  overflow-hidden
                `}
              >
                {/* Date Number */}
                <div className="absolute top-1 left-1">
                  <span
                    className={`text-xs font-medium ${
                      isSameDay(day, new Date())
                        ? 'bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center'
                        : ''
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Events Preview */}
                <div className="mt-6 space-y-0.5 overflow-y-auto max-h-12 pr-1 text-[10px]">
                  {dayEvents.map((ev, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded px-1 py-0.5"
                    >
                      <span className="w-1.5 h-1.5 bg-red-500 dark:bg-red-400 rounded-full"></span>
                      <span className="truncate">{ev.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
