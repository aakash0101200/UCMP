import React, { useState } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Calendar,
  MapPin,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const AnnouncementAdmin = ({ announcements, onAnnouncementsChange }) => {
  const [isComposing, setIsComposing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    time: "",
    location: "",
    author: "",
    type: "update",
    isCompleted: false,
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      time: "",
      location: "",
      author: "",
      type: "update",
      isCompleted: false,
    });
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    const newAnnouncement = {
      id: editingId || Date.now(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      time: formData.time || new Date().toLocaleString(),
      location: formData.location.trim() || undefined,
      author: formData.author.trim() || "Admin",
      type: formData.type,
      isCompleted: formData.isCompleted,
    };

    if (editingId) {
      const updated = announcements.map((ann) =>
        ann.id === editingId ? newAnnouncement : ann
      );
      onAnnouncementsChange(updated);
    } else {
      onAnnouncementsChange([newAnnouncement, ...announcements]);
    }

    resetForm();
    setIsComposing(false);
  };

  const handleEdit = (announcement) => {
    setEditingId(announcement.id);
    setIsComposing(true);
    setFormData({
      title: announcement.title,
      description: announcement.description,
      time: announcement.time,
      location: announcement.location || "",
      author: announcement.author || "",
      type: announcement.type,
      isCompleted: announcement.isCompleted || false,
    });
  };

  const handleDelete = (id) => {
    const filtered = announcements.filter((a) => a.id !== id);
    onAnnouncementsChange(filtered);
  };

  return (
    <>
      <div className="border p-4 rounded-xl shadow-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Manage Announcements</h2>
          <button
            onClick={() => {
              resetForm();
              setIsComposing(!isComposing);
            }}
            className="flex items-center gap-1 text-sm text-blue-600"
          >
            <Plus size={16} />
            {isComposing ? "Cancel" : "New"}
          </button>
        </div>

        {isComposing && (
          <form onSubmit={handleSubmit} className="space-y-3 mb-6">
            <input
              className="w-full border p-2 rounded"
              placeholder="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
            <textarea
              className="w-full border p-2 rounded"
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <input
              className="w-full border p-2 rounded"
              placeholder="Time (optional)"
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
            />
            <input
              className="w-full border p-2 rounded"
              placeholder="Location (optional)"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
            <input
              className="w-full border p-2 rounded"
              placeholder="Author (optional)"
              value={formData.author}
              onChange={(e) =>
                setFormData({ ...formData, author: e.target.value })
              }
            />
            <select
              className="w-full border p-2 rounded"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
            >
              <option value="update">Update</option>
              <option value="event">Event</option>
              <option value="deadline">Deadline</option>
              <option value="alert">Alert</option>
            </select>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isCompleted}
                onChange={(e) =>
                  setFormData({ ...formData, isCompleted: e.target.checked })
                }
              />
              <label>Mark as Completed</label>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {editingId ? "Update" : "Add"}
            </button>
          </form>
        )}

        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="p-4 border rounded-lg bg-gray-50 flex flex-col gap-2"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 font-semibold text-lg">
                  {announcement.type === "event" && <Calendar size={18} />}
                  {announcement.type === "deadline" && <Clock size={18} />}
                  {announcement.type === "alert" && <AlertCircle size={18} />}
                  {announcement.type === "update" && <CheckCircle size={18} />}
                  {announcement.title}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(announcement)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-700">
                {announcement.description}
              </p>
              {announcement.location && (
                <div className="flex items-center text-sm text-gray-500 gap-1">
                  <MapPin size={14} /> {announcement.location}
                </div>
              )}
              <div className="flex items-center text-xs text-gray-500 gap-2">
                <User size={12} /> {announcement.author} • {announcement.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AnnouncementAdmin;
