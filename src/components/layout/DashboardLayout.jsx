// components/layout/DashboardLayout.jsx
import React from 'react';
import { SidebarProvider, SidebarInset } from '../ui/sidebar';
import { AppSidebar } from '../navigation/AppSidebar';
import DashboardNavBar from '../navigation/DashboardNavBar';

export default function DashboardLayout({
  children,
  userRole = 'student',
  userName = 'User',
  userEmail = 'user@example.com',
  onLogout
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        {/* Sidebar */}
        <AppSidebar
          userRole={userRole}
          userName={userName}
        />

        {/* Main Content Area */}
        <SidebarInset className="flex-1">
          {/* Dashboard Navbar */}
          <DashboardNavBar
            userRole={userRole}
            userName={userName}
            userEmail={userEmail}
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
