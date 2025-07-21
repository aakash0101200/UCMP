
import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import EventModal from './EventModal';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([
    { date: '2025-07-10', title: 'Assignment Due' },
    { date: '2025-07-31', title: 'Project Kick-off' },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // handleAddEvent now expects an object with title and date
  const handleAddEvent = (eventData) => {
    const newEvent = {
      date: format(new Date(eventData.date), 'yyyy-MM-dd'),
      title: eventData.title,
    };
    setEvents([...events, newEvent]);
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <div className="max-w-screen-sm 0mx-auto bg-white p-6 rounded-x1 shadow-md">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 border rounded-md flex items-center gap-2 hover:bg-gray-100">
              Month <span className="text-gray-400">▼</span>
            </button>
            
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white font-semibold rounded-md flex items-center justify-center gap-2 hover:bg-blue-700"
          >
            <Plus size={18} /> New Event
          </button>
        </div>

        {/* Calendar Navigation and Grid... (rest of the component is the same) */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 rounded-full hover:bg-gray-100">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-blue-700">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 rounded-full hover:bg-gray-100">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 text-center font-semibold text-gray-600">
          {weekdays.map(day => (
            <div key={day} className="py-2 border-b">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day) => {
            const dayEvents = events.filter(e => e.date === format(day, 'yyyy-MM-dd'));
            const isSelected = isSameDay(day, selectedDate);
            return (
              <div
                key={day.toString()}
                onClick={() => setSelectedDate(day)}
                className={`relative h-24 sm:h-32 p-2 border-t border-r cursor-pointer transition-colors duration-200 ${
                  !isSameMonth(day, monthStart)
                    ? 'bg-gray-50 text-gray-400'
                    : 'bg-white hover:bg-blue-50'
                } ${
                  isSelected ? 'bg-blue-100' : ''
                }`}
              >
                <span className={`absolute top-2 left-2 text-sm font-medium ${isToday(day) ? 'bg-blue-600 text-white rounded-full h-7 w-7 flex items-center justify-center' : ''}`}>
                  {format(day, 'd')}
                </span>
                <div className="mt-8 space-y-1 overflow-y-auto max-h-20">
                  {dayEvents.map((event, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs bg-red-100 text-red-700 rounded-md px-2 py-1">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      <span>{event.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isModalOpen && (
        <EventModal
          initialDate={selectedDate} 
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddEvent}
        />
      )}
    </div>
  );
};

export default Calendar;

