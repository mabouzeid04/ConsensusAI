"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserMenu from './UserMenu';
import { useTheme } from '../hooks/useTheme';

export default function HeaderNav() {
  const pathname = usePathname();
  const hideHistory = pathname?.startsWith('/login');
  const { theme, toggleTheme } = useTheme();

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
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
      </button>
      <UserMenu />
    </nav>
  );
}


