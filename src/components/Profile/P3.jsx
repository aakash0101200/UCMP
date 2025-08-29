import React from "react";

const sampleStudent = {
  collegeId: "C2024001",
  name: "Amit Sharma",
  branch: "Computer Science",
  email: null,
  phone: "9876543210",
  address: null,
  gender: "Male",
};

export default function P3() {
  return (
    <div className="max-w-md mx-auto backdrop-blur-lg bg-white/20 dark:bg-gray-800/30 rounded-2xl shadow-lg p-6 border border-white/30">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white flex items-center justify-center font-bold text-lg shadow">
          {sampleStudent.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-lg font-bold">{sampleStudent.name}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{sampleStudent.branch}</p>
        </div>
      </div>
      <div className="mt-4 space-y-1 text-sm text-gray-700 dark:text-gray-300">
        <p>ID: {sampleStudent.collegeId}</p>
        <p>Email: {sampleStudent.email || "Not Provided"}</p>
        <p>Phone: {sampleStudent.phone}</p>
        <p>Gender: {sampleStudent.gender}</p>
      </div>
    </div>
  );
}
