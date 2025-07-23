import React from 'react';
import { X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ModeToggle } from '../Theme/ModeToggle';

/**
 * @param {{open:boolean,onClose:()=>void,links:Array<{to:string,label:string}>}} props
 */
export function MobileDrawer({ open, onClose, links }) {
  const { pathname } = useLocation();
  return (
    <div
      className={`fixed inset-0 z-40 transform transition-transform duration-300
        ${open ? 'translate-x-0' : 'translate-x-full'}
        lg:hidden bg-neutral-900/95 backdrop-blur-md`}
    >
      <button
        aria-label="Close menu"
        className="absolute top-4 right-4 p-2 rounded hover:bg-neutral-800"
        onClick={onClose}
      >
        <X className="h-6 w-6 text-white" />
      </button>

      <nav className="mt-16 flex flex-col items-center gap-6">
        {links.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            onClick={onClose}
            className={`text-lg ${
              pathname === to ? 'text-primary font-semibold' : 'text-white'
            }`}
          >
            {label}
          </Link>
        ))}
        <ModeToggle />
      </nav>
    </div>
  );
}
