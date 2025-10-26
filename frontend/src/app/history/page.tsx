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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">History</h1>
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-600">No history yet.</div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <Link key={item.id} href={`/history/${item.id}`} className="block">
                <div className="bg-white rounded-xl shadow p-6 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-700">
                      <span className="mr-4">Responses: {item.summary.numResponses}</span>
                      <span>Best avg: {item.summary.bestAverage.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="text-gray-800 line-clamp-2">{item.prompt}</div>
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
