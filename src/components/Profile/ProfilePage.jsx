import React, { useState, useRef } from "react";
import { Camera } from "lucide-react";

const sampleStudent = {
  collegeId: "C2024001",
  name: "Amit Sharma",
  branch: "Computer Science",
  email: null,
  phone: "9876543210",
  address: null,
  gender: "Male",
  profileImage: null,
};

const ProfilePage = () => {
  const [student, setStudent] = useState(sampleStudent);
  const [isEditMode, setEditMode] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // --- Handlers ---
  const handleChange = (e) =>
    setStudent({ ...student, [e.target.name]: e.target.value });

  const handleSave = () => setEditMode(false);

  const handleCancel = () => {
    setStudent(sampleStudent);
    setImagePreview(null);
    setEditMode(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setStudent({ ...student, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const displayValue = (val, placeholder = "Not Provided") =>
    val ?? placeholder;

  const renderField = (label, name, isEditable, placeholder = "") => (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
        {label}
      </label>
      <input
        name={name}
        type="text"
        value={displayValue(student[name], "")}
        disabled={!isEditMode || !isEditable}
        onChange={handleChange}
        placeholder={placeholder}
        className={`px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-neutral-700
          ${!isEditMode || !isEditable
            ? "bg-gray-100 text-gray-600 cursor-not-allowed dark:bg-neutral-800 dark:text-gray-400"
            : "bg-white text-gray-900 dark:bg-neutral-700 dark:text-gray-100"
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500`}
      />
      {!student[name] && !isEditMode && (
        <span className="text-xs text-red-500 mt-1">
          {placeholder + " * " || "Not Provided"}
        </span>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-neutral-900 px-3 sm:px-4 py-6">
      <div className="w-full max-w-5xl bg-white dark:bg-neutral-800 rounded-lg shadow-lg overflow-hidden 
                      flex flex-col md:flex-row">
        
        {/* --- Left Sidebar (Profile Image + Basic Info) --- */}
        <div className="w-full md:w-1/3 bg-gray-50 dark:bg-neutral-900 border-b md:border-b-0 md:border-r 
                        border-gray-200 dark:border-neutral-700 flex flex-col items-center py-8 px-6">
          <div className="relative">
            <img
              src={
                imagePreview ||
                student.profileImage ||
                "https://via.placeholder.com/150"
              }
              alt="Profile"
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border border-gray-300 
                         dark:border-neutral-700 shadow-sm"
            />

            {isEditMode && (
              <button
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full shadow-md 
                           hover:bg-blue-700 transition"
              >
                <Camera size={16} />
              </button>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />

          <h2 className="mt-4 text-lg font-semibold text-gray-800 dark:text-gray-100 text-center">
            {student.name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            {student.branch}
          </p>
        </div>

        {/* --- Right Content (Details Form) --- */}
        <div className="flex-1 p-6 sm:p-8">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 
                         border-b border-gray-200 dark:border-neutral-700 pb-3 mb-6">
            Student Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {renderField("College ID", "collegeId", false)}
            {renderField("Name", "name", true)}
            {renderField("Branch", "branch", true)}
            {renderField("Email", "email", true, "Enter Email")}
            {renderField("Phone", "phone", true, "Enter Phone")}
            {renderField("Address", "address", true, "Enter Address")}
            {renderField("Gender", "gender", true, "Enter Gender")}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0 mt-8">
            {!isEditMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium 
                           hover:bg-blue-700 transition"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-green-600 text-white rounded-md text-sm font-medium 
                             hover:bg-green-700 transition"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-300 text-gray-800 dark:bg-neutral-700 dark:text-gray-200 
                             rounded-md text-sm font-medium hover:bg-gray-400 dark:hover:bg-neutral-600 transition"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
