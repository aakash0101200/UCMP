import React, { useRef, useState } from 'react';
import { LogOut, Settings, User } from 'lucide-react';
import { useClickOutside } from '@/lib/useClickOutside';

/**
 * @param {{username:string,onLogout:()=>void}} props
 */
export function ProfileMenu({ username = 'Guest', onLogout }) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  useClickOutside(box, () => setOpen(false));

  return (
    <div className="relative" ref={box}>
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-1 p-1 rounded-full hover:ring-2 hover:ring-primary focus:outline-none"
      >
        <img
          className="h-8 w-8 rounded-full object-cover"
          src={`https://api.dicebear.com/7.x/initials/svg?seed=${username}`}
          alt="avatar"
        />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-md bg-card text-card-foreground shadow-lg
                     ring-1 ring-ring animate-fade-in"
        >
          <button
            className="flex w-full items-center gap-2 px-4 py-2 hover:bg-muted"
            onClick={() => {
              /* navigate('/profile') */
              setOpen(false);
            }}
          >
            <User size={16} /> Profile
          </button>
          <button
            className="flex w-full items-center gap-2 px-4 py-2 hover:bg-muted"
            onClick={() => {
              /* navigate('/settings') */
              setOpen(false);
            }}
          >
            <Settings size={16} /> Settings
          </button>
          <button
            className="flex w-full items-center gap-2 px-4 py-2 hover:bg-destructive text-destructive-foreground"
            onClick={onLogout}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </div>
  );
}
