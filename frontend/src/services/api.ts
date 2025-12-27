/// <reference types="node" />

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_URL?: string;
    }
  }
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5051/api';

export function getClientId(): string {
  if (typeof window === 'undefined') return '';
  const key = 'consensusai_client_id';
  let id = window.localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(key, id);
  }
  return id;
}

export async function submitPrompt(payload: { prompt: string; generators: string[] }) {
  const response = await fetch(`${API_BASE_URL}/prompt/submit`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': getClientId(),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const msg = (data && data.error) || 'Failed to submit prompt';
    throw new Error(msg);
  }

  return response.json();
}

export async function evaluateResponses(params: { prompt: string; shuffledResponses: any[]; originalMapping: any[]; judges: string[] }) {
  const response = await fetch(`${API_BASE_URL}/prompt/evaluate`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': getClientId(),
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Failed to evaluate responses');
  }

  return response.json();
}

export async function getHistory() {
  const response = await fetch(`${API_BASE_URL}/history`, {
    credentials: 'include',
    headers: {
      'x-client-id': getClientId(),
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch history');
  }
  return response.json();
}

export async function getHistoryItem(id: string) {
  const response = await fetch(`${API_BASE_URL}/history/${id}`, {
    credentials: 'include',
    headers: {
      'x-client-id': getClientId(),
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch history item');
  }
  return response.json();
} 

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  imageUrl?: string | null;
}

export async function getMe(): Promise<{ user: SessionUser | null }> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    credentials: 'include',
    headers: {
      'x-client-id': getClientId(),
    },
  });
  if (!res.ok) throw new Error('Failed to load session');
  return res.json();
}

export async function register(params: { email: string; password: string; name?: string }) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': getClientId(),
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Registration failed');
  return res.json();
}

export async function login(params: { email: string; password: string }) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': getClientId(),
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export async function logout() {
  const res = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Logout failed');
  return res.json();
}

export async function getWallet() {
  const res = await fetch(`${API_BASE_URL}/billing/wallet`, {
    credentials: 'include',
    headers: { 'x-client-id': getClientId() },
  });
  if (!res.ok) throw new Error('Failed to fetch wallet');
  return res.json();
}

export async function creditWallet(amountCents: number) {
  const res = await fetch(`${API_BASE_URL}/billing/wallet/credit`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amountCents }),
  });
  if (!res.ok) throw new Error('Failed to credit wallet');
  return res.json();
}

export async function getUsage(limit = 50, cursor?: string) {
  const url = new URL(`${API_BASE_URL}/billing/usage`);
  url.searchParams.set('limit', String(limit));
  if (cursor) url.searchParams.set('cursor', cursor);
  const res = await fetch(url.toString(), { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch usage');
  return res.json();
}

export async function startTopupCheckout(amountCents: number) {
  const res = await fetch(`${API_BASE_URL}/billing/checkout`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amountCents }),
  });
  if (!res.ok) throw new Error('Failed to start checkout');
  return res.json() as Promise<{ url: string }>; 
}