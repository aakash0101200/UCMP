import React, { useState, useRef } from "react";
import { Pencil, Check, X, Camera, Upload } from "lucide-react";

// --- Sample Data (replace with API data) ---
const sampleStudent = {
  collegeId: "C2024001",
  name: "Amit Sharma",
  branch: "Computer Science",
  email: null,
  phone: "9876543210",
  address: null,
  gender: "Male",
};

// --- Reusable Field Renderer ---
const ProfileField = ({ label, name, value, isEditMode, onChange, editable = true, placeholder }) => {
  return (
    <div className="mb-4 flex flex-col">
      <label className="mb-1 text-gray-700 dark:text-gray-200 font-semibold">
        {label}:
      </label>

      <input
        type="text"
        name={name}
        value={value || ""}
        disabled={!isEditMode || !editable}
        placeholder={placeholder || `Enter ${label}`}
        onChange={onChange}
        className={`px-3 py-2 border rounded-lg transition focus:ring-2 focus:ring-blue-400 
          ${!isEditMode || !editable
            ? "bg-gray-200 dark:bg-neutral-900 cursor-not-allowed"
            : "dark:bg-neutral-800"} 
          dark:text-white`}
      />

      {/* Show "Not Provided" warning only in view mode */}
      {!value && !isEditMode && (
        <span className="text-sm text-red-500 ml-1">Not Provided *</span>
      )}
    </div>
  );
};

// --- Main Profile Component ---
export default function P1({ editable = true }) {
  const [student, setStudent] = useState(sampleStudent);
  const [isEditMode, setEditMode] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // --- Handlers ---
  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    console.log("Updated student:", student);
    setEditMode(false);
  };

  const handleCancel = () => {
    setStudent(sampleStudent);
    setEditMode(false);
  };

  const handleImageUpload = (file) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e) => {
    handleImageUpload(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleImageUpload(e.dataTransfer.files[0]);
  };

  return (
    <div className="max-w-lg mx-auto mt-12 bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-8 relative transition">
      {/* --- Header --- */}
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-600 dark:text-blue-400">
        Student Profile
      </h2>

      {/* --- Edit Button --- */}
      {editable && (
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-blue-500 transition"
          onClick={() => setEditMode(!isEditMode)}
        >
          {isEditMode ? <X size={20} /> : <Pencil size={20} />}
        </button>
      )}

      {/* --- Profile Picture --- */}
      <div className="flex justify-center mb-6">
        <div
          className={`relative w-28 h-28 rounded-full overflow-hidden flex items-center justify-center shadow-lg border-2 transition
            ${dragOver ? "border-blue-500 bg-blue-50 dark:bg-gray-700" : "border-transparent bg-gradient-to-r from-blue-500 to-purple-500"}
          `}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white text-3xl font-bold">
              {student.name?.charAt(0)}
            </span>
          )}

          {editable && isEditMode && (
            <>
              <button
                className="absolute bottom-0 right-0 bg-white dark:bg-gray-700 rounded-full p-1 shadow hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                onClick={() => fileInputRef.current.click()}
              >
                <Camera size={16} className="text-gray-600 dark:text-gray-300" />
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                className="hidden"
              />
              {dragOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-sm rounded-full">
                  <Upload size={20} className="mr-1" /> Drop image
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* --- Student Info Fields --- */}
      <ProfileField label="College ID" name="collegeId" value={student.collegeId} isEditMode={isEditMode} onChange={handleChange} editable={false} />
      <ProfileField label="Name" name="name" value={student.name} isEditMode={isEditMode} onChange={handleChange} />
      <ProfileField label="Branch" name="branch" value={student.branch} isEditMode={isEditMode} onChange={handleChange} />
      <ProfileField label="Email" name="email" value={student.email} isEditMode={isEditMode} onChange={handleChange} placeholder="Enter Email" />
      <ProfileField label="Phone" name="phone" value={student.phone} isEditMode={isEditMode} onChange={handleChange} placeholder="Enter Phone" />
      <ProfileField label="Address" name="address" value={student.address} isEditMode={isEditMode} onChange={handleChange} placeholder="Enter Address" />
      <ProfileField label="Gender" name="gender" value={student.gender} isEditMode={isEditMode} onChange={handleChange} placeholder="Enter Gender" />

      {/* --- Action Buttons --- */}
      {isEditMode && (
        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 py-2 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
          >
            <Check size={16} className="inline mr-1" /> Save
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 py-2 px-4 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
