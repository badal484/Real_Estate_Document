import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDeadlines } from '@/hooks/useDeadlines';
import { deadlinesApi, dealsApi } from '@/services/api';
import { DeadlineCard } from '@/components/DeadlineCard';
import { DealHeader } from '@/components/deal/DealHeader';
import { IconChevronLeft, IconChevronRight, IconExclamationTriangle } from '@/components/icons';
import type { Deadline, Deal } from '@/types';

export function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const dealId = id!;
  const [deal, setDeal] = useState<Deal | null>(null);
  const { deadlines, loading, error, refetch } = useDeadlines(dealId);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  useEffect(() => {
    dealsApi
      .get(dealId)
      .then(setDeal)
      .catch(() => {});
  }, [dealId]);

  // Quick-confirm with the computed date as-is
  async function handleConfirm(deadline: Deadline) {
    setConfirming(deadline.id);
    setConfirmError(null);
    try {
      await deadlinesApi.confirm(dealId, deadline.id, {
        confirmedDate: deadline.computedDate,
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
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Unified Command Center Header & Tab Navigation */}
      <DealHeader deal={deal} activeTab="documents" />

      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Clause &amp; Deadline Verification</h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Verify each AI-extracted deadline and source quotation. Edit the date if needed, then confirm to lock in monitoring.
        </p>
      </div>

      {loading && <p className="text-sm text-slate-400">Loading&hellip;</p>}
      {error && (
        <p className="banner-error mb-4">
          <IconExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
      {confirmError && (
        <p className="banner-error mb-4">
          <IconExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {confirmError}
        </p>
      )}

      {/* Pending — need user action */}
      {pending.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-amber-700">
            <IconExclamationTriangle className="h-4 w-4" />
            Needs Confirmation ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map((dl) => (
              <div key={dl.id} className={confirming === dl.id ? 'pointer-events-none opacity-50' : ''}>
                <DeadlineCard deadline={dl} onConfirm={(d) => void handleConfirm(d)} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Confirmed / Active */}
      {confirmed.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
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
        <div className="empty-state p-12">
          <p className="text-sm text-slate-500">
            No deadlines extracted yet. Upload a contract to begin extraction.
          </p>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <Link to={`/deals/${dealId}`} className="btn-secondary">
          <IconChevronLeft className="h-4 w-4" />
          Back to Timeline
        </Link>
        <Link to={`/audit?dealId=${dealId}`} className="btn-secondary">
          Audit Log
          <IconChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
