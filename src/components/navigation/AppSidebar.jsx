// //in use     ~

// // components/navigation/AppSidebar.jsx
// import React from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import {
//   Sidebar,
//   SidebarHeader,
//   SidebarContent,
//   SidebarFooter,
//   SidebarGroup,
//   SidebarGroupLabel,
//   SidebarGroupContent,
//   SidebarMenu,
//   SidebarMenuItem,
//   SidebarMenuButton,
//   SidebarTrigger,
//   useSidebar,
//   SidebarSeparator
// } from '../ui/sidebar';

// import {
//   Home,
//   BookOpen,
//   User,
//   GraduationCap,
//   Calendar,
//   Settings,
//   LogOut,
//   BarChart3,
//   Users,
//   Shield,
//   FileText,
//   MessageSquare
// } from 'lucide-react';
// import logo from '../../assets/logo.png';

// // Role-based menu configurations
// const menuConfigs = {
//   student: [
//     { title: 'Dashboard', to: '/student', icon: BarChart3 },
//     { title: 'My Courses', to: '/student/courses', icon: BookOpen },
//     { title: 'Grades', to: '/student/grades', icon: FileText },
//     { title: 'Schedule', to: '/student/schedule', icon: Calendar },
//     { title: 'Messages', to: '/student/messages', icon: MessageSquare },
//     { title: 'Attendance', to: '/student/attendance', icon: User},
//   ],
//   faculty: [
//     { title: 'Dashboard', to: '/faculty', icon: BarChart3 },
//     { title: 'My Courses', to: '/faculty/courses', icon: BookOpen },
//     { title: 'Students', to: '/faculty/students', icon: GraduationCap },
//     { title: 'Grade Book', to: '/faculty/gradebook', icon: FileText },
//     { title: 'Schedule', to: '/faculty/schedule', icon: Calendar },
//   ],
//   admin: [
//     { title: 'Dashboard', to: '/admin', icon: BarChart3 },
//     { title: 'Users', to: '/admin/users', icon: Users },
//     { title: 'Courses', to: '/admin/courses', icon: BookOpen },
//     { title: 'Reports', to: '/admin/reports', icon: FileText },
//     { title: 'System', to: '/admin/system', icon: Shield },
//   ]
// };

// export function AppSidebar({ userRole = 'student', userName = 'User' }) {
//   const location = useLocation();
//   const { state } = useSidebar();
//   const isCollapsed = state === 'collapsed';
//   const menuItems = menuConfigs[userRole] || menuConfigs.student;

//   const getRoleTitle = (role) => {
//     const titles = {
//       student: 'Student Dashboard',
//       faculty: 'Faculty Dashboard', 
//       admin: 'Admin Console'
//     };
//     return titles[role] || 'Portal';
//   };

//   const handleLogout = () => {

//     // Add your logout logic here

//     console.log('Logout clicked');
//   };

//   return (
//     <Sidebar variant="inset" collapsible="icon" className= "flex m-0 p-0">
//       {/* Header Section */}
//       <SidebarHeader>
//         <div className="relative flex items-center gap-2 px-4 py-3 h-16">
//           {/* <img src={logo} alt="UCMP Logo" className="h-8 w-8 shrink-0" /> */}
//           {!isCollapsed && (
//             <div className="flex-1 min-w-0">
//               <div className="font-semibold text-md text-center text-sidebar-foreground"> {getRoleTitle(userRole)} </div>
              
//             </div>
//           )}
//           <SidebarTrigger className="absolute right-4 top-1/2 -translate-y-1/2" />
//         </div>
//       </SidebarHeader>

//       <SidebarSeparator />

//       {/* Main Navigation */}
//       <SidebarContent className="flex-1 overflow-y-auto">
//         <SidebarGroup>
//           <SidebarGroupLabel>Navigation</SidebarGroupLabel>
//           <SidebarGroupContent>
//             <SidebarMenu>
//               {menuItems.map(({ title, to, icon: Icon }) => {
//                 const isActive = location.pathname === to || 
//                   (to !== '/student' && to !== '/faculty' && to !== '/admin' && location.pathname.startsWith(to));
                
//                 return (
//                   <SidebarMenuItem key={to}>
//                     <SidebarMenuButton
//                       asChild
//                       // className="justify-center"
//                       isActive={isActive}
//                       tooltip={isCollapsed ? title : undefined}
//                     >
                      
//                       <Link to={to}>
//                         <Icon className="h-4 w-4" />
//                         <span>{title}</span>
//                       </Link>
//                     </SidebarMenuButton>
//                   </SidebarMenuItem>
//                 );
//               })}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>

//         <SidebarSeparator />

