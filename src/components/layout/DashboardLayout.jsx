// components/layout/DashboardLayout.jsx
import React from 'react';
import { SidebarProvider, SidebarInset } from '../ui/sidebar';
import { AppSidebar } from '../navigation/AppSidebar';
import DashboardNavBar from '../navigation/DashboardNavBar';

import { useState, useEffect } from 'react';
import axios from 'axios';



export default function DashboardLayout({
  children, collegeId, onLogout}) {
  const [user, setUser] = useState({
    name:'user',
    email:'user@example.com',
    role: 'student',
    
    profilePictureUrl:''
  });

  useEffect(() => {
    if(!collegeId) return;
    const fetchProfile = async()=>{
      try{
        const response = await fetch(`/api/profile?collegeId=${collegeId}`);
        if(!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setUser({
          name: data.name,
          email: data.email,
          role: data.role,
          profilePictureUrl: data.profilePictureUrl || ''
        });
      } catch (err) {
        console.error('Error Fetching profile:', err);
      }
    };
    fetchProfile();
  }, [collegeId]);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        {/* Sidebar */}
        <AppSidebar
          userRole={user.role}
          userName={user.name}
          
        />

        {/* Main Content Area */}
        <SidebarInset className="flex-1">
          {/* Dashboard Navbar */}
          <DashboardNavBar
            userRole={user.role}
            userName={user.name}
            userEmail={user.email}
            notificationCount={3}
            onLogout={onLogout}
          />

          {/* Page Content */}

          <main className="flex-1 space-y-4 p-6 
               bg-sidebar/70">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
