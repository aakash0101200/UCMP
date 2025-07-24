// components/navigation/ProfileMenu.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, Settings, HelpCircle, LogOut, 
  GraduationCap, BookOpen, Shield,
  ChevronDown 
} from 'lucide-react';
import { getProfileMenuItems } from '../../utils/navConfig';

export default function ProfileMenu({ user, userRole, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuItems = getProfileMenuItems(userRole);

  const roleIcons = {
    student: GraduationCap,
    faculty: BookOpen,
    admin: Shield
  };

  const RoleIcon = roleIcons[userRole] || User;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rounded-md p-2 text-sm font-medium text-foreground hover:bg-muted focus:bg-muted focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <RoleIcon className="h-4 w-4 text-primary" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-sm font-medium">{user?.name || 'User'}</div>
            <div className="text-xs text-muted-foreground capitalize">{userRole}</div>
          </div>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 z-50 mt-2 w-56 rounded-md border border-border bg-popover p-1 shadow-lg">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-sm font-medium">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            
            <div className="py-1">
              {menuItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2 rounded-sm px-3 py-2 text-sm text-foreground hover:bg-muted focus:bg-muted"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
              
              <button
                onClick={() => {
                  onLogout?.();
                  setIsOpen(false);
                }}
                className="flex w-full items-center space-x-2 rounded-sm px-3 py-2 text-sm text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
