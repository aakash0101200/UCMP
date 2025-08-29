import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../Services/auth"; // adjust path if needed
import { toast } from "react-toastify";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    collegeId: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const role = await login(formData.collegeId, formData.password);

      if (role) {
        // Redirect based on role returned from backend
        if (role === "student") {
          navigate("/student");
        } else if (role === "faculty") {
          navigate("/faculty");
        } else if (role === "admin") {
          navigate("/admin");
        } else {
          toast.error("Unknown role. Please contact support.");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Something went wrong. Try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Login to Dashboard
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* College ID */}
          <div>
            <label
              htmlFor="collegeId"
              className="block text-sm font-medium text-gray-700"
            >
              College ID
            </label>
            <input
              type="text"
              name="collegeId"
              id="collegeId"
              value={formData.collegeId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 px-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;