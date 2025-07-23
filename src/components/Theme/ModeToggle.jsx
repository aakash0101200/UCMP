import React from 'react';
import { useTheme } from '@/components/Theme/theme-provider';
import { Sun, Moon } from 'lucide-react';

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  // Determine current active theme (resolving 'system' if needed)
  const isDark = React.useMemo(() => {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    // For 'system' theme, detect OS preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, [theme]);

  // Toggle handler switches between 'dark' and 'light' explicitly
  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      onClick={toggleTheme}
      className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-gray-800" />
      )}
    </button>
  );
}
