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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow p-8">Not signed in.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="bg-white rounded-2xl shadow p-8">
          <h1 className="text-2xl font-bold mb-6">Account</h1>
          <div className="space-y-2">
            <div><span className="text-gray-500">Email:</span> {user.email}</div>
            {user.name && <div><span className="text-gray-500">Name:</span> {user.name}</div>}
          </div>
        </div>
      </main>
    </div>
  );
}


