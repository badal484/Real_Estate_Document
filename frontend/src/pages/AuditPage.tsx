import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { auditApi } from '@/services/api';
import { ActivityHistory } from '@/components/ActivityHistory';
import { IconChevronRight, IconClipboardList, IconShieldCheck } from '@/components/icons';
import type { AuditLog } from '@/types';

export function AuditPage() {
  const [searchParams] = useSearchParams();
  const dealId = searchParams.get('dealId') ?? '';
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dealId) return;
    setLoading(true);
    auditApi
      .list(dealId)
      .then((r) => setLogs(r.data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [dealId]);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header & Navigation */}
      <div>
        <nav className="mb-3 flex items-center gap-2 text-xs text-slate-400">
          <Link to="/deals" className="hover:text-brand-300">Portfolio Deals</Link>
          {dealId && (
            <>
              <IconChevronRight className="h-3.5 w-3.5 text-slate-600" />
              <Link to={`/deals/${dealId}`} className="hover:text-brand-300">Deal Dashboard</Link>
            </>
          )}
          <IconChevronRight className="h-3.5 w-3.5 text-slate-600" />
          <span className="font-semibold text-slate-100">Compliance Audit Trail</span>
        </nav>
        <span className="page-eyebrow">Immutable Event Ledger</span>
        <h1 className="mt-1.5 text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <IconShieldCheck className="h-6 w-6 text-emerald-400" />
          Compliance &amp; Activity History
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Complete, tamper-evident audit log of document uploads, AI clause extractions, deadline edits, and notifications.
        </p>
      </div>

      {!dealId && (
        <div className="empty-state p-12">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-400 shadow-md">
            <IconClipboardList className="h-6 w-6" />
          </span>
          <h3 className="mt-4 text-sm font-bold text-slate-200">Select a Deal to Inspect Audit Trail</h3>
          <p className="mt-1 text-xs text-slate-400">Choose a deal from your portfolio to review its detailed event history.</p>
          <Link to="/deals" className="btn-primary mt-5 inline-flex text-xs">
            View Portfolio Deals
          </Link>
        </div>
      )}

      {dealId && (
        <ActivityHistory
          logs={logs}
          loading={loading}
          error={error}
          initialLimit={20}
          title="Deal Compliance Audit Trail"
        />
      )}
    </div>
  );
}

