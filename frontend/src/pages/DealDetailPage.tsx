import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { dealsApi, auditApi } from '@/services/api';
import { useDeadlines } from '@/hooks/useDeadlines';
import { Timeline } from '@/components/Timeline';
import { ActivityHistory } from '@/components/ActivityHistory';
import { IconChevronRight, IconExclamationTriangle, IconSpinner } from '@/components/icons';
import type { Deal, AuditLog } from '@/types';
import { formatDate } from '@/utils/date';

export function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dealId = id!;
  const [deal, setDeal] = useState<Deal | null>(null);
  const [dealError, setDealError] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [auditError, setAuditError] = useState<string | null>(null);
  const { deadlines, loading, error } = useDeadlines(dealId);

  useEffect(() => {
    dealsApi
      .get(dealId)
      .then(setDeal)
      .catch((err: Error) => setDealError(err.message));

    setAuditLoading(true);
    auditApi
      .list(dealId)
      .then((res) => setAuditLogs(res.data))
      .catch((err: Error) => setAuditError(err.message))
      .finally(() => setAuditLoading(false));
  }, [dealId]);

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500">
        <Link to="/deals" className="hover:text-brand-700">Deals</Link>
        <IconChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <span className="font-medium text-slate-900">{deal?.propertyAddress ?? '…'}</span>
      </nav>

      {dealError && (
        <p className="banner-error mb-4">
          <IconExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {dealError}
        </p>
      )}

      {/* Deal header */}
      {deal && (
        <div className="card flex items-start justify-between gap-4 p-5">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{deal.propertyAddress}</h1>
            <div className="mt-1 flex flex-wrap gap-4 text-sm text-slate-500">
              {deal.buyerName && <span>Buyer: <strong className="font-medium text-slate-700">{deal.buyerName}</strong></span>}
              {deal.sellerName && <span>Seller: <strong className="font-medium text-slate-700">{deal.sellerName}</strong></span>}
              {deal.acceptanceDate && <span>Accepted: <strong className="font-medium text-slate-700">{formatDate(deal.acceptanceDate)}</strong></span>}
            </div>
          </div>
          <Link to={`/deals/${dealId}/review`} className="btn-primary shrink-0">
            Review Deadlines
          </Link>
        </div>
      )}

      {/* Main Deadline Timeline */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Deadline Timeline</h2>
          <span className="text-xs text-slate-400">Current status &amp; scheduled dates</span>
        </div>
        {loading && (
          <div className="flex items-center gap-2 py-6 text-sm text-slate-400">
            <IconSpinner className="h-4 w-4 animate-spin text-brand-600" />
            Loading deadlines&hellip;
          </div>
        )}
        {error && (
          <p className="banner-error">
            <IconExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        )}
        {!loading && <Timeline deadlines={deadlines} />}
      </section>

      {/* Activity History / Audit Log */}
      <section className="pt-2">
        <ActivityHistory
          logs={auditLogs}
          loading={auditLoading}
          error={auditError}
          initialLimit={5}
        />
      </section>

      {/* Full Audit page link */}
      <div className="text-right">
        <Link
          to={`/audit?dealId=${dealId}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-brand-700"
        >
          <span>View complete audit history &amp; data log</span>
          <IconChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
