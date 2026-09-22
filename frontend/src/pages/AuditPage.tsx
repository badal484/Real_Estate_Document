import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { auditApi } from '@/services/api';
import { ActivityHistory } from '@/components/ActivityHistory';
import { IconChevronRight, IconClipboardList } from '@/components/icons';
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
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header & Navigation */}
      <div>
        <nav className="mb-2 flex items-center gap-2 text-sm text-slate-500">
          <Link to="/deals" className="hover:text-brand-700">Deals</Link>
          {dealId && (
            <>
              <IconChevronRight className="h-3.5 w-3.5 text-slate-300" />
              <Link to={`/deals/${dealId}`} className="hover:text-brand-700">Deal Dashboard</Link>
            </>
          )}
          <IconChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span className="font-medium text-slate-900">Audit History</span>
        </nav>
        <p className="page-eyebrow">Compliance</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Activity History</h1>
        <p className="mt-2 text-sm text-slate-500">
          Complete, immutable activity log of all document uploads, AI extractions, deadline edits, and notifications.
        </p>
      </div>

      {!dealId && (
        <div className="empty-state bg-white">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm">
            <IconClipboardList className="h-5 w-5" />
          </span>
          <p className="mt-3 text-sm text-slate-500">Select a deal to view its activity history.</p>
          <Link to="/deals" className="btn-primary mt-4 inline-flex">
            View All Deals
          </Link>
        </div>
      )}

      {dealId && (
        <ActivityHistory
          logs={logs}
          loading={loading}
          error={error}
          initialLimit={20}
          title="Deal Activity Log"
        />
      )}
    </div>
  );
}
