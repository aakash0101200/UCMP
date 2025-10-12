// components/navigation/DashboardNavBar.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from "react-router-dom";

import { Search, Bell, Settings, User, ChevronDown, LogOut } from 'lucide-react';
import { ModeToggle } from '../Theme/ModeToggle';
import { SidebarTrigger } from '../../components/ui/sidebar';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import blogo from '../../assets/logo/bluelogo.png';
import {logout, getAllRoles, getActiveRole, setActiveRole } from "../../Services/auth";


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';

import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import logo from '../../assets/logo/bluelogo.png';


export default function DashboardNavBar({
  // userRole = 'student',
  // userName = 'User',
  // userEmail = 'user@example.com',
  notificationCount = 0,
  profile, onLogout, onRoleSwitch
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState('false');

  const allRoles = getAllRoles();
  const activeRole = getActiveRole();

  const getRoleTitle = (role) => {
    const titles = {
      student: 'Student Portal',
      faculty: 'Faculty Dashboard',
      admin: 'Admin Console'
    };
    return titles[role] || 'Dashboard';
  };

  const navigate = useNavigate();
  

  const handleRoleSwitch = (newRole) => {
    setActiveRole(newRole); // Update active role in localStorage
    onRoleSwitch(newRole); // Notify parent component of the change
  };

  //    const toggleSearch = () => setSearchOpen(!searchOpen);

  const handleLogout = () => {
    logout();
    onLogout();
    navigate("/login");
  };
  if (!profile || !activeRole) {
    return null; 
  }
const userName = typeof profile.name === 'string'
  ? profile.name.split(' ')[0]
  : 'User';


  return (
    <>
      <header className="sticky top-0 left-0 z-30 w-full border-b bg-sidebar h-16 flex items-center">
        <div className="flex w-full items-center justify-between px-4 gap-4">

          {/* Left Section: Logo + Branding */}
          <div className="flex items-center gap-4 min-w-max">
            <SidebarTrigger className="md:hidden" />

            <Link to="/" className="flex items-center">
              <img
                src={blogo}
                alt="Logo"
                className="h-10 w-auto transition duration-300 dark:invert dark:brightness-0"
              />
            </Link>

            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-semibold text-sm">{userName}</span>
              <p className="text-xs text-muted-foreground">{getRoleTitle(activeRole)}</p>
            </div>
          </div>

          {/* Center Section: Search */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
          </div>

          {/* Right Section: Icons + Profile */}
          <div className="flex items-center gap-3 min-w-max">

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex justify-center" variant="destructive">
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notificationCount === 0 ? (
                  <DropdownMenuItem className="text-muted-foreground">No new notifications</DropdownMenuItem>
                ) : (
                  <DropdownMenuItem>You have {notificationCount} new notifications</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <div className="hidden sm:block">
              <ModeToggle />
            </div>

            {/* Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile.profilePictureUrl || ''} alt={profile.name} />
                    <AvatarFallback>
                      {profile.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline-block font-medium capitalize">{activeRole.toLowerCase()}</span>
                  <ChevronDown className="h-4 w-4 hidden md:inline-block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1.5">
                    <p className="text-sm font-medium leading-none">{profile.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{profile.email}</p>
                    <Badge variant="outline" className="w-fit text-xs capitalize">{activeRole.toLowerCase()}</Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allRoles.length > 1 && (
                  <>
                    <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
                    {allRoles.map((role) => (
                      <DropdownMenuItem
                        key={role}
                        onClick={() => handleRoleSwitch(role)}
                        className={`cursor-pointer capitalize ${activeRole.toLowerCase() === role.toLowerCase() ? "font-bold text-blue-600" : ""}`}
                      >
                        {role.toLowerCase()}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

    </>
  );
}
