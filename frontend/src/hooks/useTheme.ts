"use client";

import { useCallback, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('light');

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


