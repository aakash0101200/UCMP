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
export default function AssignmentPublisher({ classname ,compact = false }) {
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
      <div className={` p-6 bg-white border border-gray-100 shadow-lg dark:bg-gray-800 rounded-2xl dark:border-gray-700 `}>
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
    <div className="p-6 w-full bg-white dark:bg-[#161B26] border border-slate-100 dark:border-transparent rounded-[2rem] shadow-sm text-slate-900 dark:text-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {isCreating ? "Create Assignment" : "Assignment Publisher"}
          </h3>
        </div>
        {isCreating && (
          <button
            onClick={() => setIsCreating(false)}
            className="p-1.5 text-slate-400 rounded-lg hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isCreating ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title & Subject */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                Assignment Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="bg-slate-50 dark:bg-[#0B0F19]/40 border border-slate-200 dark:border-slate-800/60 rounded-xl py-2 px-3 text-xs w-full text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="Enter assignment title"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                Subject *
              </label>
              <select
                required
                value={formData.subject}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subject: e.target.value }))
                }
                className="bg-slate-50 dark:bg-[#0B0F19]/40 border border-slate-200 dark:border-slate-800/60 rounded-xl py-2 px-3 text-xs w-full text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
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
            <label className="block mb-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
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
              rows={3}
              className="w-full bg-slate-50 dark:bg-[#0B0F19]/40 border border-slate-200 dark:border-slate-800/60 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              placeholder="Describe the assignment"
            />
          </div>

          {/* Due Date & Priority */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                Due Date *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
                }
                className="bg-slate-50 dark:bg-[#0B0F19]/40 border border-slate-200 dark:border-slate-800/60 rounded-xl py-2 px-3 text-xs w-full text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
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
                className="bg-slate-50 dark:bg-[#0B0F19]/40 border border-slate-200 dark:border-slate-800/60 rounded-xl py-2 px-3 text-xs w-full text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block mb-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              Attachments
            </label>
            <div
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                isDragging
                  ? "border-indigo-500 bg-indigo-500/5"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B0F19]/10"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-6 h-6 mx-auto mb-2 text-slate-400" />
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Drag & drop or click to upload</p>
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
                className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-all inline-block"
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
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#0B0F19]/40 border border-slate-100 dark:border-transparent text-xs"
                  >
                    <span className="font-medium text-slate-700 dark:text-slate-300">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-1 rounded hover:bg-rose-500/10 text-rose-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex pt-4 gap-3">
            <button
              type="submit"
              className="flex items-center justify-center flex-1 px-4 py-2 gap-2 text-white bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-500/10"
            >
              <Send className="w-4 h-4" />
              <span>Publish</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center justify-center w-full px-6 py-4 gap-2 text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-sm font-bold rounded-2xl transition-all shadow-sm hover:scale-[1.01] active:scale-95 duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Assignment</span>
          </button>

          {/* Recent Assignments List */}
          <div>
            <h4 className="mb-3 text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider">Recent Assignments</h4>
            <div className="space-y-3">
              {recentAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-3.5 border border-slate-150 dark:border-transparent rounded-2xl bg-slate-50 dark:bg-[#0B0F19]/40 hover:shadow-md hover:scale-[1.01] transition-all duration-200"
                >
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{assignment.title}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {assignment.subject}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-semibold">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>
                        Due:{" "}
                        {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-indigo-500">
                      {assignment.submissions}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">submissions</div>
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
