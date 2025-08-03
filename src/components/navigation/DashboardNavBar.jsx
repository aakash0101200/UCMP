// components/navigation/DashboardNavBar.jsx
import React, { useState } from 'react';
import { Search, Bell, Settings, User } from 'lucide-react';
import { ModeToggle } from '../Theme/ModeToggle';
import { SidebarTrigger } from '../../components/ui/sidebar';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Link } from 'react-router-dom';



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
import logo from '../../assets/logo.png';


export default function DashboardNavBar({
  userRole = 'student',
  userName = 'User',
  userEmail = 'user@example.com',
  notificationCount = 0,
  onLogout
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState('false');

  const getRoleTitle = (role) => {
    const titles = {
      student: 'Student Portal',
      faculty: 'Faculty Dashboard',
      admin: 'Admin Console'
    };
    return titles[role] || 'Dashboard';
  };
  //    const toggleSearch = () => setSearchOpen(!searchOpen);

  const handleLogout = () => {
    onLogout?.();
  };

  return (
    <>
      <header className="sticky top-0 left-0 h-16.25 z-30 flex items-center w-full border-b bg-sidebar  ">
        <div className="container flex h-16 items-center justify-between px-3">

          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Sidebar Trigger */}
            <SidebarTrigger className="md:hidden" />

            {/* Logo & Branding - Hidden on mobile when sidebar trigger is shown */}
            <div className="flex items-center gap-3">

              <Link to="/">
                <img src={logo} alt="UCMP Logo" className="h-8 w-8 shrink-0 hover:opacity-80 transition duration-200 ease-in-out" />
              </Link>

              <div className="hidden sm:flex flex-col leading-tight">

                {/* <h1 className="font-semibold text-lg">UCMP</h1> */}
                <span className="font-semibold">{userName.split(' ')[0]}</span>

                <p className="text-xs text-muted-foreground">
                  {getRoleTitle(userRole)}
                </p>
              </div>
            </div>
          </div>

          {/* Center Section - Search (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
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

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <Badge
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex justify-center "
                      variant="destructive"

                    >
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notificationCount === 0 ? (
                  <DropdownMenuItem className="text-muted-foreground">
                    No new notifications
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem>
                    You have {notificationCount} new notifications
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <ModeToggle />


            {/* User Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={userName} />
                    <AvatarFallback>
                      {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1.5">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userEmail}
                    </p>
                    <Badge variant="outline" className="w-fit text-xs capitalize">
                      {userRole}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600 "
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showMobileSearch && (
          <div className="border-t bg-background px-4 py-3 md:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
                autoFocus
              />
            </div>
          </div>
        )}
      </header>
    </>
  );
}