//         {/* Account Section */}
//         <SidebarGroup>
//           <SidebarGroupLabel>Account</SidebarGroupLabel>
//           <SidebarGroupContent>
//             <SidebarMenu>
//               <SidebarMenuItem>
//                 <SidebarMenuButton
//                   asChild
//                   tooltip={isCollapsed ? "Settings" : undefined}
//                 >
//                   <Link to="/settings" className='flex items-center gap-2 px-2 py-1'>
//                     <Settings className="h-4 w-4" />
//                     <span>Settings</span>
//                   </Link>
//                 </SidebarMenuButton>
//               </SidebarMenuItem>
//               <SidebarMenuItem>

//                 <SidebarMenuButton
//                   tooltip={isCollapsed ? "Logout" : undefined}
//                   onClick={handleLogout}
//                   className='flex items-center gap-2 px-2 py-1'
//                 >
//                   <LogOut className="h-4 w-4" />
//                   <span>Logout</span>
//                 </SidebarMenuButton>
//               </SidebarMenuItem>
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
//       </SidebarContent>

//       {/* Footer with User Info */}
//       <SidebarFooter>
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <SidebarMenuButton
//               asChild
//               tooltip={isCollapsed ? userName : undefined}
//             >
//               <div className="flex items-center gap-2 px-2 py-1">
//                 <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium shrink-0 grow-0">
//                   {userName.charAt(0).toUpperCase()}
//                 </div>
//                 {!isCollapsed && (
//                   <div className="flex-1 min-w-0">
//                     <div className="font-medium  text-sm truncate">{userName}</div>
//                     <div className="text-xs text-sidebar-foreground/70 capitalize">
//                       {userRole}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </SidebarMenuButton>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarFooter>
//     </Sidebar>
//   );
// }






// // // AppSidebar.jsx - Role-based collapsible sidebar component

// // import React from 'react';
// // import { Link, useLocation } from 'react-router-dom';

// // // Sidebar UI components
// // import {
// //   Sidebar,
// //   SidebarHeader,
// //   SidebarContent,
// //   SidebarFooter,
// //   SidebarGroup,
// //   SidebarGroupLabel,
// //   SidebarGroupContent,
// //   SidebarMenu,
// //   SidebarMenuItem,
// //   SidebarMenuButton,
// //   SidebarTrigger,
// //   useSidebar,
// //   SidebarSeparator
// // } from '../ui/sidebar';

// // // Icon imports from lucide-react
// // import {
// //   Home,
// //   BookOpen,
// //   User,
// //   GraduationCap,
// //   Calendar,
// //   Settings,
// //   LogOut,
// //   BarChart3,
// //   Users,
// //   Shield,
// //   FileText,
// //   MessageSquare
// // } from 'lucide-react';

// // import logo from '../../assets/logo.png'; // Logo import (optional)

// // // Menu configuration for different user roles
// // const menuConfigs = {
// //   student: [
// //     { title: 'Dashboard', to: '/student', icon: BarChart3 },
// //     { title: 'My Courses', to: '/student/courses', icon: BookOpen },
// //     { title: 'Grades', to: '/student/grades', icon: FileText },
// //     { title: 'Schedule', to: '/student/schedule', icon: Calendar },
// //     { title: 'Messages', to: '/student/messages', icon: MessageSquare },
// //     { title: 'Attendance', to: '/student/attendance', icon: User },
// //   ],
// //   faculty: [
// //     { title: 'Dashboard', to: '/faculty', icon: BarChart3 },
// //     { title: 'My Courses', to: '/faculty/courses', icon: BookOpen },
// //     { title: 'Students', to: '/faculty/students', icon: GraduationCap },
// //     { title: 'Grade Book', to: '/faculty/gradebook', icon: FileText },
// //     { title: 'Schedule', to: '/faculty/schedule', icon: Calendar },
// //   ],
// //   admin: [
// //     { title: 'Dashboard', to: '/admin', icon: BarChart3 },
// //     { title: 'Users', to: '/admin/users', icon: Users },
// //     { title: 'Courses', to: '/admin/courses', icon: BookOpen },
// //     { title: 'Reports', to: '/admin/reports', icon: FileText },
// //     { title: 'System', to: '/admin/system', icon: Shield },
// //   ]
// // };

// // export function AppSidebar({ userRole = 'student', userName = 'User' }) {
// //   const location = useLocation();                      // Get current path to highlight active menu
// //   const { state } = useSidebar();                      // Sidebar state (expanded/collapsed)
// //   const isCollapsed = state === 'collapsed';           // Check if collapsed
// //   const menuItems = menuConfigs[userRole] || menuConfigs.student;  // Get role-specific menu

// //   // Display title based on role
// //   const getRoleTitle = (role) => {
// //     const titles = {
// //       student: 'Student Dashboard',
// //       faculty: 'Faculty Dashboard',
// //       admin: 'Admin Console'
// //     };
// //     return titles[role] || 'Portal';
// //   };

