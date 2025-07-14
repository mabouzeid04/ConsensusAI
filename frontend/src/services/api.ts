/// <reference types="node" />

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_URL?: string;
    }
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function submitPrompt(prompt: string) {
  const response = await fetch(`${API_BASE_URL}/prompt/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error('Failed to submit prompt');
  }

  return response.json();
}

export async function evaluateResponses(prompt: string, shuffledResponses: any[], originalMapping: any[]) {
  const response = await fetch(`${API_BASE_URL}/prompt/evaluate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      prompt,
      shuffledResponses,
      originalMapping
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to evaluate responses');
  }

  return response.json();
} 