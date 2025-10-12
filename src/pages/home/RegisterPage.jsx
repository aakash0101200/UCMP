import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../../Services/auth";

export default function RegisterPage() {
  const navigate = useNavigate();

  // Default role so backend never gets null/empty
  const [formData, setFormData] = useState({
    name: "",
    collegeId: "",
    email: "",
    password: "",
    confirmPassword: "",
    roles: ["STUDENT"], // matches RoleName enum
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, multiple, options } = e.target;

    if (name === "roles") {
      if (multiple) {
        // Multi-select: collect all selected values
        const selectedValues = Array.from(options)
          .filter((opt) => opt.selected)
          .map((opt) => opt.value);
        setFormData((prev) => ({ ...prev, roles: selectedValues }));
      } else {
        // Single select: wrap value in array
        setFormData((prev) => ({ ...prev, roles: [value] }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        roles: formData.roles.map((r) => r.toUpperCase()), // ensure uppercase for enum
      };

      await register(dataToSend);
      toast.success("Registration successful! 🎉");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
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
        <h2 className="mb-6 text-2xl font-bold text-center text-blue-900">
          Register
        </h2>

        {/* Name */}
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

        {/* College ID */}
        <label className="block mb-2 text-sm font-medium text-black">
          College ID
        </label>
        <input
          type="text"
          name="collegeId"
          value={formData.collegeId}
          onChange={handleChange}
          required
          placeholder="Enter your college ID"
          className="w-full px-3 py-2 mb-4 bg-gray-200 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Email */}
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

        {/* Password */}
        <label className="block mb-2 text-sm font-medium text-black">
          Password
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="Enter your password"
          className="w-full px-3 py-2 mb-4 bg-gray-200 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Confirm Password */}
        <label className="block mb-2 text-sm font-medium text-black">
          Confirm Password
        </label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          placeholder="Confirm your password"
          className="w-full px-3 py-2 mb-4 bg-gray-200 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Multi-Select Role Dropdown */}
        <label className="block mb-2 text-sm font-medium text-black">
          Roles (Select one or more)
        </label>
        <select
          name="roles"
          value={formData.roles}
          onChange={handleChange}
          multiple
          className="w-full px-3 py-2 mb-6 bg-gray-200 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="STUDENT">Student</option>
          <option value="FACULTY">Teacher</option>
          <option value="ADMIN">Admin</option>
        </select>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-2 text-white transition bg-blue-600 rounded hover:bg-blue-700"
        >
          Register
        </button>

        {/* Navigation */}
        <p className="mt-4 text-sm text-center text-black">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}
