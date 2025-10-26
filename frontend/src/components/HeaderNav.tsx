"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserMenu from './UserMenu';

export default function HeaderNav() {
  const pathname = usePathname();
  const hideHistory = pathname?.startsWith('/login');

  return (
    <nav className="flex items-center gap-4">
      {!hideHistory && (
        <Link href="/history" className="text-sm text-gray-700 hover:text-gray-900">History</Link>
      )}
      <UserMenu />
    </nav>
  );
}


