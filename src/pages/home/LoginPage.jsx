import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../Services/auth";
import { toast } from "react-toastify";
import i1 from "../../assets/Scroll/i1.webp";
import { motion, AnimatePresence } from "framer-motion";

const LoginPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    collegeId: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoDrawer, setShowDemoDrawer] = useState(false);
  const navigate = useNavigate();

  const handleAutofill = (roleType) => {
    let collegeId = "";
    let password = "";

    if (roleType === "STUDENT") {
      collegeId = import.meta.env.VITE_DEMO_STUDENT_ID || "DEMO_2025CS001";
      password = import.meta.env.VITE_DEMO_STUDENT_PWD || "Student@123";
    } else if (roleType === "FACULTY") {
      collegeId = import.meta.env.VITE_DEMO_FACULTY_ID || "DEMO_clg00";
      password = import.meta.env.VITE_DEMO_FACULTY_PWD || "Faculty@123";
    } else if (roleType === "ADMIN") {
      collegeId = import.meta.env.VITE_DEMO_ADMIN_ID || "DEMO_ADMIN_001";
      password = import.meta.env.VITE_DEMO_ADMIN_PWD || "Admin@123";
    }

    setFormData({ collegeId, password });
    toast.success(`Autofilled ${roleType.charAt(0) + roleType.slice(1).toLowerCase()} credentials!`);
    setShowDemoDrawer(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && window.innerHeight >= 720) {
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const role = await login(formData.collegeId, formData.password);
      if (role) {
        if (onLogin) onLogin();
        localStorage.setItem("role", role);
        if (role === "STUDENT") navigate("/student");
        else if (role === "FACULTY") navigate("/faculty");
        else if (role === "ADMIN") navigate("/admin");
        else toast.error("Unknown role. Please contact support.");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] lg:overflow-x-hidden flex items-center justify-center bg-login-bg px-4">

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="
        w-full max-w-[410px]
        bg-card/95
        backdrop-blur-xl
        border border-border/50
        rounded-[28px]
        px-6 py-6
        sm:px-8 sm:py-8
        shadow-2xl shadow-black/10
        space-y-5
      "
      >

        {/* Header */}
        <div className="text-center space-y-3
        ">

          {/* Professional Minimal Badge */}
          {/* <div className="flex justify-center">
            <div
              className="
              w-12 h-12 rounded-2xl
              bg-gradient-to-b
              from-white/80 to-neutral-100
              dark:from-neutral-800 dark:to-neutral-900
              border border-border/50
              flex items-center justify-center
              shadow-lg
            "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-5 h-5 text-neutral-700 dark:text-neutral-200"
              >
                <path d="M9 12l2 2 4-4" />
                <path d="M21 12c0 1.66-.67 3.16-1.76 4.24A5.98 5.98 0 0115 18H9a6 6 0 110-12h6a6 6 0 016 6z" />
              </svg>
            </div>
          </div> */}

          {/* Identity */}
          <div className="space-y-2">

            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome back
            </h1>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
              Sign in to continue to your academic workspace.
            </p>
          </div>
        </div>

        {/* Quick Demo Access Accordion */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowDemoDrawer(!showDemoDrawer)}
            className="
              inline-flex items-center gap-1.5
              text-xs text-indigo-500 hover:text-indigo-600
              font-medium
              bg-indigo-50/50 dark:bg-indigo-950/20
              border border-indigo-100 dark:border-indigo-900/30
              px-3 py-1.5 rounded-full
              transition-all
              cursor-pointer
              shadow-sm
            "
          >
            <span> Quick Demo Access</span>
            <svg
              className={`w-3 h-3 transition-transform ${showDemoDrawer ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <AnimatePresence>
            {showDemoDrawer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="mt-3 overflow-hidden bg-muted/40 rounded-xl p-3 border border-border/40 grid grid-cols-3 gap-2"
              >
                <button
                  type="button"
                  onClick={() => handleAutofill("STUDENT")}
                  className="p-2 rounded-lg bg-card border border-border/50 hover:border-indigo-500 text-xs font-semibold text-foreground text-center cursor-pointer transition-all hover:shadow-sm"
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => handleAutofill("FACULTY")}
                  className="p-2 rounded-lg bg-card border border-border/50 hover:border-indigo-500 text-xs font-semibold text-foreground text-center cursor-pointer transition-all hover:shadow-sm"
                >
                  Faculty
                </button>
                <button
                  type="button"
                  onClick={() => handleAutofill("ADMIN")}
                  className="p-2 rounded-lg bg-card border border-border/50 hover:border-indigo-500 text-xs font-semibold text-foreground text-center cursor-pointer transition-all hover:shadow-sm"
                >
                  Admin
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">

          {/* College ID */}
          <div className="space-y-1.5">
            <label
              htmlFor="collegeId"
              className="text-sm font-medium text-foreground"
            >
              College ID
            </label>

            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-login-icon group-focus-within:text-indigo-500 transition-colors duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="w-4 h-4"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>

              <input
                type="text"
                id="collegeId"
                name="collegeId"
                value={formData.collegeId}
                onChange={handleChange}
                placeholder="Enter college ID"
                autoComplete="username"
                required
                className="
                w-full h-12
                rounded-xl
                border border-border/60
                bg-background/60
                pl-10 pr-4
                text-sm
                outline-none
                transition-all
                focus:border-indigo-500
                focus:ring-2 focus:ring-indigo-500/20
              "
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">

            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </label>

              <button
                type="button"
                onClick={() =>
                  toast.info(
                    "Password reset instructions have been sent to your registered email."
                  )
                }
                className="text-xs text-indigo-500 hover:underline"
              >
                Forgot?
              </button>
            </div>

            <div className="relative group">

              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-login-icon group-focus-within:text-indigo-500 transition-colors duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="w-4 h-4"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>

              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                autoComplete="current-password"
                required
                className="
                w-full h-12
                rounded-xl
                border border-border/60
                bg-background/60
                pl-10 pr-10
                text-sm
                outline-none
                transition-all
                focus:border-indigo-500
                focus:ring-2 focus:ring-indigo-500/20
              "
              />

              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="
                absolute inset-y-0 right-0
                pr-3 flex items-center
                text-login-icon
                hover:text-indigo-500
              "
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="w-4 h-4"
                  >
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015-5.94" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="w-4 h-4"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>

            </div>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="
            w-full h-12
            rounded-xl
            bg-indigo-600
            hover:bg-indigo-500
            text-white
            text-sm
            font-semibold
            transition-all
            shadow-lg shadow-indigo-500/20
            disabled:opacity-60
            cursor-pointer
          "
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </motion.button>
        </form>

        {/* Footer */}
        <div className="space-y-4">

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50"></div>
            </div>
          </div>

          <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
            Don't have an account?{" "}
            <span className="text-foreground font-medium">
              Contact your college administration
            </span>{" "}
            to get your credentials.
          </p>

        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
