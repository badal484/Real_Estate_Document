'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { dealsApi, auditApi } from '@/services/api';
import { useDeadlines } from '@/hooks/useDeadlines';
import { Timeline } from '@/components/Timeline';
import { ActivityHistory } from '@/components/ActivityHistory';
import type { Deal, AuditLog } from '@/types';
import { formatDate } from '@/utils/date';

export default function DealTimelinePage({ params }: { params: { id: string } }) {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [dealError, setDealError] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [auditError, setAuditError] = useState<string | null>(null);
  const { deadlines, loading, error } = useDeadlines(params.id);

  useEffect(() => {
    dealsApi
      .get(params.id)
      .then(setDeal)
      .catch((err: Error) => setDealError(err.message));

    setAuditLoading(true);
    auditApi
      .list(params.id)
      .then((res) => setAuditLogs(res.data))
      .catch((err: Error) => setAuditError(err.message))
      .finally(() => setAuditLoading(false));
  }, [params.id]);

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4 flex items-center gap-2">
        <Link href="/deals" className="hover:text-brand-700">Deals</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{deal?.propertyAddress ?? '…'}</span>
      </nav>

      {dealError && <p className="text-red-600 text-sm mb-4">⚠ {dealError}</p>}

      {/* Deal header */}
      {deal && (
        <div className="card p-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{deal.propertyAddress}</h1>
            <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-500">
              {deal.buyerName && <span>Buyer: <strong>{deal.buyerName}</strong></span>}
              {deal.sellerName && <span>Seller: <strong>{deal.sellerName}</strong></span>}
              {deal.acceptanceDate && <span>Accepted: <strong>{formatDate(deal.acceptanceDate)}</strong></span>}
            </div>
          </div>
          <Link href={`/deals/${params.id}/review`} className="btn-primary shrink-0">
            Review Deadlines
          </Link>
        </div>
      )}

      {/* Main Deadline Timeline */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Deadline Timeline</h2>
          <span className="text-xs text-gray-400">Current status &amp; scheduled dates</span>
        </div>
        {loading && <p className="text-gray-400 text-sm">Loading deadlines…</p>}
        {error && <p className="text-red-600 text-sm">⚠ {error}</p>}
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
        <Link href={`/audit?dealId=${params.id}`} className="text-xs font-medium text-gray-500 hover:text-brand-700 inline-flex items-center gap-1">
          <span>View complete audit history &amp; data log</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
