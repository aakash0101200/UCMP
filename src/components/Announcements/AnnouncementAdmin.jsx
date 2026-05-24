// Import React and useState hook
import React, { useEffect, useState } from 'react';
import API from '../../Services/announcements.js';


// Import icons from lucide-react for visual UI elements
import {
  Plus,        // "+" icon for Add button
  Edit3,       // Pencil icon for Edit
  Trash2,      // Trash bin icon for Delete
  Clock,       // Clock icon for time
  MapPin,      // Pin icon for location
  User,        // Person icon for author
  AlertCircle, // Alert icon for type
  CheckCircle, // Tick icon for completed status
} from 'lucide-react';



// Main component: Admin interface to manage (create/edit/delete) announcements
const AnnouncementAdmin = ({ announcements, onAnnouncementsChange }) => {
  // Whether the form is currently open for adding/editing
  const [isComposing, setIsComposing] = useState(false);

  // Stores the ID of the announcement being edited, or null if adding a new one
  const [editingId, setEditingId] = useState(null);

  // Form data for announcement — shared state for input fields
  const [formData, setFormData] = useState({
    title: '',            // Title of announcement
    description: '',      // Details or message
    time: '',             // When it’s happening (optional)
    location: '',         // Where it’s happening (optional)
    author: '',           // Who created it
    type: 'update',       // Type: event, deadline, update, alert
    isCompleted: false,   // Whether it’s completed
  });

  // Function to reset the form to blank/default values
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      time: '',
      location: '',
      author: '',
      type: 'update',
      isCompleted: false,
    });
    setEditingId(null); // Reset editing mode to "add new"
  };

  // Form submission handler (called when "Save" or "Update" is clicked)
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form behavior (like page reload)

    // Simple validation: title and description are required
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    // Create a new announcement object from form data
    const newAnnouncement = {
      // announcementId: editingId || 100, // Use existing ID if editing; otherwise, generate a unique one
      title: formData.title.trim(),
      description: formData.description.trim(),
      time: formData.time || new Date().toLocaleString(), // Default time if not given
      location: formData.location.trim() || undefined,
      author: formData.author.trim() || 'Admin',
      type: formData.type,
      isCompleted: formData.isCompleted,
    };



    try {

      if (editingId) {
        // If editing an existing announcement, update it
        const response = await API.put(`/${editingId}`, newAnnouncement);
        const updatedAnnouncement = response.data;
        const updatedList = announcements.map((a) =>
          a.announcementId === editingId ? updatedAnnouncement : a
        );
        onAnnouncementsChange(updatedList); // Update list
      } else {
        console.log("adding");
        // If creating a new announcement, add it to the beginning of the list
        const response = await API.post('/add', newAnnouncement);
        const saveAnnouncement = response.data;
        //Add new to the front of list
        onAnnouncementsChange([saveAnnouncement, ...announcements]);
      }

      // After submitting: reset the form and close it
      resetForm();
      setIsComposing(false);
    } catch (error) {
      console.error('Error in saving announcement:', error);
      alert('Failed to save announcement...')
    }


  };

  // Called when the user clicks the edit button on an existing announcement
  const handleEdit = (announcement) => {
    // Fill the form with existing data so it can be edited
    setFormData({
      title: announcement.title,
      description: announcement.description,
      time: announcement.time,
      location: announcement.location || '',
      author: announcement.author,
      type: announcement.type,
      isCompleted: announcement.isCompleted || false,
    });

    setEditingId(announcement.announcementId); // Switch form to edit mode
    setIsComposing(true);          // Open the form
  };

  // Called when the user clicks the delete button
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure to delete this announcement'))
      return;

    try {
      await API.delete(`/${id}`);
      const filtered = announcements.filter((a) => a.announcementId !== id); // Remove selected announcement
      onAnnouncementsChange(filtered); // Update list
    } catch (error) {
      console.error('Error in deleting announcement:', error);
      alert("Delete failed. Try again!..");
    }
  };

  return (
    <div className="space-y-6 bg-white dark:bg-[#161B26] border border-slate-100 dark:border-transparent rounded-[2rem] p-6 shadow-sm">
      {/* Title and Add button section */}
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Manage Announcements</h2>
        <button onClick={() => {
          resetForm();        // Clear any existing form data
          setIsComposing(true); // Show the form 
        }}
          className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-white px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 hover:scale-[1.02] active:scale-95 duration-200 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {/* Show the form only when isComposing is true */}
      {isComposing && (
        <form
          onSubmit={handleSubmit}
          className="p-5 bg-slate-50 dark:bg-[#0B0F19]/40 border border-slate-200 dark:border-slate-800/60 rounded-2xl space-y-4 shadow-sm"
        >
          {/* Grid layout for input fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Title"
              className="bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/60 rounded-xl py-2 px-3 text-xs w-full text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Author"
              className="bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/60 rounded-xl py-2 px-3 text-xs w-full text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            />
            <input
              type="text"
              placeholder="Time (optional)"
              className="bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/60 rounded-xl py-2 px-3 text-xs w-full text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
            <input
              type="text"
              placeholder="Location"
              className="bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/60 rounded-xl py-2 px-3 text-xs w-full text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          {/* Text area for longer description */}
          <textarea
            placeholder="Description"
            className="w-full bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/60 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={3}
          />

          {/* Dropdown and checkbox section */}
          <div className="flex items-center gap-4">
            {/* Dropdown for announcement type */}
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/60 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            >
              <option value="event">Event</option>
              <option value="deadline">Deadline</option>
              <option value="update">Update</option>
              <option value="alert">Alert</option>
            </select>

            {/* Checkbox for completion status */}
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isCompleted}
                onChange={(e) =>
                  setFormData({ ...formData, isCompleted: e.target.checked })
                }
                className="rounded border-slate-300 dark:border-slate-800 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
              />
              Completed
            </label>
          </div>

          {/* Action buttons: Cancel or Save/Update */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                resetForm();        // Clear form
                setIsComposing(false); // Hide form
              }}
              className="px-4 py-2 border border-slate-250 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all shadow-sm shadow-emerald-500/10"
            >
              {editingId ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      )}

      {/* List of all announcements with edit/delete options */}
      <div className="space-y-4">
        {announcements.map((a) => (
          <div
            key={a.announcementId}
            className="border border-slate-100 dark:border-transparent p-4 rounded-2xl shadow-sm bg-slate-50 dark:bg-[#0B0F19]/60 flex justify-between items-start hover:shadow-md hover:scale-[1.01] transition-all duration-200"
          >
            {/* Left side: announcement content */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{a.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{a.description}</p>

              {/* Metadata: time, location, author, type, completed */}
              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-2.5 flex flex-wrap gap-4 font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />{a.time}
                </span>

                {a.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {a.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {a.author}
                </span>
                <span className="capitalize flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                  {a.type}
                </span>

                {a.isCompleted && (
                  <span className="text-emerald-600 dark:text-emerald-500 flex items-center gap-1 font-bold">
                    <CheckCircle className="w-3.5 h-3.5" /> Completed
                  </span>
                )}
              </div>
            </div>

            {/* Right side: edit and delete buttons */}
            <div className="flex gap-1 mt-1 shrink-0">
              <button
                onClick={() => handleEdit(a)}
                className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 transition-colors"
                title="Edit Notice"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(a.announcementId)}
                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition-colors"
                title="Delete Notice"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Export the component so it can be imported elsewhere (e.g. AdminDashboard)
export default AnnouncementAdmin;

