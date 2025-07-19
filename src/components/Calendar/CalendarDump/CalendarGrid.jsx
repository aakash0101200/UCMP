import React from "react";
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  format 
} from "date-fns";

const CalendarGrid = ({ events, selectedDate, onDateClick }) => {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const rows = [];
  let days = [];
  let day = startDate;

  // Day headers for better accessibility
  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Create calendar grid
  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = day;
      const dayEvents = events.filter(event => 
        isSameDay(new Date(event.startDateTime), day)
      );
      
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isToday = isSameDay(day, new Date());
      
      days.push(
        <div 
          key={day.toString()}
          role="gridcell"
          aria-label={`Date ${format(day, 'MMMM d, yyyy')} with ${dayEvents.length} events`}
          className={`
            flex flex-col min-h-[80px] sm:min-h-[100px] border border-gray-200 
            transition-colors duration-150 hover:bg-blue-50 cursor-pointer
            ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
            ${isToday ? 'border-blue-500 border-2' : ''}
          `}
          onClick={() => onDateClick(cloneDay)}
        >
          <div className="flex justify-between p-1 sm:p-2">
            <span className="text-sm font-medium">
              {format(day, 'd')}
            </span>
            {isToday && (
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[60px] sm:max-h-[80px] p-1">
            {dayEvents.slice(0, 3).map(event => (
              <div 
                key={event.id}
                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 
                           rounded mb-1 truncate font-medium"
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-500 mt-1">
                +{dayEvents.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    
    rows.push(
      <div 
        key={day.toString()} 
        className="grid grid-cols-7"
      >
        {days}
      </div>
    );
    days = [];
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      {/* Day headers */}
      <div 
        className="grid grid-cols-7 bg-gray-100 text-gray-700 
                   text-xs sm:text-sm font-medium uppercase"
      >
        {dayHeaders.map(day => (
          <div 
            key={day} 
            className="py-3 text-center"
            aria-label={day}
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="divide-y divide-gray-100">
        {rows}
      </div>
    </div>
  );
};

export default CalendarGrid;