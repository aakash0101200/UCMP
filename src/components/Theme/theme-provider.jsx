// src/components/Theme/theme-provider.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';

/* --------------------------------- Context --------------------------------- */

const initialState = {
  theme: 'system',          // 'light' | 'dark' | 'system'
  setTheme: () => {},       // placeholder – replaced in provider
};

const ThemeProviderContext = createContext(initialState);

/* ------------------------------- Provider ---------------------------------- */

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey  = 'vite-ui-theme',
  ...props
}) {
  // 1. Initialise from localStorage or fallback
  const [theme, setTheme] = useState(() =>
    localStorage.getItem(storageKey) || defaultTheme,
  );

  // 2. Side effect: update <html> class every time theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // 3. Expose setter that persists to localStorage
  const value = {
    theme,
    setTheme: (newTheme) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider value={value} {...props}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

/* ------------------------------ Consumer Hook ------------------------------ */

export function useTheme() {
  const ctx = useContext(ThemeProviderContext);
  if (ctx === undefined)
    throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
