// src/components/EventModal.jsx
import React, { useState } from 'react';
import { format } from 'date-fns';

const EventModal = ({ initialDate, onClose, onSave }) => {
  const [title, setTitle] = useState('');

  // The modal now manages its own date state, initialized by the prop.
  const [eventDate, setEventDate] = useState(initialDate);

//    useEffect(() => {
//    setEventDate(initialDate)
//  }, [initialDate])

  const handleSave = () => {
    if (title && eventDate) {
      // Pass an object with both title and the chosen date back to the parent.
      onSave({ title, date: format(eventDate, 'yyyy-MM-dd') })
       onClose() ;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm text-gray-800">
        <h2 className="text-lg font-bold mb-4">Add New Event</h2>
        
        {/* Input for Event Title */}
        <div className="mb-4">
          <label htmlFor="eventTitle" className="block text-xs font-medium text-gray-700 mb-1">Event Title</label>
          <input
            id="eventTitle"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Team Meeting"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500   const [eventDate, setEventDate] = useState(initialDate);
                      "
          />
        </div>

        {/* NEW: Input for Event Date */}
        <div className="mb-6">
          <label htmlFor="eventDate" className="block text-xs font-medium text-gray-700 mb-1">Date</label>
          <input
            id="eventDate"
            type="date"
            // The value needs to be in 'yyyy-MM-dd' format for the input
            value={format(new Date(eventDate), 'yyyy-MM-dd')}
            onChange={(e) => setEventDate(new Date(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            disabled={!title || !eventDate} // Disable button if title is empty
          >
            Save Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
