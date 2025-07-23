

// src/components/layout/AppSidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar
} from '../../components/ui/sidebar';

import { Separator } from '../../components/ui/separator';
import {
  Home,
  BookOpen,
  User,
  GraduationCap,
  Calendar,
  Settings,
  LogOut,
} from 'lucide-react';
import logo from '../../assets/logo.png';

// Define menu items per role
const studentMenu = [
  { title: 'Dashboard', to: '/student/dashboard', Icon: Home },
  { title: 'Courses',   to: '/student/courses',   Icon: BookOpen },
  { title: 'Schedule',  to: '/student/schedule',  Icon: Calendar },
  { title: 'Profile',   to: '/student/profile',   Icon: User },
];

const facultyMenu = [
  { title: 'Dashboard', to: '/faculty/dashboard', Icon: Home },
  { title: 'My Courses', to: '/faculty/courses',  Icon: BookOpen },
  { title: 'Students',   to: '/faculty/students', Icon: GraduationCap },
  { title: 'Schedule',   to: '/faculty/schedule', Icon: Calendar },
];

export function AppSidebar({ userRole }) {
  const location = useLocation();
  const menuItems = userRole === 'faculty' ? facultyMenu : studentMenu;

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-3">
          <img src={logo} alt="UCMP Logo" className="h-8 w-8" />
          <div className="flex-1">
            <div className="font-semibold">UCMP</div>
            <div className="text-xs text-muted-foreground">
              {userRole === 'faculty' ? 'Faculty Portal' : 'Student Portal'}
            </div>
          </div>
          <SidebarTrigger className="p-2 hover:bg-muted rounded">
            ≡
          </SidebarTrigger>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(({ title, to, Icon }) => {
                const isActive = location.pathname === to;
                return (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton
                      asChild
                      className={isActive ? 'bg-primary text-primary-foreground' : ''}
                    >
                      <Link to={to} className="flex items-center gap-2 px-3 py-2 rounded">
                        <Icon className="h-4 w-4" />
                        {title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/settings" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-muted">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button onClick={() => {/* logout logic */}} className="flex items-center gap-2 px-3 py-2 rounded hover:bg-muted">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <div className="flex items-center gap-2 px-3 py-2 rounded hover:bg-muted">
                <User className="h-5 w-5" />
                <div>
                  <div className="font-medium">John Doe</div>
                  <div className="text-xs text-muted-foreground">
                    {userRole === 'faculty' ? 'Professor' : 'Student'}
                  </div>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>

    </SidebarProvider>
    
  );
}
