import React, { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SpeedInsights } from "@vercel/speed-insights/react"
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import LandingNavBar from './components/navigation/LandingNavBar';
import DashboardLayout from './components/layout/DashboardLayout';

import Home from './pages/home/Home';

import About from './pages/home/about';
import ContactPage from './pages/home/ContactPage';
import LoginPage from './pages/home/LoginPage';
import RegisterPage from './pages/home/RegisterPage';
import NotFoundPage from './pages/home/NotFoundPage';

import StudentDashboard from './pages/student/StudentDashboard';

import Assignment from './pages/student/AssignmentPage';
import Attendance from './pages/student/AttendancePage';
import Courses from './pages/student/MyCoursesPage';
import Schedule from './pages/student/SchedulePage';
import Updates from './pages/student/UpdatesPage';

import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultySchedulePage from './pages/faculty/FacultySchedulePage';
import FacultyStudentsPage from './pages/faculty/FacultyStudentsPage';
import FacultyCoursesPage from './pages/faculty/FacultyCoursesPage';
import FacultyGradebookPage from './pages/faculty/FacultyGradebookPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTimetablePage from './pages/admin/AdminTimetablePage';
import AdminUsersPage from './pages/admin/AdminUsersPage';

import 'react-toastify/dist/ReactToastify.css';
import ProfilePage from './components/Profile/ProfilePage';

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
    const originalTheme = localStorage.getItem("vite-ui-theme") || "system";

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
          path="/register"
          element={
            <AppShell>
              <RegisterPage />
            </AppShell>
          }
        />
        <Route
          path="/settings"
          element={
            isAuthenticated
              ? <DashboardLayout userRole={(localStorage.getItem("activeRole") || "student").toLowerCase()} onLogout={handleLogout}><NotFoundPage embedded={true} /></DashboardLayout>
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
          <Route path="profile" element={<ProfilePage />} />
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
          <Route path="profile" element={<ProfilePage />} />
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
          <Route path="profile" element={<ProfilePage />} />
          <Route path="timetable" element={<AdminTimetablePage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="courses" element={<NotFoundPage embedded={true} />} />
          <Route path="reports" element={<NotFoundPage embedded={true} />} />
          <Route path="system" element={<NotFoundPage embedded={true} />} />
        </Route>
        <Route path="*" element={<AppShell><NotFoundPage /></AppShell>} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
      <SpeedInsights />
    </BrowserRouter>
  );

}