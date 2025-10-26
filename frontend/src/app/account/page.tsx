"use client";

import React, { useEffect, useState } from 'react';
import { getMe, SessionUser } from '../../services/api';

export default function AccountPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { user } = await getMe();
        setUser(user);
      } catch (e: any) {
        setError(e?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-base-content">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-error">{error}</div>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="bg-base-100 rounded-2xl shadow p-8 text-base-content">Not signed in.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="bg-base-100 rounded-2xl shadow p-8 text-base-content border border-base-300">
          <h1 className="text-2xl font-bold mb-6">Account</h1>
          <div className="space-y-2">
            <div><span className="text-base-content/60">Email:</span> {user.email}</div>
            {user.name && <div><span className="text-base-content/60">Name:</span> {user.name}</div>}
          </div>
        </div>
      </main>
    </div>
  );
}


