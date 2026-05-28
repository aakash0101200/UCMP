// components/navigation/DashboardNavBar.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from "react-router-dom";

import { Search, Bell, Settings, User, ChevronDown, LogOut, Megaphone, Calendar, AlertTriangle, MessageSquare, Info } from 'lucide-react';
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


const formatNotificationTime = (timeStr) => {
  if (!timeStr) return '';
  try {
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return timeStr;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (e) {
    return timeStr;
  }
};

export default function DashboardNavBar({
  notifications = [],
  onMarkRead,
  onMarkAllRead,
  profile, onLogout, onRoleSwitch
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState('false');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'priority' | 'messages'

  const allRoles = getAllRoles();
  const activeRole = getActiveRole();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'priority') {
      return n.type === 'TIMETABLE' || 
             n.type === 'SCHEDULE_OVERRIDE' || 
             n.type === 'SCHEDULE' || 
             (n.title && (n.title.toLowerCase().includes('urgent') || n.title.toLowerCase().includes('important')));
    }
    if (activeTab === 'messages') {
      return n.type === 'ANNOUNCEMENT' || n.type === 'PERSONAL' || n.type === 'MESSAGE' || n.type === 'PRIORITY_MESSAGE' || n.type === 'REPLY' || !n.type;
    }
    return true; // 'all'
  });

  const getNotificationIcon = (n) => {
    const type = n.type || '';
    if (type === 'TIMETABLE') {
      return <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />;
    }
    if (type === 'SCHEDULE_OVERRIDE' || type === 'SCHEDULE') {
      return <Calendar className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />;
    }
    if (type === 'ANNOUNCEMENT') {
      return <Megaphone className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />;
    }
    if (type === 'MESSAGE' || type === 'REPLY') {
      return <MessageSquare className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />;
    }
    if (type === 'PRIORITY_MESSAGE') {
      return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />;
    }
    return <Info className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />;
  };

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
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex justify-center animate-bounce" variant="destructive">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 sm:w-96 p-2 rounded-2xl border border-border bg-popover text-popover-foreground shadow-xl">
                <div className="flex items-center justify-between px-3 py-2 border-b border-border/60">
                  <span className="font-semibold text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAllRead && onMarkAllRead();
                      }}
                      className="text-xs text-indigo-500 hover:text-indigo-400 font-medium transition-colors cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {/* Tabs Selector */}
                <div className="flex border-b border-border/40 px-2 py-1 bg-muted/20 dark:bg-zinc-950/20">
                  {['all', 'priority', 'messages'].map((tab) => {
                    const count = notifications.filter(n => {
                      if (tab === 'priority') {
                        return n.type === 'TIMETABLE' || n.type === 'SCHEDULE_OVERRIDE' || n.type === 'SCHEDULE' || (n.title && (n.title.toLowerCase().includes('urgent') || n.title.toLowerCase().includes('important')));
                      }
                      if (tab === 'messages') {
                        return n.type === 'ANNOUNCEMENT' || n.type === 'PERSONAL' || n.type === 'MESSAGE' || n.type === 'PRIORITY_MESSAGE' || n.type === 'REPLY' || !n.type;
                      }
                      return true;
                    }).filter(n => !n.isRead).length;

                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTab(tab);
                        }}
                        className={`flex-1 py-1.5 text-center text-xs font-bold transition-all relative border-b-2 rounded-t-lg capitalize cursor-pointer ${
                          activeTab === tab
                            ? 'border-indigo-600 text-indigo-600 dark:text-[#6366F1] dark:border-[#6366F1] bg-indigo-50/50 dark:bg-indigo-500/5'
                            : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/40'
                        }`}
                      >
                        {tab}
                        {count > 0 && (
                          <span className="ml-1 px-1.5 py-0.2 bg-indigo-500 text-white text-[9px] rounded-full font-bold">
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="max-h-[300px] overflow-y-auto mt-1 space-y-1">
                  {filteredNotifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
                      <Info className="h-6 w-6 text-muted-foreground/45" />
                      <span>No {activeTab !== 'all' ? activeTab : ''} notifications found</span>
                    </div>
                  ) : (
                    filteredNotifications.map((n) => {
                      const id = n.id || n.announcementId;
                      return (
                        <div
                          key={id}
                          onClick={(e) => {
                            if (!n.isRead && onMarkRead) {
                              onMarkRead(id);
                            }
                          }}
                          className={`flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer text-left select-none relative ${
                            !n.isRead 
                              ? 'bg-indigo-500/5 dark:bg-indigo-500/10 border-l-2 border-indigo-500 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20' 
                              : 'hover:bg-accent/60 border-l-2 border-transparent'
                          }`}
                        >
                          {getNotificationIcon(n)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-xs font-semibold truncate ${!n.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {n.title}
                              </span>
                              <span className="text-[10px] text-muted-foreground shrink-0">
                                {formatNotificationTime(n.time)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {n.description}
                            </p>
                            {n.author && (
                              <span className="text-[9px] text-neutral-400/80 mt-1 block italic">
                                — {n.author}
                              </span>
                            )}
                          </div>
                          {!n.isRead && (
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0 animate-pulse" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
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
