/// <reference types="node" />

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_URL?: string;
    }
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getClientId(): string {
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
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': getClientId(),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to submit prompt');
  }

  return response.json();
}

export async function evaluateResponses(params: { prompt: string; shuffledResponses: any[]; originalMapping: any[]; judges: string[] }) {
  const response = await fetch(`${API_BASE_URL}/prompt/evaluate`, {
    method: 'POST',
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
    headers: {
      'x-client-id': getClientId(),
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch history item');
  }
  return response.json();
} 