import React, { useState } from "react";
import { X, Plus, Clock, Calendar, MapPin, Users, Bell, Star, BookOpen, Coffee, Briefcase, Heart, Target, Zap } from "lucide-react";
import { EVENT_TYPES } from "../../utils/constants";

const StudentEventManager = ({ onClose, onEventAdd, studentId, isMobile }) => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [eventData, setEventData] = useState({
    title: "",
    type: "personal_study",
    date: "",
    startTime: "",
    endTime: "",
    description: "",
    priority: "medium",
    reminder: 30,
    color: "#00D2D3"
  });

  const [myEvents, setMyEvents] = useState([
    {
      id: 1,
      title: "Advanced React Concepts",
      type: "personal_study",
      date: "2025-07-20",
      startTime: "09:00",
      endTime: "11:00",
      description: "Deep dive into React hooks and context API",
      priority: "high",
      color: "#FF6B6B"
    },
    {
      id: 2,
      title: "Database Project Due",
      type: "assignment",
      date: "2025-07-22",
      startTime: "23:59",
      endTime: "23:59",
      description: "Submit final database management project",
      priority: "high",
      color: "#4ECDC4"
    },
    {
      id: 3,
      title: "CSE Club Meeting",
      type: "club_activity",
      date: "2025-07-25",
      startTime: "15:00",
      endTime: "17:00",
      description: "Monthly tech discussion and project planning",
      priority: "medium",
      color: "#45B7D1"
    }
  ]);

  const templates = [
    {
      id: 1,
      name: "Study Session",
      icon: BookOpen,
      type: "personal_study",
      duration: 2,
      color: "#00D2D3",
      description: "Focus time for academic subjects",
      gradient: "from-blue-400 to-blue-600"
    },
    {
      id: 2,
      name: "Assignment",
      icon: Target,
      type: "assignment",
      duration: 1,
      color: "#FF9FF3",
      description: "Project submissions and homework",
      gradient: "from-purple-400 to-pink-600"
    },
    {
      id: 3,
      name: "Club Meeting",
      icon: Users,
      type: "club_activity",
      duration: 1.5,
      color: "#5F27CD",
      description: "Student organization activities",
      gradient: "from-indigo-400 to-purple-600"
    },
    {
      id: 4,
      name: "Personal Meeting",
      icon: Coffee,
      type: "personal_meeting",
      duration: 1,
      color: "#54A0FF",
      description: "One-on-one meetings and discussions",
      gradient: "from-blue-400 to-indigo-600"
    },
    {
      id: 5,
      name: "Reminder",
      icon: Bell,
      type: "personal_reminder",
      duration: 0.5,
      color: "#01A3A4",
      description: "Important tasks and deadlines",
      gradient: "from-teal-400 to-cyan-600"
    },
    {
      id: 6,
      name: "Break Time",
      icon: Heart,
      type: "personal_study",
      duration: 0.5,
      color: "#FF6B6B",
      description: "Rest and relaxation periods",
      gradient: "from-red-400 to-pink-600"
    }
  ];

  const getEventIcon = (type) => {
    const iconMap = {
      personal_study: BookOpen,
      assignment: Target,
      club_activity: Users,
      personal_meeting: Coffee,
      personal_reminder: Bell
    };
    return iconMap[type] || BookOpen;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatTime = (time) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setEventData(prev => ({
      ...prev,
      type: template.type,
      color: template.color,
      description: template.description,
      title: template.name
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const startDateTime = new Date(`${eventData.date}T${eventData.startTime}`);
    const endDateTime = new Date(`${eventData.date}T${eventData.endTime}`);
    
    const newEvent = {
      id: Date.now() + Math.random(),
      title: eventData.title,
      description: eventData.description,
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString(),
      type: eventData.type,
      color: eventData.color,
      assignedTo: [studentId],
      createdBy: studentId,
      priority: eventData.priority,
      reminder: eventData.reminder,
      text: eventData.title
    };
    
    setMyEvents(prev => [...prev, newEvent]);
    onEventAdd(newEvent);
    
    // Reset form
    setEventData({
      title: "",
      type: "personal_study",
      date: "",
      startTime: "",
      endTime: "",
      description: "",
      priority: "medium",
      reminder: 30,
      color: "#00D2D3"
    });
    setSelectedTemplate(null);
    
    // Show success message
    alert("Personal event created successfully!");
  };

  const upcomingEvents = myEvents.filter(event => new Date(event.date) >= new Date());
  const pastEvents = myEvents.filter(event => new Date(event.date) < new Date());

  return (
    <div className={`fixed inset-y-0 right-0 z-50 ${isMobile ? 'w-full' : 'w-96'} bg-white shadow-2xl transform transition-transform duration-300 ease-in-out`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold">My Events</h3>
              <p className="text-blue-100 text-sm">Manage your personal schedule</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === "templates"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("templates")}
          >
            <Plus className="w-4 h-4 mx-auto mb-1" />
            Create
          </button>
          <button
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === "upcoming"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("upcoming")}
          >
            <Clock className="w-4 h-4 mx-auto mb-1" />
            Upcoming
          </button>
          <button
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === "past"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("past")}
          >
            <Star className="w-4 h-4 mx-auto mb-1" />
            Past
          </button>
        </div>

        {/* Templates Tab */}
        {activeTab === "templates" && (
          <div className="p-6 space-y-6">
            {/* Quick Templates */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Quick Templates</h4>
              <div className="grid grid-cols-2 gap-4">
                {templates.map(template => {
                  const IconComponent = template.icon;
                  return (
                    <div
                      key={template.id}
                      className={`relative group cursor-pointer transition-all duration-300 ${
                        selectedTemplate?.id === template.id 
                          ? 'scale-105 shadow-lg' 
                          : 'hover:scale-102 hover:shadow-md'
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className={`bg-gradient-to-br ${template.gradient} rounded-2xl p-4 text-white relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-black/10 rounded-2xl"></div>
                        <div className="relative z-10">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <h5 className="font-semibold text-sm mb-1">{template.name}</h5>
                          <p className="text-xs text-white/80 mb-2">{template.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium bg-white/20 rounded-full px-2 py-1">
                              {template.duration}h
                            </span>
                            {selectedTemplate?.id === template.id && (
                              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Event Creation Form */}
            {selectedTemplate && (
              <div className="bg-gray-50 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Create Event</h4>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={eventData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter event title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={eventData.date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        value={eventData.startTime}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        value={eventData.endTime}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={eventData.priority}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={eventData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Add event description"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setSelectedTemplate(null)}
                      className="flex-1 py-3 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Event
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Upcoming Events Tab */}
        {activeTab === "upcoming" && (
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Upcoming Events ({upcomingEvents.length})
            </h4>
            <div className="space-y-4">
              {upcomingEvents.map(event => {
                const IconComponent = getEventIcon(event.type);
                return (
                  <div
                    key={event.id}
                    className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: event.color }}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-800">{event.title}</h5>
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatTime(event.startTime)} - {formatTime(event.endTime)}
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(event.priority)}`}>
                            {event.priority.charAt(0).toUpperCase() + event.priority.slice(1)} Priority
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {upcomingEvents.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No upcoming events</p>
                  <p className="text-sm text-gray-400">Create your first event using the templates above</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Past Events Tab */}
        {activeTab === "past" && (
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Past Events ({pastEvents.length})
            </h4>
            <div className="space-y-4">
              {pastEvents.map(event => {
                const IconComponent = getEventIcon(event.type);
                return (
                  <div
                    key={event.id}
                    className="bg-gray-50 border border-gray-200 rounded-2xl p-4 opacity-75"
                  >
                    <div className="flex items-start space-x-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: event.color }}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-600">{event.title}</h5>
                        <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center text-sm text-gray-400">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-sm text-gray-400">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatTime(event.startTime)} - {formatTime(event.endTime)}
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                            Completed
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {pastEvents.length === 0 && (
                <div className="text-center py-12">
                  <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No past events</p>
                  <p className="text-sm text-gray-400">Your completed events will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentEventManager;
