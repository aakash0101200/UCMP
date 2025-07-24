// utils/navConfig.js
import { 
  User, Settings, HelpCircle, BookOpen, 
  Users, BarChart3, Calendar, FileText,
  GraduationCap, Award, MessageSquare
} from 'lucide-react';

export const getProfileMenuItems = (userRole) => {
  const commonItems = [
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
    { to: '/help', label: 'Help', icon: HelpCircle }
  ];

  const roleSpecificItems = {
    student: [
      { to: '/student/grades', label: 'My Grades', icon: Award },
      { to: '/student/courses', label: 'My Courses', icon: BookOpen },
      { to: '/student/schedule', label: 'Schedule', icon: Calendar }
    ],
    faculty: [
      { to: '/faculty/courses', label: 'My Courses', icon: BookOpen },
      { to: '/faculty/students', label: 'Students', icon: Users },
      { to: '/faculty/grades', label: 'Grade Book', icon: FileText }
    ],
    admin: [
      { to: '/admin/dashboard', label: 'Analytics', icon: BarChart3 },
      { to: '/admin/users', label: 'User Management', icon: Users },
      { to: '/admin/system', label: 'System Settings', icon: Settings }
    ]
  };

  return [...(roleSpecificItems[userRole] || []), ...commonItems];
};

export const getSidebarItems = (userRole) => {
  const sidebarConfigs = {
    student: [
      { to: '/student', label: 'Dashboard', icon: BarChart3 },
      { to: '/student/courses', label: 'My Courses', icon: BookOpen },
      { to: '/student/grades', label: 'Grades', icon: Award },
      { to: '/student/schedule', label: 'Schedule', icon: Calendar },
      { to: '/student/messages', label: 'Messages', icon: MessageSquare }
    ],
    faculty: [
      { to: '/faculty', label: 'Dashboard', icon: BarChart3 },
      { to: '/faculty/courses', label: 'Courses', icon: BookOpen },
      { to: '/faculty/students', label: 'Students', icon: GraduationCap },
      { to: '/faculty/gradebook', label: 'Grade Book', icon: FileText },
      { to: '/faculty/schedule', label: 'Schedule', icon: Calendar }
    ],
    admin: [
      { to: '/admin', label: 'Dashboard', icon: BarChart3 },
      { to: '/admin/users', label: 'Users', icon: Users },
      { to: '/admin/courses', label: 'Courses', icon: BookOpen },
      { to: '/admin/reports', label: 'Reports', icon: FileText },
      { to: '/admin/settings', label: 'Settings', icon: Settings }
    ]
  };

  return sidebarConfigs[userRole] || sidebarConfigs.student;
};
