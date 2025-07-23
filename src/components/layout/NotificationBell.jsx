import { Bell } from 'lucide-react';
import React from 'react';

/**
 * @param {{count:number,onClick:()=>void}} props
 */
export function NotificationBell({ count = 0, onClick }) {
  return (
    <button
      aria-label="Notifications"
      onClick={onClick}
      className="relative p-2 rounded-md hover:bg-neutral-900/10 dark:hover:bg-neutral-50/10 focus:outline-none focus-visible:ring focus-visible:ring-primary"
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span
          className="absolute -top-1 -right-1 min-w-[1.15rem] h-4 text-[10px] bg-red-600 text-white
                     rounded-full flex items-center justify-center leading-none px-[2px]"
        >
          {count}
        </span>
      )}
    </button>
  );
}
