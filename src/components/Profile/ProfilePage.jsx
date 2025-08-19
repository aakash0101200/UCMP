import React, { useState } from 'react';

const sampleStudent = {
  collegeId: 'C2024001',
  name: 'Amit Sharma',
  branch: 'Computer Science',
  email: null,
  phone: '9876543210',
  address: null,
  gender: 'Male'
};

const ProfilePage = () => {
  const [student, setStudent] = useState(sampleStudent);
  const [isEditMode, setEditMode] = useState(false);

  const handleChange = (e) => {
    setStudent({
      ...student,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    setEditMode(false);
  };

  const handleCancel = () => {
    setStudent(sampleStudent);
    setEditMode(false);
  };

  const displayValue = (val, placeholder = 'Not Provided') => val ?? placeholder;

  // Field rendering helper
  const renderField = (label, name, isEditable, placeholder = '', width = 'w-full') => (
    <div className="mb-4 flex flex-col">
      <label className="mb-1 text-gray-700 dark:text-gray-100 font-semibold">{label}:</label>
      <input
        name={name}
        type="text"
        value={displayValue(student[name], '')}
        disabled={!isEditMode || !isEditable}
        onChange={handleChange}
        placeholder={placeholder}
        className={`px-3 py-2 border rounded ${width} focus:outline-none focus:ring-2 focus:ring-blue-400 ${!isEditMode || !isEditable ? 'bg-gray-200  dark:bg-neutral-900 cursor-not-allowed' : 'dark:bg-neutral-800'}`}
      />
      {/* Show placeholder for not provided only in view mode */}
      {(!student[name] && !isEditMode) && (
        <span className="text-sm ml-2 text-red-500">{ placeholder + " * " || 'Not Provided'}</span>
      )}
    </div>
  );

  return (
    <div className="max-w-lg mx-auto bg-white  shadow-md rounded-lg p-8 mt-12 dark:bg-neutral-900">
      <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Student Profile</h2>

      {renderField("College ID", "collegeId", false)}
      {renderField("Name", "name", true)}
      {renderField("Branch", "branch", true)}
      {renderField("Email", "email", true, "Enter Email")}
      {renderField("Phone", "phone", true, "Enter Phone")}
      {renderField("Address", "address", true, "Enter Address")}
      {renderField("Gender", "gender", true, "Enter Gender")}

      {!isEditMode ? (
        <button
          onClick={() => setEditMode(true)}
          className="w-full mt-6 py-2 px-4 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
        >
          Edit Profile
        </button>
      ) : (
        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 py-2 px-4 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 py-2 px-4 bg-gray-300 text-gray-800 font-semibold rounded hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
