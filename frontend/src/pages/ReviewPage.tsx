import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDeadlines } from '@/hooks/useDeadlines';
import { deadlinesApi } from '@/services/api';
import { DeadlineCard } from '@/components/DeadlineCard';
import { EditDeadlineModal } from '@/components/EditDeadlineModal';
import {
  IconChevronLeft,
  IconChevronRight,
  IconExclamationTriangle,
  IconCheckCircle,
  IconSparkles,
  IconSpinner,
} from '@/components/icons';
import type { Deadline } from '@/types';

export function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const dealId = id!;
  const { deadlines, loading, error, refetch } = useDeadlines(dealId);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);
  const [batchConfirming, setBatchConfirming] = useState(false);

  // Quick-confirm single deadline
  async function handleConfirm(deadline: Deadline) {
    setConfirming(deadline.id);
    setConfirmError(null);
    try {
      await deadlinesApi.confirm(dealId, deadline.id, {
        confirmedDate: deadline.computedDate,
        confirmedBy: 'Agent Reviewer',
        activate: true,
      });
      refetch();
    } catch (err) {
      setConfirmError((err as Error).message);
    } finally {
      setConfirming(null);
    }
  }

  // Confirm All Pending
  async function handleConfirmAll() {
    const pendingList = deadlines.filter((d) => d.status === 'PENDING');
    if (!pendingList.length) return;

    setBatchConfirming(true);
    setConfirmError(null);

    try {
      for (const d of pendingList) {
        await deadlinesApi.confirm(dealId, d.id, {
          confirmedDate: d.computedDate,
          confirmedBy: 'Agent Reviewer',
          activate: true,
        });
      }
      refetch();
    } catch (err) {
      setConfirmError((err as Error).message);
    } finally {
      setBatchConfirming(false);
    }
  }

  const pending = deadlines.filter((d) => d.status === 'PENDING');
  const confirmed = deadlines.filter((d) => d.status !== 'PENDING');

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/deals" className="hover:text-brand-300">Portfolio Deals</Link>
        <IconChevronRight className="h-3.5 w-3.5 text-slate-600" />
        <Link to={`/deals/${dealId}`} className="hover:text-brand-300">Deal Timeline</Link>
        <IconChevronRight className="h-3.5 w-3.5 text-slate-600" />
        <span className="font-semibold text-slate-100">Review &amp; Confirm</span>
      </nav>

      {/* Title Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-6">
        <div>
          <span className="page-eyebrow">AI Verification</span>
          <h1 className="mt-1.5 text-2xl font-bold text-white tracking-tight">Review Extracted Deadlines</h1>
          <p className="mt-1 text-xs text-slate-400">
            Verify each AI-computed contingency date against the raw contract clause. Confirm to activate automated alerts.
          </p>
        </div>

        {pending.length > 0 && (
          <button
            onClick={() => void handleConfirmAll()}
            disabled={batchConfirming}
            className="btn-primary shrink-0 text-xs py-2.5 px-4 shadow-lg shadow-brand-600/30"
          >
            {batchConfirming ? (
              <>
                <IconSpinner className="h-4 w-4 animate-spin" />
                <span>Confirming All...</span>
              </>
            ) : (
              <>
                <IconCheckCircle className="h-4 w-4" />
                <span>Confirm All ({pending.length})</span>
              </>
            )}
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-8 text-sm text-slate-400">
          <IconSpinner className="h-5 w-5 animate-spin text-brand-500" />
          <span>Loading extracted contingency clauses&hellip;</span>
        </div>
      )}

      {error && (
        <p className="banner-error">
          <IconExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      {confirmError && (
        <p className="banner-error">
          <IconExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {confirmError}
        </p>
      )}

      {/* Pending Section */}
      {pending.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-amber-400">
              <IconExclamationTriangle className="h-4 w-4" />
              Needs Agent Confirmation ({pending.length})
            </h2>
            <span className="text-xs text-slate-500">Review computed dates below</span>
          </div>

          <div className="space-y-3">
            {pending.map((dl) => (
              <div key={dl.id} className={confirming === dl.id ? 'opacity-50 pointer-events-none' : ''}>
                <DeadlineCard
                  deadline={dl}
                  onConfirm={(d) => void handleConfirm(d)}
                  onEdit={(d) => setEditingDeadline(d)}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Confirmed / Active Section */}
      {confirmed.length > 0 && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-t border-slate-800/80 pt-6">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-emerald-400">
              <IconCheckCircle className="h-4 w-4" />
              Confirmed &amp; Alert Active ({confirmed.length})
            </h2>
            <span className="text-xs text-slate-500 font-mono">100% Verified</span>
          </div>

          <div className="space-y-3">
            {confirmed.map((dl) => (
              <DeadlineCard
                key={dl.id}
                deadline={dl}
                onEdit={(d) => setEditingDeadline(d)}
              />
            ))}
          </div>
        </section>
      )}

      {!loading && deadlines.length === 0 && (
        <div className="empty-state p-12">
          <IconSparkles className="mx-auto h-8 w-8 text-slate-500" />
          <p className="mt-3 text-sm text-slate-400">
            No deadlines extracted yet. Upload a purchase agreement PDF to analyze clauses.
          </p>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-6">
        <Link to={`/deals/${dealId}`} className="btn-secondary text-xs">
          <IconChevronLeft className="h-4 w-4" />
          <span>Back to Timeline</span>
        </Link>

        <Link to={`/audit?dealId=${dealId}`} className="btn-secondary text-xs">
          <span>View Audit Log</span>
          <IconChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Edit Deadline Modal */}
      <EditDeadlineModal
        isOpen={!!editingDeadline}
        deadline={editingDeadline}
        dealId={dealId}
        onClose={() => setEditingDeadline(null)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}

