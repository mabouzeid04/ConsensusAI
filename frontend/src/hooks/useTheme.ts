"use client";

import { useCallback, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const getInitialTheme = (): Theme => {
    try {
      if (typeof document !== 'undefined') {
        const attr = document.documentElement.getAttribute('data-theme') as Theme | null;
        const stored = (typeof localStorage !== 'undefined' ? localStorage.getItem('theme') as Theme | null : null);
        const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        return stored || attr || (prefersDark ? 'dark' : 'light');
      }
    } catch {}
    return 'light';
  };

  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    try {
      const attr = document.documentElement.getAttribute('data-theme') as Theme | null;
      const stored = (localStorage.getItem('theme') as Theme | null);
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initial: Theme = stored || attr || (prefersDark ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', initial);
      setThemeState(initial);
    } catch {}
  }, []);

  const setTheme = useCallback((next: Theme) => {
    try {
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      setThemeState(next);
    } catch {}
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme };
}


