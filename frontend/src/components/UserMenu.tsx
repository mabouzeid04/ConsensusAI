"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMe, logout, SessionUser, API_BASE_URL, getClientId } from '../services/api';

export default function UserMenu() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { user } = await getMe();
        setUser(user);
      } catch {}
    })();
  }, []);

  const initials = user?.name?.trim()?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className="relative">
      {!user ? (
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn btn-primary btn-sm">Sign in</Link>
          <a
            className="btn btn-ghost btn-sm"
            href={`${API_BASE_URL}/auth/google?clientId=${encodeURIComponent(getClientId())}`}
          >
            Continue with Google
          </a>
        </div>
      ) : (
        <div
          className="relative"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <button aria-haspopup="menu" aria-expanded={open} className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center">
            {user.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.imageUrl} alt="avatar" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <span className="font-semibold">{initials}</span>
            )}
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-base-100 shadow rounded-md overflow-hidden z-50" role="menu">
              <Link href="/account" className="block px-4 py-2 hover:bg-base-200" role="menuitem">Account</Link>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-base-200"
                onClick={async () => { await logout(); window.location.reload(); }}
                role="menuitem"
              >Logout</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


