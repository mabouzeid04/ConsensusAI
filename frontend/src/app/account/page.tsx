"use client";

import React, { useEffect, useState } from 'react';
import { getMe, SessionUser, getWallet, creditWallet, getUsage } from '../../services/api';

export default function AccountPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [balanceCents, setBalanceCents] = useState<number>(0);
  const [usage, setUsage] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [topUpUsd, setTopUpUsd] = useState<string>('5.00');
  const [topUpErr, setTopUpErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { user } = await getMe();
        setUser(user);
        if (user) {
          const w = await getWallet();
          setBalanceCents(w.balanceCents || 0);
          const u = await getUsage(20);
          setUsage(u.items || []);
        }
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
          <div className="space-y-2 mb-6">
            <div><span className="text-base-content/60">Email:</span> {user.email}</div>
            {user.name && <div><span className="text-base-content/60">Name:</span> {user.name}</div>}
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="text-lg font-semibold">Wallet</div>
              <div className="flex flex-col items-end gap-2">
                <div className="join">
                  <div className="join-item input input-bordered input-sm flex items-center gap-2 w-40 bg-base-100">
                    <span className="opacity-60">$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*[.,]?[0-9]{0,2}"
                      value={topUpUsd}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const cleaned = raw.replace(/[^0-9.]/g, '');
                        const limited = cleaned.replace(/^(\d*\.?\d{0,2}).*$/, '$1');
                        setTopUpUsd(limited);
                      }}
                      className="grow"
                      placeholder="Amount"
                    />
                  </div>
                  <button
                    className="join-item btn btn-sm btn-primary"
                    disabled={busy}
                    onClick={async () => {
                      try {
                        setTopUpErr(null);
                        setBusy(true);
                        const amt = Number.parseFloat(topUpUsd);
                        if (!Number.isFinite(amt) || amt <= 0) {
                          setTopUpErr('Enter a valid amount');
                          return;
                        }
                        const cents = Math.round(amt * 100);
                        const res = await creditWallet(cents);
                        setBalanceCents(res.balanceCents);
                        setTopUpUsd(amt.toFixed(2));
                      } catch (e) {
                        console.error(e);
                        setTopUpErr('Top up failed');
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >Top up</button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="badge badge-outline cursor-pointer"
                    onClick={() => setTopUpUsd('5.00')}
                  >$5</button>
                  <button
                    type="button"
                    className="badge badge-outline cursor-pointer"
                    onClick={() => setTopUpUsd('10.00')}
                  >$10</button>
                  <button
                    type="button"
                    className="badge badge-outline cursor-pointer"
                    onClick={() => setTopUpUsd('20.00')}
                  >$20</button>
                </div>
              </div>
            </div>
            <div className="mt-2 text-2xl">${(balanceCents / 100).toFixed(2)}</div>
            {topUpErr && <div className="mt-2 text-sm text-error">{topUpErr}</div>}
          </div>

          <div>
            <div className="text-lg font-semibold mb-2">Recent usage</div>
            <div className="space-y-2">
              {usage.length === 0 && (
                <div className="text-base-content/60">No usage yet.</div>
              )}
              {usage.map((u) => (
                <div key={u.id} className="flex items-center justify-between border border-base-300 rounded-lg p-3">
                  <div>
                    <div className="font-medium">{u.provider}:{u.model}</div>
                    <div className="text-sm text-base-content/60">{new Date(u.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">In {u.inputTokens} / Out {u.outputTokens}</div>
                    <div className="font-semibold">${(u.costCents / 100).toFixed(4)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


