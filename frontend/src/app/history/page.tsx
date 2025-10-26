"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getHistory } from '../../services/api';

interface HistoryItemSummary {
  id: string;
  prompt: string;
  createdAt: string;
  summary: {
    numResponses: number;
    bestAverage: number;
  };
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItemSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getHistory();
        setItems(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load history');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold mb-6 text-base-content">History</h1>
        {items.length === 0 ? (
          <div className="bg-base-100 rounded-2xl shadow p-8 text-center text-base-content/70">No history yet.</div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <Link key={item.id} href={`/history/${item.id}`} className="block">
                <div className="bg-base-100 rounded-xl shadow p-6 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-base-content/60">
                      {new Date(item.createdAt).toLocaleString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </div>
                    <div className="text-sm text-base-content/80">
                      <span className="mr-4">Responses: {item.summary.numResponses}</span>
                      <span>Best avg: {item.summary.bestAverage.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="text-base-content line-clamp-2" title={item.prompt}>
                    {item.prompt.length > 160 ? `${item.prompt.slice(0, 160)}…` : item.prompt}
                  </div>
                </div>
              </Link>
            ))
            }
          </div>
        )}
      </main>
    </div>
  );
}
