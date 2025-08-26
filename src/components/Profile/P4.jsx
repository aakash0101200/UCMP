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

export default function P4() {
  return (
    <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-md max-w-xs mx-auto">
      <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
        {sampleStudent.name.charAt(0)}
      </div>
      <div className="flex flex-col">
        <span className="font-semibold">{sampleStudent.name}</span>
        <span className="text-xs text-gray-500">{sampleStudent.branch}</span>
        <span className="text-xs text-gray-400">{sampleStudent.phone}</span>
      </div>
    </div>
  );
}
