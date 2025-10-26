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
          <Link href="/login" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Sign in</Link>
          <a
            className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200"
            href={`${API_BASE_URL}/auth/google?clientId=${encodeURIComponent(getClientId())}`}
          >
            Continue with Google
          </a>
        </div>
      ) : (
        <div>
          <button onClick={() => setOpen(v => !v)} className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center">
            {user.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.imageUrl} alt="avatar" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <span className="font-semibold">{initials}</span>
            )}
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow rounded-md overflow-hidden z-50">
              <Link href="/account" className="block px-4 py-2 hover:bg-gray-100">Account</Link>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={async () => { await logout(); window.location.reload(); }}
              >Logout</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


