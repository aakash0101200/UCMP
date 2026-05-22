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

  return (
    <>
      {!isDashboard && <LandingNavBar />}
      {/* 3. Ensure main wrapper uses dark: variants */}
      <main className="min-h-screen bg-background text-foreground dark:bg-background dark:text-foreground">
        {children}
      </main>
    </>
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
        </Route>
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
      <SpeedInsights />
    </BrowserRouter>
  );
}

