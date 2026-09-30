import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDeadlines } from '@/hooks/useDeadlines';
import { deadlinesApi, dealsApi } from '@/services/api';
import { DeadlineCard } from '@/components/DeadlineCard';
import { DealHeader } from '@/components/deal/DealHeader';
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  FileCheck2,
  CheckCircle2,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

      {/* ── Document Verification Pipeline Visualizer ───────────────── */}
      <div className="rounded-lg border border-border bg-surface p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="space-y-0.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
              Evidence-Based Verification Pipeline
            </h2>
            <p className="text-xs text-secondary-text">
              Trace every computed milestone back to its binding contractual clause.
            </p>
          </div>
          <Badge variant="neutral" className="text-[10px] self-start sm:self-auto font-mono">
            {deadlines.length} Clauses Extracted
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-3 text-center text-xs">
          <div className="p-2 rounded bg-secondary/40 border border-border">
            <div className="flex items-center justify-center gap-1 font-semibold text-primary-text mb-0.5">
              <FileText className="h-3.5 w-3.5 text-secondary-text" />
              <span>1. Contract</span>
            </div>
            <span className="text-[10px] text-secondary-text">Executed PDF Upload</span>
          </div>

          <div className="p-2 rounded bg-secondary/40 border border-border">
            <div className="flex items-center justify-center gap-1 font-semibold text-primary-text mb-0.5">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span>2. Extraction</span>
            </div>
            <span className="text-[10px] text-secondary-text">Deterministic AI Parsing</span>
          </div>

          <div className="p-2 rounded bg-secondary/40 border border-border">
            <div className="flex items-center justify-center gap-1 font-semibold text-primary-text mb-0.5">
              <ShieldCheck className="h-3.5 w-3.5 text-success" />
              <span>3. Citation</span>
            </div>
            <span className="text-[10px] text-secondary-text">Verbatim Text Evidence</span>
          </div>

          <div className="p-2 rounded bg-secondary/40 border border-border">
            <div className="flex items-center justify-center gap-1 font-semibold text-primary-text mb-0.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              <span>4. Lock Date</span>
            </div>
            <span className="text-[10px] text-secondary-text">Agent Confirmation</span>
          </div>
        </div>
      </div>

      <div>
        <h1 className="text-xl font-bold tracking-tight text-primary-text sm:text-2xl">
          Clause &amp; Deadline Verification
        </h1>
        <p className="mt-0.5 text-xs text-secondary-text">
          Audit each AI-extracted contingency against exact verbatim contract citations. Adjust target dates or confirm to arm automated reminders.
        </p>
      </div>

      {loading && (
        <div className="rounded-lg border border-border bg-surface p-12 flex items-center justify-center gap-2 text-xs text-secondary-text shadow-2xs">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Loading extracted contract clauses...</span>
        </div>
      )}

      {error && (
        <div className="banner-error">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {confirmError && (
        <div className="banner-error">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{confirmError}</span>
        </div>
      )}

      {/* Pending — need user action */}
      {pending.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-warning">
              <AlertTriangle className="h-4 w-4" />
              <span>Requires Agent Confirmation ({pending.length})</span>
            </h2>
          </div>
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
        <section className="space-y-3 pt-2">
          <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondary-text">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span>Agent Confirmed Milestones ({confirmed.length})</span>
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
          No deadlines extracted yet. Upload a contract PDF to begin extraction.
        </div>
      )}

      <div className="pt-4 flex items-center justify-between border-t border-border">
        <Button asChild variant="secondary" size="sm" className="gap-1 text-xs">
          <Link to={`/deals/${dealId}`}>
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Back to Milestones</span>
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="gap-1 text-xs">
          <Link to={`/audit?dealId=${dealId}`}>
            <span>Audit Trail</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
