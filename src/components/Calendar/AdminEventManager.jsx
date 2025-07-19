import React, { useState } from "react";
import { EVENT_TYPES } from "../../utils/constants";

const AdminEventManager = ({ onClose, onEventAdd, userRole }) => {
  const [bulkEventData, setBulkEventData] = useState({
    type: "exam",
    course: "",
    branch: "",
    section: "",
    semester: "",
    date: "",
    time: "",
    duration: 3,
    venue: "",
    instructions: ""
  });

  const [quickEventData, setQuickEventData] = useState({
    title: "",
    type: "college_announcement",
    date: "",
    time: "",
    targetAudience: "all"
  });

  const courses = [
    "Data Structures", "Algorithms", "Database Systems", "Software Engineering",
    "Computer Networks", "Operating Systems", "Web Development", "Mobile Development"
  ];

  const branches = ["CSE", "ECE", "ME", "CE", "IT"];
  const sections = ["A", "B", "C", "D"];
  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];

  const handleBulkEventSubmit = (e) => {
    e.preventDefault();
    
    // Create event for each selected section
    sections.forEach(section => {
      const eventData = {
        id: Date.now() + Math.random(),
        title: `${bulkEventData.course} - ${bulkEventData.type.toUpperCase()}`,
        description: `${bulkEventData.course} examination for ${bulkEventData.branch} ${section}`,
        start: new Date(`${bulkEventData.date}T${bulkEventData.time}`).toISOString(),
        end: new Date(`${bulkEventData.date}T${bulkEventData.time}`).getTime() + 
              (bulkEventData.duration * 60 * 60 * 1000),
        type: bulkEventData.type,
        color: EVENT_TYPES.admin_events.find(t => t.type === bulkEventData.type)?.color || "#FF6B6B",
        assignedTo: [`${bulkEventData.branch}_${section}`], // Assign to branch-section
        createdBy: "admin",
        venue: bulkEventData.venue,
        instructions: bulkEventData.instructions,
        text: `${bulkEventData.course} - ${bulkEventData.type.toUpperCase()}`
      };
      
      onEventAdd(eventData);
    });

    // Reset form
    setBulkEventData({
      type: "exam",
      course: "",
      branch: "",
      section: "",
      semester: "",
      date: "",
      time: "",
      duration: 3,
      venue: "",
      instructions: ""
    });
    
    alert("Bulk events created successfully!");
  };

  const handleQuickEventSubmit = (e) => {
    e.preventDefault();
    
    const eventData = {
      id: Date.now() + Math.random(),
      title: quickEventData.title,
      start: new Date(`${quickEventData.date}T${quickEventData.time}`).toISOString(),
      end: new Date(`${quickEventData.date}T${quickEventData.time}`).getTime() + (2 * 60 * 60 * 1000), // 2 hours default
      type: quickEventData.type,
      color: EVENT_TYPES.admin_events.find(t => t.type === quickEventData.type)?.color || "#4ECDC4",
      assignedTo: quickEventData.targetAudience === "all" ? ["ALL"] : [],
      createdBy: "admin",
      text: quickEventData.title
    };
    
    onEventAdd(eventData);
    
    // Reset form
    setQuickEventData({
      title: "",
      type: "college_announcement",
      date: "",
      time: "",
      targetAudience: "all"
    });
    
    alert("Event created successfully!");
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h3>Event Management Panel</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="admin-content">
        {/* Bulk Event Creation */}
        <div className="bulk-event-section">
          <h4>Create Bulk Events (Exams/Deadlines)</h4>
          <form onSubmit={handleBulkEventSubmit} className="bulk-form">
            <div className="form-row">
              <div className="form-group">
                <label>Event Type</label>
                <select 
                  value={bulkEventData.type}
                  onChange={(e) => setBulkEventData({...bulkEventData, type: e.target.value})}
                >
                  <option value="exam">Exam</option>
                  <option value="academic_deadline">Academic Deadline</option>
                  <option value="faculty_meeting">Faculty Meeting</option>
                </select>
              </div>

              <div className="form-group">
                <label>Course</label>
                <select 
                  value={bulkEventData.course}
                  onChange={(e) => setBulkEventData({...bulkEventData, course: e.target.value})}
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Branch</label>
                <select 
                  value={bulkEventData.branch}
                  onChange={(e) => setBulkEventData({...bulkEventData, branch: e.target.value})}
                  required
                >
                  <option value="">Select Branch</option>
                  {branches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Semester</label>
                <select 
                  value={bulkEventData.semester}
                  onChange={(e) => setBulkEventData({...bulkEventData, semester: e.target.value})}
                  required
                >
                  <option value="">Select Semester</option>
                  {semesters.map(sem => (
                    <option key={sem} value={sem}>{sem}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input 
                  type="date"
                  value={bulkEventData.date}
                  onChange={(e) => setBulkEventData({...bulkEventData, date: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Time</label>
                <input 
                  type="time"
                  value={bulkEventData.time}
                  onChange={(e) => setBulkEventData({...bulkEventData, time: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Duration (hours)</label>
                <input 
                  type="number"
                  value={bulkEventData.duration}
                  onChange={(e) => setBulkEventData({...bulkEventData, duration: e.target.value})}
                  min="1"
                  max="8"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Venue</label>
              <input 
                type="text"
                value={bulkEventData.venue}
                onChange={(e) => setBulkEventData({...bulkEventData, venue: e.target.value})}
                placeholder="e.g., Main Hall, Lab 1, Online"
              />
            </div>

            <div className="form-group">
              <label>Instructions</label>
              <textarea
                value={bulkEventData.instructions}
                onChange={(e) => setBulkEventData({...bulkEventData, instructions: e.target.value})}
                placeholder="Special instructions for students"
                rows="3"
              />
            </div>

            <button type="submit" className="btn-primary">Create Bulk Events</button>
          </form>
        </div>

        {/* Quick Event Creation */}
        <div className="quick-event-section">
          <h4>Quick Event Creation</h4>
          <form onSubmit={handleQuickEventSubmit} className="quick-form">
            <div className="form-group">
              <label>Event Title</label>
              <input 
                type="text"
                value={quickEventData.title}
                onChange={(e) => setQuickEventData({...quickEventData, title: e.target.value})}
                required
                placeholder="e.g., Holiday - Independence Day"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Event Type</label>
                <select 
                  value={quickEventData.type}
                  onChange={(e) => setQuickEventData({...quickEventData, type: e.target.value})}
                >
                  <option value="college_announcement">College Announcement</option>
                  <option value="holiday">Holiday</option>
                  <option value="academic_deadline">Academic Deadline</option>
                </select>
              </div>

              <div className="form-group">
                <label>Target Audience</label>
                <select 
                  value={quickEventData.targetAudience}
                  onChange={(e) => setQuickEventData({...quickEventData, targetAudience: e.target.value})}
                >
                  <option value="all">All Students</option>
                  <option value="faculty">Faculty Only</option>
                  <option value="specific">Specific Branch/Section</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input 
                  type="date"
                  value={quickEventData.date}
                  onChange={(e) => setQuickEventData({...quickEventData, date: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Time</label>
                <input 
                  type="time"
                  value={quickEventData.time}
                  onChange={(e) => setQuickEventData({...quickEventData, time: e.target.value})}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">Create Quick Event</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminEventManager;
