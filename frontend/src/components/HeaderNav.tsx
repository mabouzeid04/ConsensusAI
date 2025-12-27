"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserMenu from './UserMenu';
import { useTheme } from '../hooks/useTheme';

export default function HeaderNav() {
  const pathname = usePathname();
  const hideHistory = pathname?.startsWith('/login');
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="flex items-center gap-4 text-base-content">
      {!hideHistory && (
        <Link href="/history" className="text-sm hover:text-primary">History</Link>
      )}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="px-3 py-1.5 text-sm rounded-md border hover:border-primary hover:text-primary"
        title={mounted ? (theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode') : 'Toggle theme'}
      >
        <span suppressHydrationWarning>
          {mounted ? (theme === 'dark' ? '🌙 Dark' : '☀️ Light') : ' '}
        </span>
      </button>
      <UserMenu />
    </nav>
  );
}


