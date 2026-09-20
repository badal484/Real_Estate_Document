'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDeadlines } from '@/hooks/useDeadlines';
import { deadlinesApi } from '@/services/api';
import { DeadlineCard } from '@/components/DeadlineCard';
import type { Deadline } from '@/types';

export default function ReviewPage({ params }: { params: { id: string } }) {
  const { deadlines, loading, error, refetch } = useDeadlines(params.id);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // Quick-confirm with the computed date as-is
  async function handleConfirm(deadline: Deadline) {
    setConfirming(deadline.id);
    setConfirmError(null);
    try {
      await deadlinesApi.confirm(params.id, deadline.id, {
        confirmedDate: deadline.computedDate,
        confirmedBy: 'agent', // TODO: replace with real user once auth is added
        activate: true,
      });
      refetch();
    } catch (err) {
      setConfirmError((err as Error).message);
    } finally {
      setConfirming(null);
    }
  }

  const pending = deadlines.filter((d) => d.status === 'PENDING');
  const confirmed = deadlines.filter((d) => d.status !== 'PENDING');

  return (
    <div className="max-w-3xl mx-auto">
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link href="/deals" className="hover:text-brand-700">Deals</Link>
        <span>/</span>
        <Link href={`/deals/${params.id}`} className="hover:text-brand-700">Timeline</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Review Deadlines</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Review &amp; Confirm Deadlines</h1>
      <p className="text-gray-500 text-sm mb-8">
        Verify each AI-extracted deadline. Edit the date if needed, then confirm to activate alerts.
      </p>

      {loading && <p className="text-gray-400 text-sm">Loading…</p>}
      {error && <p className="text-red-600 text-sm mb-4">⚠ {error}</p>}
      {confirmError && <p className="text-red-600 text-sm mb-4">⚠ {confirmError}</p>}

      {/* Pending — need user action */}
      {pending.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-3">
            ⚠ Needs Confirmation ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map((dl) => (
              <div key={dl.id} className={confirming === dl.id ? 'opacity-50 pointer-events-none' : ''}>
                <DeadlineCard
                  deadline={dl}
                  onConfirm={(d) => void handleConfirm(d)}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Confirmed / Active */}
      {confirmed.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Confirmed ({confirmed.length})
          </h2>
          <div className="space-y-3">
            {confirmed.map((dl) => (
              <DeadlineCard key={dl.id} deadline={dl} />
            ))}
          </div>
        </section>
      )}

      {!loading && deadlines.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">
            No deadlines extracted yet. Upload a contract to begin extraction.
          </p>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <Link href={`/deals/${params.id}`} className="btn-secondary">
          ← Back to Timeline
        </Link>
        <Link href={`/audit?dealId=${params.id}`} className="btn-secondary">
          Audit Log →
        </Link>
      </div>
    </div>
  );
}
