import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../Services/auth";
import { toast } from "react-toastify";

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
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">

      {/* subtle ambient background */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[320px] bg-gradient-to-b from-indigo-500/5 to-transparent dark:from-indigo-400/5" />

      <div className="relative flex min-h-screen items-center justify-center px-5 py-8 sm:px-6">

        <div className="mx-auto w-[92%] max-w-[390px] sm:w-full">

          {/* Brand */}
          <div className="mb-8 text-center">
            {/* <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-card shadow-sm">
              <span className="text-sm font-semibold">AA</span>
            </div> */}

            <h1 className="text-3xl font-semibold tracking-tight text-card-foreground">
              Welcome back
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Sign in to access your academic workspace
            </p>
          </div>

          {/* Card */}
          <div className=" rounded-3xl border border-border/60 bg-card/95 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur sm:p-8 dark:shadow-black/20 ">

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* College ID */}
              <div className="space-y-2">
                <label
                  htmlFor="collegeId"
                  className="text-sm font-medium text-muted-foreground"
                >
                  College ID
                </label>

                <input
                  type="text"
                  id="collegeId"
                  name="collegeId"
                  value={formData.collegeId}
                  onChange={handleChange}
                  placeholder="Enter your college ID"
                  required
                  className="
                  h-11 w-full rounded-xl
                  border border-border/80
                  bg-background
                  px-4
                  text-sm
                  outline-none
                  transition-all duration-200
                  placeholder:text-muted-foreground/50
                  focus:border-indigo-500
                  focus:ring-2
                  focus:ring-indigo-500/10
                  "
                />
              </div>

              {/* Password */}
              <div className="space-y-2">

                <label
                  htmlFor="password"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Password
                </label>

                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="h-11 w-full rounded-xl border border-border/80 bg-background px-4 text-sm outline-none transition-all duration-200
                  placeholder:text-muted-foreground/50 focus:border-indigo-500
                  focus:ring-2 focus:ring-indigo-500/10 "
                />
                <div className="flex justify-end pt-1">

                  <button
                    type="button"
                    onClick={() =>
                      toast.info(
                        "Password reset instructions have been sent to your registered email."
                      )
                    }
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Forgot password?
                  </button>

                </div>

              </div>

              {/* CTA */}
              <button
                type="submit"
                className="mt-2 h-11 w-full rounded-xl
                bg-zinc-900 text-sm font-medium text-white
                transition-all duration-200 hover:opacity-95 active:scale-[0.99] dark:bg-zinc-100
                dark:text-zinc-900"
              >
                Sign in
              </button>

            </form>

            {/* footer */}
            <div className="mt-6 border-t border-border/50 pt-5 text-center">

              <p className="text-sm text-muted-foreground">
                Don’t have an account?{" "}
                <Link
                  to="/register"
                  className="
                  font-medium
                  text-foreground
                  transition-opacity
                  hover:opacity-70
                  "
                >
                  Register
                </Link>
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default LoginPage;