"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getMe, logout, SessionUser, API_BASE_URL, getClientId } from '../services/api';

export default function UserMenu() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { user } = await getMe();
        setUser(user);
      } catch {}
    })();
  }, []);

  const initials = user?.name?.trim()?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';
  const containerRef = useRef<HTMLDivElement | null>(null);
  const closeTimer = useRef<number | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    if (pinned) return; // do not auto-close when pinned
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  };

  // Close when clicking outside if pinned or open
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      const root = containerRef.current;
      if (!root) return;
      if (root.contains(e.target as Node)) return;
      if (pinned) setPinned(false);
      setOpen(false);
    }
    if (open || pinned) {
      document.addEventListener('mousedown', onDocMouseDown);
    }
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [open, pinned]);

  // ESC to unpin/close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setPinned(false);
        setOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

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
        <div className="relative" ref={containerRef}>
          <button
            aria-haspopup="menu"
            aria-expanded={open}
            className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center"
            onMouseEnter={() => { cancelClose(); setOpen(true); }}
            onMouseLeave={scheduleClose}
            onClick={() => {
              // Toggle pin
              setPinned((prev) => {
                const next = !prev;
                if (next) setOpen(true);
                else setOpen(false);
                return next;
              });
            }}
          >
            {user.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.imageUrl} alt="avatar" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <span className="font-semibold">{initials}</span>
            )}
          </button>
          {open && (
            <div
              className="absolute right-0 mt-2 w-48 bg-base-100 shadow rounded-md overflow-hidden z-50"
              role="menu"
              onMouseEnter={cancelClose}
              onMouseLeave={() => { if (!pinned) setOpen(false); }}
            >
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


