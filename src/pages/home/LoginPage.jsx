import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../Services/auth"; // adjust path if needed
import { toast } from "react-toastify";
import i1 from "../../assets/Scroll/i1.webp"; // New image import

const LoginPage = ({ onLogin }) => {
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
        // Notify App.jsx that user is now authenticated
        if (onLogin) onLogin();

        localStorage.setItem("role", role);
        if (role === "STUDENT") {
          navigate("/student");
        } else if (role === "FACULTY") {
          navigate("/faculty");
        } else if (role === "ADMIN") {
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
    <div className="relative flex items-center justify-center min-h-screen w-full transition-colors duration-500 not-dark:from-white not-dark:via-gray-100 not-dark:to-white dark:from-black dark:via-gray-900 dark:to-black">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 animate-gradient not-dark:bg-[radial-gradient(circle_at_50%_50%,#c0eaff,#ffffff,#e0f7ff)] dark:bg-[radial-gradient(circle_at_50%_50%,#1e3a8a,#0f172a,#000)]"></div>

      {/* Container: responsive layout */}
      <div className="relative z-10 flex flex-col md:flex-row items-center w-full max-w-7xl min-h-[70vh] md:min-h-[80vh] lg:min-h-[70vh] mx-auto rounded-3xl overflow-visible shadow-xl">

        {/* LEFT IMAGE: hidden on mobile, background on small screens */}
        <div className="hidden sm:flex flex-1 items-center justify-center h-full p-4 md:p-6">
          <img
            src={i1}
            alt="Illustration"
            className="rounded-2xl shadow-lg object-contain max-h-[60vh] w-full"
          />
        </div>

        {/* RIGHT LOGIN FORM */}
        <div className="flex flex-1 items-center justify-center h-full px-4 sm:px-6 md:px-12 lg:px-20">
          <div className="w-full max-w-md p-6 sm:p-8 md:p-10 rounded-2xl backdrop-blur-xl border border-cyan-500/40 shadow-[0_0_30px_rgba(0,255,255,0.4)] animate-float group transition-transform duration-500 hover:scale-105 hover:shadow-cyan-400/60 max-h-[90%] overflow-auto relative bg-white/70 dark:bg-black/40">

            {/* Heading */}
            <h2 className="mb-6 text-3xl sm:text-4xl md:text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 animate-glitch">
              LOGIN
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* College ID */}
              <div>
                <label className="block text-sm sm:text-base font-medium not-dark:text-cyan-700 dark:text-cyan-200">
                  College ID
                </label>
                <input
                  type="text"
                  name="collegeId"
                  id="collegeId"
                  value={formData.collegeId}
                  onChange={handleChange}
                  required
                  placeholder="Enter your ID"
                  className="w-full px-3 py-2 sm:py-3 mt-1 rounded-lg not-dark:bg-white/70 dark:bg-black/40 not-dark:text-black dark:text-white not-dark:placeholder-gray-500 dark:placeholder-gray-400 border border-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:animate-pulse transition"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm sm:text-base font-medium not-dark:text-cyan-700 dark:text-cyan-200">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  className="w-full px-3 py-2 sm:py-3 mt-1 rounded-lg not-dark:bg-white/70 dark:bg-black/40 not-dark:text-black dark:text-white not-dark:placeholder-gray-500 dark:placeholder-gray-400 border border-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:animate-pulse transition"
                />
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                className="relative w-full py-2 sm:py-3 font-semibold text-white rounded-lg overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg transition-all duration-300 hover:shadow-cyan-400/80"
              >
                <span className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>
                <span className="relative z-10">Login</span>
              </button>

              {/* Register Link */}
              <p className="mt-4 text-sm sm:text-base text-center not-dark:text-cyan-700 dark:text-cyan-200">
                Don't have an account?{" "}
                <Link to="/register" className="not-dark:text-cyan-600 dark:text-cyan-400 hover:underline">
                  Register here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
      
      {/* Mobile Background Illustration */}
      <img
        src={i1}
        alt="Background Illustration"
        className="sm:hidden absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 opacity-20 pointer-events-none"
      />
    </div>
  );
};

export default LoginPage;