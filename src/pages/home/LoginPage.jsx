import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../Services/auth";
import { toast } from "react-toastify";
import i1 from "../../assets/Scroll/i1.webp";

const LoginPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    collegeId: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
    <div className="min-h-screen flex bg-login-bg">
      {/* ── LEFT PANEL: Branding + Illustration ── */}
      <div className="hidden lg:flex flex-col w-[52%] relative overflow-hidden bg-login-panel">
        {/* Subtle geometric accent */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-login-accent opacity-10 -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-login-accent opacity-5 translate-y-1/3 -translate-x-1/4" />

        {/* Branding */}
        <div className="relative z-10 p-10" style={{ paddingTop: '13px', paddingBottom: '0px' }}>
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="w-9 h-9 rounded-lg bg-login-accent flex items-center justify-center shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
                aria-hidden="true"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-login-panel-fg">
              UCMP
            </span>
          </div>
        </div>

        {/* Illustration */}
        <div className="relative z-10 flex flex-1 items-center justify-center px-16 pb-20" style={{ marginTop: '-147px', marginBottom: '63px', paddingTop: '75px', paddingBottom: '97px', paddingLeft: '40px' }}>
          <img
            src={i1}
            alt="Campus management portal illustration"
            className="w-full max-w-md object-contain drop-shadow-lg"
          />
        </div>

        {/* Tagline */}
        <div className="relative z-10 px-10" style={{ marginTop: '-281px', marginBottom: '-114px', paddingTop: '-140px', paddingBottom: '-22px' }}>
          <p className="text-2xl font-bold text-login-panel-fg text-balance" style={{ lineHeight: '1.3em', paddingTop: '1px', paddingBottom: '-0', marginTop: '-17px', marginBottom: '38px' }}>
            Your campus,
            <br />
            all in one place.
          </p>
          <p className="mt-2 text-sm text-login-panel-muted leading-relaxed">
            Manage academics, attendance, schedules and more — seamlessly.
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL: Login Form ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-0 sm:px-12 lg:px-16" style={{ marginTop: '-60px', marginBottom: '0px', paddingTop: '113px' }}>
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-login-accent flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
              aria-hidden="true"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <span className="text-base font-bold tracking-tight text-login-fg">
            UCMP
          </span>
        </div>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-login-fg tracking-tight">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-login-muted leading-relaxed">
              Sign in to your campus portal account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* College ID */}
            <div className="space-y-1.5">
              <label
                htmlFor="collegeId"
                className="block text-sm font-medium text-login-fg"
              >
                College ID
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-login-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                    aria-hidden="true"
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
                  required
                  autoComplete="username"
                  placeholder="e.g. CSE2024001"
                  className="login-input"
                  style={{ paddingLeft: '41px' }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-login-fg"
                >
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-login-accent hover:text-login-accent-hover font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-login-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                    aria-hidden="true"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="login-input pr-10"
                  style={{ paddingLeft: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-login-icon hover:text-login-accent transition-colors"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                      aria-hidden="true"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                      aria-hidden="true"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-login-accent text-white text-sm font-semibold transition-all duration-200 hover:bg-login-accent-hover active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-sm mt-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4 shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-login-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs text-login-muted bg-login-bg">
                New to UCMP?
              </span>
            </div>
          </div>

          {/* Register link */}
          <Link
            to="/register"
            className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg border border-login-border text-sm font-medium text-login-fg hover:bg-login-input transition-colors duration-200"
          >
            Create an account
          </Link>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-login-muted leading-relaxed">
            By signing in you agree to our{" "}
            <span className="text-login-accent hover:underline cursor-pointer">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="text-login-accent hover:underline cursor-pointer">
              Privacy Policy
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
