import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import DashboardNavBar from './DashboardNavBar';

export default function DashboardLayout({ children, userRole }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar userRole={userRole} />
        <div className="flex-1 flex flex-col">
          <DashboardNavBar />
          <div className="flex-1 p-4 lg:p-6">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
}
