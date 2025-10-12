import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '../ui/sidebar';
import { AppSidebar } from '../navigation/AppSidebar';
import DashboardNavBar from '../navigation/DashboardNavBar';
import { getProfile } from "../../Services/profile.js";
import { getActiveRole, setActiveRole } from "../../Services/auth.js";
import { toast } from 'react-toastify';

export default function DashboardLayout({children, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [activeRole, setActiveRoleState] = useState(getActiveRole());
  
  // This useEffect fetches the full profile when the component mounts or the active role changes.
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const collegeId = localStorage.getItem('collegeId');
        if (!collegeId) {
          throw new Error("College ID not found in local storage.");
        }
        const response = await getProfile(collegeId);
        setProfile(response.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        onLogout();
      }
    };
    
    if (activeRole) {
      fetchUserProfile();
    } else {
      navigate('/login');
    }
  }, [activeRole, navigate, onLogout]);

  // This useEffect ensures the user is on the correct dashboard route for their active role.
  useEffect(() => {
    if (activeRole) {
      const pathRole = location.pathname.split('/')[1];
      if (pathRole && pathRole !== activeRole.toLowerCase()) {
        navigate(`/${activeRole.toLowerCase()}`);
        toast.info(`Redirecting to ${activeRole.toLowerCase()} dashboard.`);
      }
    }
  }, [activeRole, location.pathname, navigate]);

  // Handler for role switching, which updates both local state and persistent storage.
  const handleRoleSwitch = (newRole) => {
    setActiveRole(newRole);
    setActiveRoleState(newRole);
  };

  // Do not render the content until the profile is loaded to prevent errors.
  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading user profile...</p>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar
          userName={profile.name}
          userRole={activeRole}
        />

        <SidebarInset className="flex-1">
          <DashboardNavBar 
            profile={profile}
            onLogout={onLogout}
            onRoleSwitch={handleRoleSwitch}
            notificationCount={3}
          />

          <main className="flex-1 space-y-4 p-6 bg-sidebar/70">
            {children}
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}