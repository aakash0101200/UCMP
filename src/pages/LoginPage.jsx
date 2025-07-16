import React from "react";

import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    id: '',
    password: '',
    role: 'student',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login Data:', formData);
    // Add your login logic here!
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200" >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-8 bg-white shadow-md text-black rounded-4xl">

        <h2 className="mb-6 text-2xl text-blue-900 font-bold text-center">Login</h2>

        <label className="block mb-2  text-sm font-medium text-black ">ID</label>
        <input
          type="text"
          name="id"
          value={formData.id}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 mb-4 bg-gray-200 rounded-md placeholder-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your ID"
        />

        <label className="block mb-2 text-sm font-medium text-black ">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 mb-4 bg-gray-200 rounded-md placeholder-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your password"
        />

        <label className="block mb-2 text-sm font-medium text-black ">Role</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-3 py-2 mb-6 bg-gray-200 rounded-md placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option className="" value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>

        <button
          type="submit"
          className="w-full py-2 text-white transition bg-blue-600 rounded hover:bg-blue-700"
        >
          Submit
        </button>

        <p className="mt-4 text-sm text-black text-center">
          Don't have an account?{'  '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
}

