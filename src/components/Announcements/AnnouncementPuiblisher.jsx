import React, { useState } from "react";
import { FileText, Upload, Calendar, Send, Plus, X, Clock } from "lucide-react";

/**
 * AssignmentPublisher Component (JSX Version)
 * --------------------------------------------
 * A self-contained assignment publishing form with:
 * - Create/Cancel form toggle
 * - File uploads (with drag & drop)
 * - Recent assignments preview
 *
 * This version:
 * ✅ Plain JavaScript for easier integration
 * ✅ API hooks ready for future integration
 */
export default function AssignmentPublisher({ compact = false }) {
  // Track whether we are creating a new assignment
  const [isCreating, setIsCreating] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    dueDate: "",
    priority: "medium",
    attachments: [],
  });

  // Drag state for file upload styling
  const [isDragging, setIsDragging] = useState(false);

  // Static list of subjects
  const subjects = [
    "Database Systems",
    "Web Development",
    "AI & ML",
    "Cybersecurity",
    "Data Structures",
  ];

  // Example data - replace with API data later
  const recentAssignments = [
    {
      id: "1",
      title: "Database Design Project",
      subject: "Database Systems",
      dueDate: "2024-01-15",
      submissions: 12,
    },
    {
      id: "2",
      title: "React Component Library",
      subject: "Web Development",
      dueDate: "2024-01-20",
      submissions: 8,
    },
    {
      id: "3",
      title: "ML Algorithm Implementation",
      subject: "AI & ML",
      dueDate: "2024-01-18",
      submissions: 15,
    },
  ];

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // TODO: Replace with API call
    console.log("Publishing assignment:", formData);

    // Reset form
    setFormData({
      title: "",
      description: "",
      subject: "",
      dueDate: "",
      priority: "medium",
      attachments: [],
    });
    setIsCreating(false);

    // Simple feedback
    alert(`"${formData.title}" has been published.`);
  };

  // Handle file uploads
  const handleFileUpload = (files) => {
    if (files) {
      const newFiles = Array.from(files).filter(
        (file) => file.size <= 10 * 1024 * 1024 // 10MB limit
      );
      setFormData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles],
      }));
    }
  };

  // Remove file by index
  const removeFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  // Drag-and-drop events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  // Compact mode (summary only)
  if (compact && !isCreating) {
    return (
      <div className="p-6 bg-white border border-gray-100 shadow-lg dark:bg-gray-800 rounded-2xl dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Assignments
            </h3>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center px-3 py-2 space-x-1 text-sm font-medium text-white transition-all duration-200 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>New</span>
          </button>
        </div>

        <div className="space-y-3">
          {recentAssignments.slice(0, 3).map((assignment) => (
            <div
              key={assignment.id}
              className="flex items-center justify-between p-3 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {assignment.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {assignment.subject}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {assignment.submissions}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  submissions
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Full mode (form + recent list)
  return (
    <div className="p-6 bg-white border border-gray-100 shadow-lg dark:bg-gray-800 rounded-2xl dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isCreating ? "Create Assignment" : "Assignment Publisher"}
          </h3>
        </div>
        {isCreating && (
          <button
            onClick={() => setIsCreating(false)}
            className="p-2 text-gray-400 rounded-lg hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {isCreating ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title & Subject */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium">
                Assignment Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Enter assignment title"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Subject *
              </label>
              <select
                required
                value={formData.subject}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subject: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select subject</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 text-sm font-medium">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={4}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Describe the assignment"
            />
          </div>

          {/* Due Date & Priority */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium">
                Due Date *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    priority: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block mb-2 text-sm font-medium">
              Attachments
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center ${
                isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="mb-2">Drag & drop or click to upload</p>
              <input
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
              />
              <label
                htmlFor="file-upload"
                className="px-3 py-2 border rounded-lg cursor-pointer"
              >
                Browse Files
              </label>
            </div>

            {/* Selected Files List */}
            {formData.attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {formData.attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
                  >
                    <span className="text-sm">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex pt-4 space-x-3">
            <button
              type="submit"
              className="flex items-center justify-center flex-1 px-4 py-2 space-x-2 text-white bg-blue-600 rounded-lg"
            >
              <Send className="w-4 h-4" />
              <span>Publish</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center justify-center w-full px-6 py-4 space-x-2 text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Assignment</span>
          </button>

          {/* Recent Assignments List */}
          <div>
            <h4 className="mb-3 text-sm font-medium">Recent Assignments</h4>
            <div className="space-y-2">
              {recentAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{assignment.title}</div>
                    <div className="text-sm text-gray-600">
                      {assignment.subject}
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>
                        Due:{" "}
                        {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {assignment.submissions}
                    </div>
                    <div className="text-xs text-gray-500">submissions</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