// //   // Placeholder for logout logic
// //   const handleLogout = () => {
// //     console.log('Logout clicked');
// //     // Implement logout function here
// //   };

// //   return (
// //     <Sidebar variant="inset" collapsible="icon" className="flex m-0 p-0">
// //       {/* ---------- Sidebar Header ---------- */}
// //       <SidebarHeader>
// //         <div className="relative flex items-center gap-2 px-4 py-3 h-16">
// //           {/* Optional logo */}
// //           {/* <img src={logo} alt="UCMP Logo" className="h-8 w-8 shrink-0" /> */}
          
// //           {/* Dashboard Title - shown only when expanded */}
// //           {!isCollapsed && (
// //             <div className="flex-1 min-w-0">
// //               <div className="font-semibold text-md text-center text-sidebar-foreground">
// //                 {getRoleTitle(userRole)}
// //               </div>
// //             </div>
// //           )}

// //           {/* Toggle Button - always visible */}
// //           <SidebarTrigger className="absolute right-4 top-1/2 -translate-y-1/2" />
// //         </div>
// //       </SidebarHeader>

// //       <SidebarSeparator />

// //       {/* ---------- Main Navigation Section ---------- */}
// //       <SidebarContent className="flex-1 overflow-y-auto">
// //         <SidebarGroup>
// //           <SidebarGroupLabel>Navigation</SidebarGroupLabel>
// //           <SidebarGroupContent>
// //             <SidebarMenu>
// //               {/* Loop through menu items for current role */}
// //               {menuItems.map(({ title, to, icon: Icon }) => {
// //                 // Check if current path is active
// //                 const isActive =
// //                   location.pathname === to ||
// //                   (to !== '/student' && to !== '/faculty' && to !== '/admin' &&
// //                     location.pathname.startsWith(to));

// //                 return (
// //                   <SidebarMenuItem key={to}>
// //                     <SidebarMenuButton
// //                       asChild
// //                       isActive={isActive}
// //                       tooltip={isCollapsed ? title : undefined} // Tooltip only when collapsed
// //                     >
// //                        {/* className={
// //       isActive
// //         ? 'bg-black text-white dark:bg-white dark:text-black rounded-md'
// //         : 'hover:bg-muted'
// //     } */}
// //                       <Link to={to}>
// //                         <Icon className="h-4 w-4" />
// //                         <span>{title}</span>
// //                       </Link>
// //                     </SidebarMenuButton>
// //                   </SidebarMenuItem>
// //                 );
// //               })}
// //             </SidebarMenu>
// //           </SidebarGroupContent>
// //         </SidebarGroup>

// //         <SidebarSeparator />

// //         {/* ---------- Account Section ---------- */}
// //         <SidebarGroup>
// //           <SidebarGroupLabel>Account</SidebarGroupLabel>
// //           <SidebarGroupContent>
// //             <SidebarMenu>
// //               {/* Settings Button */}
// //               <SidebarMenuItem>
// //                 <SidebarMenuButton
// //                   asChild
// //                   tooltip={isCollapsed ? "Settings" : undefined}
// //                 >
// //                   <Link to="/settings" className="flex items-center gap-2 px-2 py-1">
// //                     <Settings className="h-4 w-4" />
// //                     <span>Settings</span>
// //                   </Link>
// //                 </SidebarMenuButton>
// //               </SidebarMenuItem>

// //               {/* Logout Button */}
// //               <SidebarMenuItem>
// //                 <SidebarMenuButton
// //                   tooltip={isCollapsed ? "Logout" : undefined}
// //                   onClick={handleLogout}
// //                   className="flex items-center gap-2 px-2 py-1"
// //                 >
// //                   <LogOut className="h-4 w-4" />
// //                   <span>Logout</span>
// //                 </SidebarMenuButton>
// //               </SidebarMenuItem>
// //             </SidebarMenu>
// //           </SidebarGroupContent>
// //         </SidebarGroup>
// //       </SidebarContent>

// //       {/* ---------- Footer User Info ---------- */}
// //       <SidebarFooter>
// //         <SidebarMenu>
// //           <SidebarMenuItem>
// //             <SidebarMenuButton
// //               asChild
// //               tooltip={isCollapsed ? userName : undefined}
// //             >
// //               <div className="flex items-center gap-2 px-2 py-1">
// //                 {/* Circle Avatar with Initial */}
// //                 <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium shrink-0 grow-0">
// //                   {userName.charAt(0).toUpperCase()}
// //                 </div>

// //                 {/* Name and Role - shown only when expanded */}
// //                 {!isCollapsed && (
// //                   <div className="flex-1 min-w-0">
// //                     <div className="font-medium text-sm truncate">{userName}</div>
// //                     <div className="text-xs text-sidebar-foreground/70 capitalize">
// //                       {userRole}
// //                     </div>
// //                   </div>
// //                 )}
// //               </div>
// //             </SidebarMenuButton>
// //           </SidebarMenuItem>
// //         </SidebarMenu>
// //       </SidebarFooter>
// //     </Sidebar>
// //   );
// // }

