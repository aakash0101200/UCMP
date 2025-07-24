// import React, { useState } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { Menu, Search } from 'lucide-react';
// import { ModeToggle } from '../Theme/ModeToggle';
// import { NotificationBell } from './NotificationBell';
// import { ProfileMenu } from './ProfileMenu';
// import { MobileDrawer } from './MobileDrawer';
// import { useHotkeys } from '../../lib/useHotkeys';
// import logo from '../../assets/logo.png';

// /* -------------------------------- CONSTANT DATA -------------------------------- */

// const LINKS = [
//   { to: '/', label: 'Home' },
//   { to: '/student', label: 'Student' },
//   { to: '/faculty', label: 'Faculty' },
//   { to: '/admin', label: 'Admin' },
//   { to: '/about', label: 'About' }
// ];

// /* -------------------------------- COMPONENT ------------------------------------ */

// export default function NavBar() {
//   const [drawer, setDrawer] = useState(false);
//   const [searchOpen, setSearchOpen] = useState(false);
//   const { pathname } = useLocation();

//   // ⌘+K / Ctrl+K opens search
//   useHotkeys(['meta+k', 'ctrl+k'], () => setSearchOpen(true));

//   return (
//     <>
//       <header className="sticky top-0 z-50 w-full backdrop-blur-lg border-b border-border bg-background/75">
//         <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
//           {/* Brand */}
//           <Link to="/" className="flex items-center gap-2">
//             <img src={logo} alt="logo" className="h-8 w-8" />
//             <span className="text-lg font-semibold">UCMP</span>
//           </Link>

//           {/* Desktop nav */}
//           <nav className="hidden lg:flex items-center gap-8 ml-10">
//             {LINKS.map(({ to, label }) => (
//               <Link
//                 key={to}
//                 to={to}
//                 className={`hover:text-primary transition-colors ${
//                   pathname === to ? 'text-primary font-medium' : ''
//                 }`}
//               >
//                 {label}
//               </Link>
//             ))}
//           </nav>

//           {/* Actions */}
//           <div className="flex items-center gap-2">
//             {/* Search */}
//             <button
//               onClick={() => setSearchOpen(true)}
//               aria-label="Search (⌘/Ctrl+K)"
//               className="p-2 rounded-md hover:bg-muted/50 focus-visible:ring"
//             >
//               <Search className="h-5 w-5" />
//             </button>

//             {/* Notification */}
//             <NotificationBell
//               count={3}
//               onClick={() => {
//                 /* open notifications panel */
//               }}
//             />

//             {/* Theme */}
//             <ModeToggle />

//             {/* Profile */}
//             <ProfileMenu
//               username="Anjali"
//               onLogout={() => {
//                 /* logout logic */
//               }}
//             />

//             {/* Mobile burger */}
//             <button
//               className="lg:hidden p-2 rounded-md hover:bg-muted/50 focus-visible:ring"
//               aria-label="Open menu"
//               onClick={() => setDrawer(true)}
//             >
//               <Menu className="h-6 w-6" />
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Mobile Drawer */}
//       <MobileDrawer
//         open={drawer}
//         onClose={() => setDrawer(false)}
//         links={LINKS}
//       />

//       {/* Search modal (simplified) */}
//       {searchOpen && (
//         <div
//           className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/40 backdrop-blur-sm"
//           onClick={() => setSearchOpen(false)}
//         >
//           <div
//             onClick={(e) => e.stopPropagation()}
//             className="w-full max-w-lg rounded-md bg-card text-card-foreground shadow-xl ring-1 ring-ring p-4"
//           >
//             <h2 className="text-sm mb-2 text-muted-foreground">Search…</h2>
//             <div className="relative">
//               <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
//               <input
//                 autoFocus
//                 type="text"
//                 placeholder="Type to search"
//                 className="w-full pl-10 pr-3 py-2 rounded-md bg-input focus:outline-none focus:ring
//                            placeholder:text-muted-foreground"
//               />
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }


/* ────────────────────────────────────────────────────────────
   DashboardNavBar.jsx  –  professional version
──────────────────────────────────────────────────────────────── */
import React, { useState } from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import logo from '@/assets/logo.png';
import { ModeToggle } from '@/components/Theme/ModeToggle';
import { NotificationBell } from './NotificationBell';         // already built
import { ProfileMenu } from './ProfileMenu';                   // already built

/**
 * @param {{
 *   onSidebarToggle: () => void;
 * }} props
 */
export default function DashboardNavBar({ onSidebarToggle }) {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="sticky top-0 z-39 w-full bg-background/80 backdrop-blur-lg border-b border-border">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* ─── Left section ─────────────────────────────── */}
        <div className="flex items-center gap-2">
          {/* Mobile burger */}
          <button
            className="lg:hidden p-2 rounded-md hover:bg-muted focus-visible:ring"
            aria-label="Open sidebar"
            onClick={onSidebarToggle}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Brand */}
          <img src={logo} alt="logo" className="h-8 w-8" />
          <span className="font-semibold text-lg hidden sm:inline-block">UCMP</span>
        </div>

        {/* ─── Center section (search) ──────────────────── */}
        <div className="flex-1 justify-center hidden md:flex">
          {showSearch ? (
            <div className="relative w-full max-w-sm">
              <input
                autoFocus
                type="text"
                placeholder="Search…"
                className="w-full rounded-md border bg-input pl-10 pr-3 py-2
                           focus:outline-none focus:ring placeholder:text-muted-foreground"
                onBlur={() => setShowSearch(false)}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted
                         focus-visible:ring text-muted-foreground"
              aria-label="Open search"
            >
              <Search className="h-5 w-5" />
              <span className="hidden sm:inline">Search</span>
            </button>
          )}
        </div>

        {/* ─── Right section ────────────────────────────── */}
        <div className="flex items-center gap-2">
          {/* Inline search for mobile (shows icon only) */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="md:hidden p-2 rounded-md hover:bg-muted focus-visible:ring"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          <NotificationBell count={3} onClick={() => { /* open drawer */ }} />
          <ModeToggle />
          <ProfileMenu username="John Doe" onLogout={() => { /* logout */ }} />
        </div>
      </nav>

      {/* ─── Expanding search bar for mobile ───────────────────────────── */}
      {showSearch && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3">
          <input
            autoFocus
            type="text"
            placeholder="Search…"
            className="w-full rounded-md border bg-input px-3 py-2
                       focus:outline-none focus:ring placeholder:text-muted-foreground"
            onBlur={() => setShowSearch(false)}
          />
        </div>
      )}
    </header>
  );
}
