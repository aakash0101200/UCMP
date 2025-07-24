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



    try{
       
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
    } catch (error){
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

    try{
      await API.delete(`/${id}`);
      const filtered = announcements.filter((a) => a.announcementId !== id); // Remove selected announcement
      onAnnouncementsChange(filtered); // Update list
    } catch (error){
      console.error('Error in deleting announcement:', error);
     alert("Delete failed. Try again!..");
    }
  };

  return (
    <div className="space-y-6">
      {/* Title and Add button section */}

      <div className="flex justify-between items-center">
         <h2 className="text-xl font-semibold">Manage Announcements</h2>
            <button onClick={() => {
               resetForm();        // Clear any existing form data
               setIsComposing(true); // Show the form 
               }} 
              className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 flex items-center gap-1"
           >
            <Plus className="w-4 h-4" /> Add {/* "+" icon and text */}
            </button>
      </div>



      {/* Show the form only when isComposing is true */}
      {isComposing && (
        <form
          onSubmit={handleSubmit}
          className="p-4 bg-gray-70 rounded border space-y-4 shadow"
        >
          {/* Grid layout for input fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Title"
              className="border p-2 rounded"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Author"
              className="border p-2 rounded"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            />
            <input
              type="text"
              placeholder="Time (optional)"
              className="border p-2 rounded"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
            <input
              type="text"
              placeholder="Location"
              className="border p-2 rounded"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          {/* Text area for longer description */}
          <textarea
            placeholder="Description"
            className="w-full border p-2 rounded"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />

          {/* Dropdown and checkbox section */}
          <div className="flex items-center gap-4">


            {/* Dropdown for announcement type */}    {/** need updation + */}
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="border p-2 rounded"
            >
              <option value="event">Event</option>
              <option value="deadline">Deadline</option>
              <option value="update">Update</option>
              <option value="alert">Alert</option>
            </select>

            {/* Checkbox for completion status */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isCompleted}
                onChange={(e) =>
                  setFormData({ ...formData, isCompleted: e.target.checked })
                }
              />
              Completed {/** closed */}
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
              className="px-3 py-1 border border-gray-400 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {editingId ? 'Update' : 'Save'} {/* Show "Update" if editing */}
            </button>
          </div>
        </form>
      )}


      {/* List of all announcements with edit/delete options */}
      <div className="space-y-4">
        {announcements.map((a) => (
          <div
            key={a.announcementId}
            className="border p-4 rounded shadow-sm bg-white dark:bg-neutral-950 flex justify-between items-start"
          >
            {/* Left side: announcement content */}
            <div>
              <h3 className="text-lg font-semibold">{a.title}</h3>
              <p className="text-sm text-gray-600">{a.description}</p>

              {/* Metadata: time, location, author, type, completed */}
              <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-3">
                <span>
                  <Clock className="inline w-4 h-4 mr-1" />{a.time}
                </span>
                
                {a.location && (
                  <span>
                    <MapPin className="inline w-4 h-4 mr-1" />
                    {a.location}
                  </span>
                )}
                <span>
                  <User className="inline w-4 h-4 mr-1" />
                  {a.author}
                </span>
                <span className="capitalize">
                  <AlertCircle className="inline w-4 h-4 mr-1" />
                  {a.type}
                </span>
                
                
                {a.isCompleted && (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Completed
                  </span>
                )}
              </div>
            </div>

            {/* Right side: edit and delete buttons */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleEdit(a)} // Populate form with this item's data
                className="p-1 text-blue-600 hover:text-blue-800"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(a.announcementId)} // Remove this announcement
                className="p-1 text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
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

