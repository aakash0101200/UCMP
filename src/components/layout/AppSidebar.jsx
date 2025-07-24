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

const studentMenu = [
  { title: 'Dashboard', to: '/student/dashboard', Icon: Home },
  { title: 'Courses',   to: '/student/courses',   Icon: BookOpen },
  { title: 'Schedule',  to: '/student/schedule',  Icon: Calendar },
  { title: 'Profile',   to: '/student/profile',   Icon: User },
];

const facultyMenu = [
  { title: 'Dashboard',  to: '/faculty/dashboard', Icon: Home },
  { title: 'My Courses', to: '/faculty/courses',  Icon: BookOpen },
  { title: 'Students',   to: '/faculty/students', Icon: GraduationCap },
  { title: 'Schedule',   to: '/faculty/schedule', Icon: Calendar },
];

export function AppSidebar({ userRole }) {
  const location = useLocation();
  const menuItems = userRole === 'faculty' ? facultyMenu : studentMenu;
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <div className={`flex items-center transition-all duration-200
          ${isCollapsed ? 'px-0 py-2 justify-center w-full' : 'px-4 py-3'}`}>
          <img src={logo} alt="UCMP Logo" className="h-8 w-8"/>
          {!isCollapsed && (
            <div className="flex-1">
              <div className="font-semibold">UCMP</div>
              <div className="text-xs text-muted-foreground">
                {userRole === 'faculty' ? 'Faculty Portal' : 'Student Portal'}
              </div>
            </div>
          )}
          <SidebarTrigger className="p-2 hover:bg-muted rounded"/>
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
                      className={`transition-all duration-200 p-0
                        ${isCollapsed && 'justify-center w-full min-w-0'}
                        ${isActive ? 'bg-primary text-primary-foreground' : ''}`}>
                      <Link to={to}
                        className={`flex items-center rounded
                        ${isCollapsed ? 'justify-center w-full gap-0 px-0' : 'gap-2 px-3 py-2'}
                        `}>
                          <Icon className="h-5 w-5" />
                          {!isCollapsed && title}
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
                <SidebarMenuButton asChild className={isCollapsed ? 'p-0  w-full' : ''}>
                  <Link to="/settings"
                    className={`flex items-center rounded
                      ${isCollapsed ? 'justify-center w-full gap-0 px-0' : 'gap-2 px-3 py-2 hover:bg-muted'}`}>
                    <Settings className="h-4 w-4" />
                    {!isCollapsed && "Settings"}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={isCollapsed ? 'p-0 justify-center w-full' : ''}>
                  <button
                    onClick={() => {/* logout logic */}}
                    className={`flex items-center rounded
                      ${isCollapsed ? 'justify-center w-full gap-0 px-0' : 'gap-2 px-3 py-2 hover:bg-muted'}`}>
                    <LogOut className="h-4 w-4" />
                    {!isCollapsed && "Logout"}
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
            <SidebarMenuButton asChild className={isCollapsed ? 'p-0 justify-center w-full' : ''}>
              <div className={`flex items-center rounded
                ${isCollapsed ? 'justify-center w-full gap-0 px-0 py-2' : 'gap-2 px-3 py-2 hover:bg-muted'}`}>
                <User className="h-5 w-5" />
                {!isCollapsed && (
                  <div>
                    <div className="font-medium">John Doe</div>
                    <div className="text-xs text-muted-foreground">
                      {userRole === 'faculty' ? 'Professor' : 'Student'}
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
//   useSidebar
// } from '../../components/ui/sidebar';

// import { Separator } from '../../components/ui/separator';
// import {
//   Home,
//   BookOpen,
//   User,
//   GraduationCap,
//   Calendar,
//   Settings,
//   LogOut,
// } from 'lucide-react';
// import logo from '../../assets/logo.png';

// // Define menu items per role
// const studentMenu = [
//   { title: 'Dashboard', to: '/student/dashboard', Icon: Home },
//   { title: 'Courses',   to: '/student/courses',   Icon: BookOpen },
//   { title: 'Schedule',  to: '/student/schedule',  Icon: Calendar },
//   { title: 'Profile',   to: '/student/profile',   Icon: User },
// ];

// const facultyMenu = [
//   { title: 'Dashboard',  to: '/faculty/dashboard', Icon: Home },
//   { title: 'My Courses', to: '/faculty/courses',  Icon: BookOpen },
//   { title: 'Students',   to: '/faculty/students', Icon: GraduationCap },
//   { title: 'Schedule',   to: '/faculty/schedule', Icon: Calendar },
// ];

// export function AppSidebar({ userRole }) {
//   const location = useLocation();
//   const menuItems = userRole === 'faculty' ? facultyMenu : studentMenu;
//   const { state } = useSidebar();
//   const isCollapsed = state === 'collapsed';

//   return (
//     // KEY: collapsible="icon"
//     <Sidebar variant="inset" collapsible="icon">
//       <SidebarHeader>
//         <div className={`flex items-center transition-all duration-200 gap-2 ${isCollapsed ? 'px-0 justify-center' : 'px-4 py-3'}`}>
//           <img src={logo} alt="UCMP Logo" className="h-8 w-8" />
//           {!isCollapsed && (
//             <div className="flex-1">
//               <div className="font-semibold">UCMP</div>
//               <div className="text-xs text-muted-foreground">
//                 {userRole === 'faculty' ? 'Faculty Portal' : 'Student Portal'}
//               </div>
//             </div>
//           )}
//           <SidebarTrigger className="p-2 hover:bg-muted rounded" />
//         </div>
//       </SidebarHeader>

//       <SidebarContent>
//         <SidebarGroup>
//           <SidebarGroupLabel>Navigation</SidebarGroupLabel>
//           <SidebarGroupContent>
//             <SidebarMenu>
//               {menuItems.map(({ title, to, Icon }) => {
//                 const isActive = location.pathname === to;
//                 return (
//                   <SidebarMenuItem key={to}>
//                     <SidebarMenuButton
//                       asChild
//                       className={`transition-all duration-200 
//                         ${isCollapsed ? 'p-0 justify-center w-full min-w-0' : 'px-3 py-2'} 
//                         ${isActive ? 'bg-primary text-primary-foreground' : ''}`}
//                     >
//                       <Link to={to} className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-2'}`}>
//                         <Icon className="h-5 w-5" />
//                         {!isCollapsed && title}
//                       </Link>
//                     </SidebarMenuButton>
//                   </SidebarMenuItem>
//                 );
//               })}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>

//         <Separator />

//         <SidebarGroup>
//           <SidebarGroupLabel>Account</SidebarGroupLabel>
//           <SidebarGroupContent>
//             <SidebarMenu>
//               <SidebarMenuItem>
//                 <SidebarMenuButton asChild className={isCollapsed ? 'p-0 justify-center w-full' : ''}>
//                   <Link to="/settings" className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-2 px-3 py-2 hover:bg-muted'}`}>
//                     <Settings className="h-4 w-4" />
//                     {!isCollapsed && "Settings"}
//                   </Link>
//                 </SidebarMenuButton>
//               </SidebarMenuItem>
//               <SidebarMenuItem>
//                 <SidebarMenuButton asChild className={isCollapsed ? 'p-0 justify-center w-full' : ''}>
//                   <button onClick={() => {/* logout logic */}} className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-2 px-3 py-2 hover:bg-muted'}`}>
//                     <LogOut className="h-4 w-4" />
//                     {!isCollapsed && "Logout"}
//                   </button>
//                 </SidebarMenuButton>
//               </SidebarMenuItem>
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
//       </SidebarContent>

//       <SidebarFooter>
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <SidebarMenuButton asChild className={isCollapsed ? 'p-0 justify-center w-full' : ''}>
//               <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-2 px-3 py-2 hover:bg-muted'}`}>
//                 <User className="h-5 w-5" />
//                 {!isCollapsed && (
//                   <div>
//                     <div className="font-medium">John Doe</div>
//                     <div className="text-xs text-muted-foreground">
//                       {userRole === 'faculty' ? 'Professor' : 'Student'}
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


// import React from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import {
//   Sidebar,
//   SidebarProvider,
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
//   useSidebar
// } from '../../components/ui/sidebar';

// import { Separator } from '../../components/ui/separator';
// import {
//   Home,
//   BookOpen,
//   User,
//   GraduationCap,
//   Calendar,
//   Settings,
//   LogOut,
// } from 'lucide-react';
// import logo from '../../assets/logo.png';

// // Define menu items per role
// const studentMenu = [
//   { title: 'Dashboard', to: '/student/dashboard', Icon: Home },
//   { title: 'Courses', to: '/student/courses', Icon: BookOpen },
//   { title: 'Schedule', to: '/student/schedule', Icon: Calendar },
//   { title: 'Profile', to: '/student/profile', Icon: User },
// ];

// const facultyMenu = [
//   { title: 'Dashboard', to: '/faculty/dashboard', Icon: Home },
//   { title: 'My Courses', to: '/faculty/courses', Icon: BookOpen },
//   { title: 'Students', to: '/faculty/students', Icon: GraduationCap },
//   { title: 'Schedule', to: '/faculty/schedule', Icon: Calendar },
// ];

// export function AppSidebar({ userRole }) {
//   const location = useLocation();
//   const { collapsed } = useSidebar();
//   const menuItems = userRole === 'faculty' ? facultyMenu : studentMenu;

//   return (
//     <SidebarProvider>
//       <Sidebar
//         className="h-screen border-r border-border"
//         style={{
//           width: collapsed ? '56px' : '180px', // Shrunk width
//           transition: 'width 0.3s ease',
//         }}
//       >
//         <SidebarHeader className="flex items-center justify-center h-16">
//           {!collapsed && (
//             <img src={logo} alt="Logo" className="h-8 object-contain" />
//           )}
//         </SidebarHeader>

//         <Separator />

//         <SidebarContent className="px-1 py-2">
//           <SidebarGroup>
//             <SidebarGroupLabel>
//               {!collapsed && <span className="text-xs text-muted-foreground px-3">Menu</span>}
//             </SidebarGroupLabel>

//             <SidebarGroupContent>
//               <SidebarMenu className="space-y-1">
//                 {menuItems.map(({ title, to, Icon }) => (
//                   <SidebarMenuItem key={title} asChild>
//                     <Link
//                       to={to}
//                       className={`flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-muted transition ${
//                         location.pathname === to ? 'bg-muted font-medium' : ''
//                       }`}
//                     >
//                       <Icon className="w-4 h-4 shrink-0" />
//                       {!collapsed && <span className="truncate">{title}</span>}
//                     </Link>
//                   </SidebarMenuItem>
//                 ))}
//               </SidebarMenu>
//             </SidebarGroupContent>
//           </SidebarGroup>
//         </SidebarContent>

//         <SidebarFooter className="mt-auto px-1 py-2">
//           <SidebarMenu className="space-y-1">
//             <SidebarMenuItem asChild>
//               <Link to="/settings" className="flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-muted transition">
//                 <Settings className="w-4 h-4 shrink-0" />
//                 {!collapsed && <span>Settings</span>}
//               </Link>
//             </SidebarMenuItem>

//             <SidebarMenuItem asChild>
//               <Link to="/logout" className="flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-muted transition">
//                 <LogOut className="w-4 h-4 shrink-0" />
//                 {!collapsed && <span>Logout</span>}
//               </Link>
//             </SidebarMenuItem>
//           </SidebarMenu>
//         </SidebarFooter>
//       </Sidebar>
//     </SidebarProvider>
//   );
// }