// components/navigation/AppSidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
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
  useSidebar,
  SidebarSeparator
} from '../ui/sidebar';

import {
  Home,
  BookOpen,
  User,
  GraduationCap,
  Calendar,
  Settings,
  LogOut,
  BarChart3,
  Users,
  Shield,
  FileText,
  MessageSquare
} from 'lucide-react';
import logo from '../../assets/logo.png';



// Role-based menu configurations
const menuConfigs = {
  student: [
    { title: 'Dashboard', to: '/student', icon: BarChart3 },
    { title: 'My Courses', to: '/student/courses', icon: BookOpen },
    { title: 'Assignment', to: '/student/assignment', icon: FileText },
    { title: 'Schedule', to: '/student/schedule', icon: Calendar },
    { title: 'Updates', to: '/student/updates', icon: MessageSquare },
    { title: 'Attendance', to: '/student/attendance', icon: User},
  ],
  faculty: [
    { title: 'Dashboard', to: '/faculty', icon: BarChart3 },
    { title: 'My Courses', to: '/faculty/courses', icon: BookOpen },
    { title: 'Students', to: '/faculty/students', icon: GraduationCap },
    { title: 'Grade Book', to: '/faculty/gradebook', icon: FileText },
    { title: 'Schedule', to: '/faculty/schedule', icon: Calendar },
  ],
  admin: [
    { title: 'Dashboard', to: '/admin', icon: BarChart3 },
    { title: 'Users', to: '/admin/users', icon: Users },
    { title: 'Courses', to: '/admin/courses', icon: BookOpen },
    { title: 'Reports', to: '/admin/reports', icon: FileText },
    { title: 'System', to: '/admin/system', icon: Shield },
  ]
};

export function AppSidebar({ userRole = 'student', userName = 'User' }) {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const menuItems = menuConfigs[userRole] || menuConfigs.student;

  const getRoleTitle = (role) => {
    const titles = {
      student: 'Student Dashboard',
      faculty: 'Faculty Dashboard', 
      admin: 'Admin Console'
    };
    return titles[role] || 'Portal';
  };

  const handleLogout = () => {

    // Add your logout logic here

    console.log('Logout clicked');
  };

  return (
    <Sidebar variant="inset" collapsible="icon" className= "flex m-0 p-0 ">

      {/* Header Section */}
      <SidebarHeader>
        <div className="relative flex items-center gap-2 px-4 py-3 h-16">
          {/* <img src={logo} alt="UCMP Logo" className="h-8 w-8 shrink-0" /> */}
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-md text-center text-sidebar-foreground"> 
                {getRoleTitle(userRole)} </div>
            </div>
          )}
          
         {/* Fix: Wrap SidebarTrigger in a flex container for proper vertical alignment */}

          <SidebarTrigger className="absolute right-4 top-1/2 -translate-y-1/2" />
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      {/* Main Navigation */}
      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(({ title, to, icon: Icon }) => {
                const isActive = location.pathname === to || 
                  (to !== '/student' && to !== '/faculty' && to !== '/admin' && location.pathname.startsWith(to));
                
                return (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton
                      asChild
                      // className="justify-center"
                      isActive={isActive}
                      tooltip={isCollapsed ? title : undefined}
                    >
                      
                      <Link to={to}>
                        <Icon className="h-4 w-4" />
                        <span>{title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Account Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={isCollapsed ? "Settings" : undefined}
                >
                  <Link to="/settings" className='flex items-center gap-2 px-2 py-1'>
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>

                <SidebarMenuButton
                  tooltip={isCollapsed ? "Logout" : undefined}
                  onClick={handleLogout}
                  className='flex items-center gap-2 px-2 py-1'
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with User Info */}
      <SidebarFooter className="sticky bottom-0 z-30 py-1.5 bg-muted">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={isCollapsed ? userName : undefined}
              className ="hover:bg-muted/70 px-2 py-1.5 rounded-md w-full"
            >
              <div className="flex items-center gap-2 w-full">

                <div className="flex overflow-hidden rounded-full select-none bg-gray-500/30 h-6 w-6 shrink-0">

                  <div className="flex h-full w-full items-center justify-center bg-blue-600 text-white">

                    <div className="text-xs font-semibold">

                  {userName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                </div>
                </div>
                

                {!isCollapsed && (
                  <div className="min-w-0">
                    <div className="font-medium  text-sm truncate">{userName}</div>
                    <div className="text-xs text-muted-foreground/70 capitalize">
                      {userRole}
                    </div>
                  </div>
                )}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}