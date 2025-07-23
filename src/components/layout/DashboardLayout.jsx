// src/components/layout/DashboardLayout.jsx
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';

export default function DashboardLayout({ children, userRole }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        {/* Sidebar for desktop */}
        <AppSidebar userRole={userRole} />

        {/* Main content area */}
        <main className="flex-1">
          {/* Mobile header with sidebar trigger */}
          <div className="lg:hidden flex items-center p-4 border-b">
            <SidebarTrigger className="mr-2 p-2 rounded hover:bg-muted" />
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>

          {/* Page content */}
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
