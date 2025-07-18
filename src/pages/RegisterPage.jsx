import React, { useState } from "react";
import { toast } from "react-toastify"; // For success and error popups
import 'react-toastify/dist/ReactToastify.css';

import { useNavigate, Link } from "react-router-dom";
import { register } from "../Services/auth"; // Use the existing register() function from auth.js

export default function RegisterPage() {
  const navigate = useNavigate(); // Hook to redirect users

  // Initial form state
  const [formData, setFormData] = useState({
    name: '',
    collegeId: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT', // Default selected role
  });

  // Handle input changes and update formData state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form reload

    // Simple client-side validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      // Prepare data with role in uppercase
      const dataToSend = {
        ...formData,
        role: formData.role.toUpperCase(),
      };

      // Send data to backend via auth.js function
      const response = await register(dataToSend);

      // Show success toast and navigate to login
      toast.success("Registration successful! 🎉");
      setTimeout(() => navigate("/login"), 1500);

    } catch (error) {
      // Handle API errors
      if (error.response?.data?.message) {
        toast.error(`Registration failed: ${error.response.data.message}`);
      } else {
        toast.error("Something went wrong during registration.");
      }
      console.error("Registration error:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-8 text-black bg-white shadow-md rounded-4xl"
      >
        {/* Heading */}
        <h2 className="mb-6 text-2xl font-bold text-center text-blue-900">Register</h2>

        {/* Name Input */}
        <label className="block mb-2 text-sm font-medium text-black">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Enter your name"
          className="w-full px-3 py-2 mb-4 bg-gray-200 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* College ID Input */}
        <label className="block mb-2 text-sm font-medium text-black">College ID</label>
        <input
          type="text"
          name="collegeId"
          value={formData.collegeId}
          onChange={handleChange}
          required
          placeholder="Enter your college ID"
          className="w-full px-3 py-2 mb-4 bg-gray-200 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Email Input */}
        <label className="block mb-2 text-sm font-medium text-black">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="Enter your email"
          className="w-full px-3 py-2 mb-4 bg-gray-200 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Password Input */}
        <label className="block mb-2 text-sm font-medium text-black">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="Enter your password"
          className="w-full px-3 py-2 mb-4 bg-gray-200 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Confirm Password Input */}
        <label className="block mb-2 text-sm font-medium text-black">Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          placeholder="Confirm your password"
          className="w-full px-3 py-2 mb-4 bg-gray-200 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Role Dropdown */}
        <label className="block mb-2 text-sm font-medium text-black">Role</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-3 py-2 mb-6 bg-gray-200 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="STUDENT">Student</option>
          <option value="FACULTY">Teacher</option>
          <option value="ADMIN">Admin</option>
        </select>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-2 text-white transition bg-blue-600 rounded hover:bg-blue-700"
        >
          Register
        </button>

        {/* Navigation to Login */}
        <p className="mt-4 text-sm text-center text-black">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}
