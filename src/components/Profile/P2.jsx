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

export default function P2() {
  return (
    <div className="max-w-sm mx-auto bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md text-center">
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-semibold">
        {sampleStudent.name.charAt(0)}
      </div>
      <h2 className="text-xl font-bold">{sampleStudent.name}</h2>
      <p className="text-gray-500">{sampleStudent.branch}</p>

      <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
        <p><b>ID:</b> {sampleStudent.collegeId}</p>
        <p><b>Email:</b> {sampleStudent.email || "Not Provided"}</p>
        <p><b>Phone:</b> {sampleStudent.phone}</p>
        <p><b>Gender:</b> {sampleStudent.gender}</p>
      </div>
    </div>
  );
}
