"use client";

import React, { useState } from 'react';
import { API_BASE_URL, getClientId, login, register } from '../../services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        await register({ email, password, name: name || undefined });
      }
      window.location.href = '/';
    } catch (e: any) {
      setError(e?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <main className="container mx-auto px-4 py-12 max-w-md">
        <div className="bg-white rounded-2xl shadow p-8">
          <h1 className="text-2xl font-bold mb-6">{mode === 'login' ? 'Sign in' : 'Create account'}</h1>
          <form onSubmit={onSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm mb-1">Name</label>
                <input className="w-full border rounded px-3 py-2" value={name} onChange={e => setName(e.target.value)} />
              </div>
            )}
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input type="email" className="w-full border rounded px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm mb-1">Password</label>
              <input type="password" className="w-full border rounded px-3 py-2" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <button disabled={loading} className="w-full mt-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Please wait...' : (mode === 'login' ? 'Sign in' : 'Create account')}
            </button>
          </form>
          <div className="my-4 text-center text-sm text-gray-500">or</div>
          <a
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded border hover:bg-gray-50"
            href={`${API_BASE_URL}/auth/google?clientId=${encodeURIComponent(getClientId())}`}
          >
            Continue with Google
          </a>
          <div className="mt-6 text-sm text-center">
            {mode === 'login' ? (
              <button className="text-blue-600 hover:underline" onClick={() => setMode('register')}>Create a new account</button>
            ) : (
              <button className="text-blue-600 hover:underline" onClick={() => setMode('login')}>Already have an account? Sign in</button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


