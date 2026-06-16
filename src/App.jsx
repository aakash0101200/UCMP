import React, { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import LandingNavBar from './components/navigation/LandingNavBar';
import DashboardLayout from './components/layout/DashboardLayout';

const SettingsPage = React.lazy(() => import('./components/Profile/SettingsPage'));
const Home = React.lazy(() => import('./pages/home/Home'));
const About = React.lazy(() => import('./pages/home/about'));
const ContactPage = React.lazy(() => import('./pages/home/ContactPage'));
const LoginPage = React.lazy(() => import('./pages/home/LoginPage'));
const NotFoundPage = React.lazy(() => import('./pages/home/NotFoundPage'));

const StudentDashboard = React.lazy(() => import('./pages/student/StudentDashboard'));
const Assignment = React.lazy(() => import('./pages/student/AssignmentPage'));
const Attendance = React.lazy(() => import('./pages/student/AttendancePage'));
const Courses = React.lazy(() => import('./pages/student/MyCoursesPage'));
const Schedule = React.lazy(() => import('./pages/student/SchedulePage'));
const Updates = React.lazy(() => import('./pages/student/UpdatesPage'));

const FacultyDashboard = React.lazy(() => import('./pages/faculty/FacultyDashboard'));
const FacultySchedulePage = React.lazy(() => import('./pages/faculty/FacultySchedulePage'));
const FacultyStudentsPage = React.lazy(() => import('./pages/faculty/FacultyStudentsPage'));
const FacultyCoursesPage = React.lazy(() => import('./pages/faculty/FacultyCoursesPage'));
const FacultyGradebookPage = React.lazy(() => import('./pages/faculty/FacultyGradebookPage'));

const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminTimetablePage = React.lazy(() => import('./pages/admin/AdminTimetablePage'));
const AdminUsersPage = React.lazy(() => import('./pages/admin/AdminUsersPage'));

import 'react-toastify/dist/ReactToastify.css';


// Layout to choose between public vs dashboard shells
function AppShell({ children }) {
  // useLocation must be inside BrowserRouter

  const { pathname } = useLocation();
  const isDashboard =
    pathname.startsWith('/student') ||
    pathname.startsWith('/faculty') ||
    pathname.startsWith('/admin');

  // Enforce Light Mode on all public routes inside AppShell
  React.useEffect(() => {
    const root = window.document.documentElement;
    const originalTheme = localStorage.getItem("vite-ui-theme") || "light";

    const forceLight = () => {
      root.classList.remove("dark");
      root.classList.add("light");
    };

    // Execute immediately and on next tick to safely override parent ThemeProvider
    forceLight();
    const timeoutId = setTimeout(forceLight, 0);

    return () => {
      clearTimeout(timeoutId);
      root.classList.remove("light", "dark");
      if (originalTheme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        root.classList.add(systemTheme);
      } else {
        root.classList.add(originalTheme);
      }
    };
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      {!isDashboard && <LandingNavBar />}
      <main className="flex-grow bg-background text-foreground">
        {children}
      </main>
    </div>
  );
}


export default function App() {
  // Auth state — drives instant UI updates on login/logout
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("token")
  );

  React.useEffect(() => {
    // Fire-and-forget background ping to pre-warm the Render backend
    // to mitigate free-tier cold-start latency when the app loads.
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';
    fetch(`${apiBase}/auth`).catch(() => { /* ignore error, we just want to wake up the server */ });
  }, []);

  const handleLogout = useCallback(() => {
    // Clear all auth data
    localStorage.removeItem("token");
    localStorage.removeItem("collegeId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("allRoles");
    localStorage.removeItem("activeRole");
    setIsAuthenticated(false);
  }, []);

  const handleLogin = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  return (
    <BrowserRouter>
      <React.Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground transition-colors duration-300">
          <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-indigo-600 dark:text-[#6366F1] animate-spin" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse mt-4">
              Opening Academic Launchpad...
            </p>
          </div>
        </div>
      }>
        <Routes>
          {/* Public routes */}

          <Route
            path="/"
            element={
              <AppShell>
                <Home />
              </AppShell>
            }
          />
          <Route
            path="/about"
            element={
              <AppShell>
                <About />
              </AppShell>
            }
          />

          <Route
            path="/contact"
            element={
              <AppShell>
                <ContactPage />
              </AppShell>
            }
          />
          <Route
            path="/login"
            element={
              isAuthenticated
                ? <Navigate to={`/${(localStorage.getItem("activeRole") || "student").toLowerCase()}`} replace />
                : <AppShell><LoginPage onLogin={handleLogin} /></AppShell>
            }
          />
          <Route
            path="/settings"
            element={
              isAuthenticated
                ? <Navigate to={`/${(localStorage.getItem("activeRole") || "student").toLowerCase()}/settings`} replace />
                : <Navigate to="/login" replace />
            }
          />

          {/* ─── STUDENT routes (nested with Outlet) ─────────────────── */}
          <Route path="/student" element={
            isAuthenticated
              ? <DashboardLayout userRole="student" onLogout={handleLogout} />
              : <Navigate to="/login" replace />
          }>
            <Route index element={<StudentDashboard />} />
            <Route path="settings" element={<SettingsPage userRole="student" />} />
            <Route path="assignment" element={<Assignment />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="courses" element={<Courses />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="updates" element={<Updates />} />
          </Route>

          {/* ─── FACULTY routes (nested with Outlet — same pattern as student) ── */}
          <Route path="/faculty" element={
            isAuthenticated
              ? <DashboardLayout userRole="faculty" onLogout={handleLogout} />
              : <Navigate to="/login" replace />
          }>
            <Route index element={<FacultyDashboard />} />
            <Route path="settings" element={<SettingsPage userRole="faculty" />} />
            <Route path="courses" element={<FacultyCoursesPage />} />
            <Route path="students" element={<FacultyStudentsPage />} />
            <Route path="gradebook" element={<FacultyGradebookPage />} />
            <Route path="schedule" element={<FacultySchedulePage />} />
          </Route>

          {/* ─── ADMIN routes ────────────────────────────────────────── */}
          <Route path="/admin" element={
            isAuthenticated
              ? <DashboardLayout userRole="admin" onLogout={handleLogout} />
              : <Navigate to="/login" replace />
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="settings" element={<SettingsPage userRole="admin" />} />
            <Route path="timetable" element={<AdminTimetablePage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="courses" element={<NotFoundPage embedded={true} />} />
            <Route path="reports" element={<NotFoundPage embedded={true} />} />
            <Route path="system" element={<NotFoundPage embedded={true} />} />
          </Route>
          <Route path="*" element={<AppShell><NotFoundPage /></AppShell>} />
        </Routes>
      </React.Suspense>
      <ToastContainer position="top-right" autoClose={3000} />
      <SpeedInsights />
    </BrowserRouter>
  );

}