// import React, { useState, useEffect } from 'react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Button } from '@/components/ui/button';
// import { formatISO } from 'date-fns';

// export default function EventModal({ open, onClose, onSave, eventData }) {
//   const [formData, setFormData] = useState({
//     title: '',
//     description: '',
//     startDateTime: '',
//     endDateTime: '',
//     courseId: '',
//   });

//   useEffect(() => {
//     if (eventData) {
//       setFormData({
//         ...eventData,
//         startDateTime: formatISO(new Date(eventData.startDateTime)).slice(0, 16),
//         endDateTime: formatISO(new Date(eventData.endDateTime)).slice(0, 16),
//       });
//     } else {
//       setFormData({
//         title: '',
//         description: '',
//         startDateTime: '',
//         endDateTime: '',
//         courseId: '',
//       });
//     }
//   }, [eventData]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSave(formData);
//   };

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>{eventData ? 'Edit Event' : 'Create Event'}</DialogTitle>
//         </DialogHeader>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <Input
//             type="text"
//             name="title"
//             placeholder="Event Title"
//             value={formData.title}
//             onChange={handleChange}
//             required
//           />
//           <Textarea
//             name="description"
//             placeholder="Description"
//             value={formData.description}
//             onChange={handleChange}
//           />
//           <Input
//             type="datetime-local"
//             name="startDateTime"
//             value={formData.startDateTime}
//             onChange={handleChange}
//             required
//           />
//           <Input
//             type="datetime-local"
//             name="endDateTime"
//             value={formData.endDateTime}
//             onChange={handleChange}
//             required
//           />
//           <Input
//             type="text"
//             name="courseId"
//             placeholder="Course ID (optional)"
//             value={formData.courseId}
//             onChange={handleChange}
//           />
//           <Button type="submit" className="w-full">
//             {eventData ? 'Update' : 'Create'}
//           </Button>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }





import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, User, Users, Bell, Repeat, Palette, Type, FileText } from "lucide-react";
import { EVENT_TYPES } from "../../utils/constants";

const EventModal = ({ event, onSave, onDelete, onClose, userRole, studentId }) => {
  const [formData, setFormData] = useState({
    id: event?.id || Date.now(),
    title: event?.title || "",
    description: event?.description || "",
    start: event?.start || new Date().toISOString().slice(0, 16),
    end: event?.end || new Date().toISOString().slice(0, 16),
    type: event?.type || "personal_study",
    color: event?.color || "#4ECDC4",
    assignedTo: event?.assignedTo || [],
    createdBy: event?.createdBy || studentId,
    reminder: event?.reminder || 15,
    isRecurring: event?.isRecurring || false,
    recurrence: event?.recurrence || "none",
    isNew: event?.isNew || false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [studentList, setStudentList] = useState([
    { id: "STU001", name: "John Doe", branch: "CSE", section: "A" },
    { id: "STU002", name: "Jane Smith", branch: "CSE", section: "B" },
    { id: "STU003", name: "Mike Johnson", branch: "ECE", section: "A" },
    { id: "STU004", name: "Sarah Wilson", branch: "ME", section: "A" },
    { id: "STU005", name: "David Brown", branch: "CSE", section: "A" }
  ]);

  const [selectedStudents, setSelectedStudents] = useState(
    event?.assignedTo || []
  );

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Event title is required";
    }
    
    if (!formData.start) {
      newErrors.start = "Start date and time is required";
    }
    
    if (!formData.end) {
      newErrors.end = "End date and time is required";
    }
    
    if (formData.start && formData.end) {
      const startDate = new Date(formData.start);
      const endDate = new Date(formData.end);
      
      if (startDate >= endDate) {
        newErrors.end = "End time must be after start time";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Get available event types based on user role
  const getAvailableEventTypes = () => {
    if (userRole === 'admin') {
      return [...EVENT_TYPES.admin_events, ...EVENT_TYPES.student_events];
    } else if (userRole === 'faculty') {
      return EVENT_TYPES.admin_events.filter(type => 
        type.permissions.includes('faculty')
      );
    } else {
      return EVENT_TYPES.student_events;
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleStudentSelection = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const eventData = {
        ...formData,
        assignedTo: userRole === 'student' ? [studentId] : selectedStudents,
        start: new Date(formData.start).toISOString(),
        end: new Date(formData.end).toISOString(),
        text: formData.title // DayPilot requirement
      };

      await onSave(eventData);
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setIsSubmitting(true);
      try {
        await onDelete(formData.id);
      } catch (error) {
        console.error('Error deleting event:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Close modal with Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {event?.isNew ? 'Create New Event' : 'Edit Event'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Event Title */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Type className="w-4 h-4" />
                <span>Event Title *</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.title ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="Enter event title"
                required
              />
              {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
            </div>

            {/* Event Type */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Palette className="w-4 h-4" />
                <span>Event Type *</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              >
                {getAvailableEventTypes().map(type => (
                  <option key={type.type} value={type.type}>
                    {type.type.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Date and Time Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Clock className="w-4 h-4" />
                  <span>Start Date & Time *</span>
                </label>
                <input
                  type="datetime-local"
                  name="start"
                  value={formData.start}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.start ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  required
                />
                {errors.start && <p className="text-sm text-red-600">{errors.start}</p>}
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Clock className="w-4 h-4" />
                  <span>End Date & Time *</span>
                </label>
                <input
                  type="datetime-local"
                  name="end"
                  value={formData.end}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.end ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  required
                />
                {errors.end && <p className="text-sm text-red-600">{errors.end}</p>}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <FileText className="w-4 h-4" />
                <span>Description</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                placeholder="Enter event description"
              />
            </div>

            {/* Color and Reminder Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: formData.color }}></div>
                  <span>Event Color</span>
                </label>
                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Bell className="w-4 h-4" />
                  <span>Reminder</span>
                </label>
                <select
                  name="reminder"
                  value={formData.reminder}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value={0}>No reminder</option>
                  <option value={15}>15 minutes before</option>
                  <option value={30}>30 minutes before</option>
                  <option value={60}>1 hour before</option>
                  <option value={1440}>1 day before</option>
                </select>
              </div>
            </div>

            {/* Student Assignment (Admin/Faculty only) */}
            {(userRole === 'admin' || userRole === 'faculty') && (
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Users className="w-4 h-4" />
                  <span>Assign to Students</span>
                </label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {studentList.map(student => (
                      <label key={student.id} className="flex items-center space-x-2 p-2 hover:bg-white rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => handleStudentSelection(student.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {student.name} ({student.branch} - {student.section})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Recurring Event */}
            <div className="space-y-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isRecurring"
                  checked={formData.isRecurring}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <Repeat className="w-4 h-4 text-gray-700" />
                <span className="text-sm font-medium text-gray-700">Recurring Event</span>
              </label>

              {formData.isRecurring && (
                <div className="ml-6 space-y-2">
                  <label className="text-sm font-medium text-gray-700">Recurrence Pattern</label>
                  <select
                    name="recurrence"
                    value={formData.recurrence}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              
              {!event?.isNew && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-6 py-3 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                  disabled={isSubmitting}
                >
                  Delete Event
                </button>
              )}
              
              <button
                type="submit"
                className="px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : (event?.isNew ? 'Create Event' : 'Update Event')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventModal;












