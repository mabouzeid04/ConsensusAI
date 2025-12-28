"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getHistoryItem } from '../../../services/api';
import ResponseList from '../../../components/ResponseList';

interface EvaluationItem {
  model: string;
  score: number;
  explanation: string;
}

interface ResponseItem {
  label: string;
  model: string;
  response: string;
  evaluations: EvaluationItem[];
}

interface ComparisonDetail {
  id: string;
  prompt: string;
  title?: string | null;
  createdAt: string;
  responsesWithEvaluations: ResponseItem[];
}

export default function HistoryDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<ComparisonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const item = await getHistoryItem(id);
        setData(item);
      } catch (e: any) {
        setError(e?.message || 'Failed to load item');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">{error || 'Not found'}</div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="bg-base-100 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              {data.title && <h1 className="text-3xl font-bold text-base-content mb-1">{data.title}</h1>}
              <h2 className="text-2xl font-bold text-base-content">Original Prompt</h2>
            </div>
            <div className="text-sm text-base-content/60">{new Date(data.createdAt).toLocaleString(undefined, {
              year: 'numeric',
              month: 'short',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })}</div>
          </div>
          <div className="bg-base-200 rounded-xl p-6 border border-base-300">
            <p className="text-base-content text-lg">{data.prompt}</p>
          </div>
        </div>

        <ResponseList results={{ prompt: data.prompt, responsesWithEvaluations: data.responsesWithEvaluations }} />
      </main>
    </div>
  );
}
