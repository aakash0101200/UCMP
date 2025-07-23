// ──────────────────────────────────────────────────────────
//  App.jsx – root of the SPA
// ──────────────────────────────────────────────────────────
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { ThemeProvider } from './components/Theme/theme-provider';
import LandingNavBar     from './components/layout/LandingNavBar';
import DashboardNavBar   from './components/layout/DashboardNavBar';
import {AppSidebar}        from './components/layout/AppSidebar'; // sidebar


import Home              from './pages/Home';
import About             from './pages/About';
import ContactPage       from './pages/ContactPage';

import LoginPage         from './pages/LoginPage';
import RegisterPage      from './pages/RegisterPage';
import StudentDashboard  from './pages/StudentDashboard';
import FacultyDashboard  from './pages/FacultyDashboard';
import AdminDashboard    from './pages/AdminDashboard';



import { useLocation } from "react-router-dom";

import 'react-toastify/dist/ReactToastify.css';


// Layout component that chooses which navbar and sidebar to show
function Layout({ children }) {
  const { pathname } = useLocation();
  const isDashboard = pathname.startsWith('/student') ||
                      pathname.startsWith('/faculty') ||
                      pathname.startsWith('/admin');
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <>
      {isDashboard ? (
        <>
          <DashboardNavBar onSidebarToggle={() => setSidebarOpen(v => !v)} />
          <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </>
      ) : (
        <LandingNavBar />
      )}
      {/* Only put the main wrapper **here** */}
      <main className="min-h-screen bg-background text-foreground">
        {children}
      </main>
    </>
  );
}


// ──────────────────────────────────────────────────────────
//  Root component
// ──────────────────────────────────────────────────────────
export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/"         element={<Home />} />
            <Route path="/about"    element={<About />} />
            <Route path="/contact"  element={<ContactPage />} />
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/student/*" element={<StudentDashboard />} />
            <Route path="/faculty/*" element={<FacultyDashboard />} />
            <Route path="/admin/*"   element={<AdminDashboard />} />
            {/* Add more as needed */}
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}
/*──────────────────────────── Developer Guide ────────────────────────────
1.  Providers
    • ThemeProvider — toggles dark / light / system modes. Stores choice in
      localStorage (key = 'vite-ui-theme').
    • BrowserRouter — keeps UI in sync with URL via History API.
    • ToastContainer — global toast engine (react-toastify).

2.  Shell
    • NavBar — top navigation bar (logo, links, theme toggle, etc.).
      Rendered once; never unmounts during route changes.

3.  Main Content
    • <main> receives theme variables via Tailwind CSS custom properties:
        bg-background   — dynamic background colour
        text-foreground — dynamic text colour
    • min-h-screen ensures full-viewport height even on short pages.

4.  Routes
    /              → <Home>             – landing page
    /login         → <LoginPage>        – authentication
    /register      → <RegisterPage>     – sign-up form
    /student       → <StudentDashboard> – student portal
    /admin         → <AdminDashboard>   – admin console

5.  Styling
    Tailwind classes prefixed by `bg-` or `text-` reference CSS variables
    declared in your global theme file (see theme-provider.css).

6.  Extending
    • To add a new page, import the component and append a <Route>.
    • To conditionally hide a route (e.g. role-based auth), wrap Routes in
      <RequireAuth role="admin"> … </RequireAuth>.

7.  Performance
    NavBar is outside <Routes>, so it doesn’t re-render on every page swap
    unless its own props/state change.

────────────────────────────────────────────────────────────────────────────*/
