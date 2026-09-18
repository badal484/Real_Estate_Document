'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { dealsApi } from '@/services/api';
import { useDeadlines } from '@/hooks/useDeadlines';
import { Timeline } from '@/components/Timeline';
import type { Deal } from '@/types';
import { formatDate } from '@/utils/date';

export default function DealTimelinePage({ params }: { params: { id: string } }) {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [dealError, setDealError] = useState<string | null>(null);
  const { deadlines, loading, error } = useDeadlines(params.id);

  useEffect(() => {
    dealsApi
      .get(params.id)
      .then(setDeal)
      .catch((err: Error) => setDealError(err.message));
  }, [params.id]);

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link href="/deals" className="hover:text-brand-700">Deals</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{deal?.propertyAddress ?? '…'}</span>
      </nav>

      {dealError && <p className="text-red-600 text-sm mb-4">⚠ {dealError}</p>}

      {/* Deal header */}
      {deal && (
        <div className="card p-5 mb-8 flex items-start justify-between gap-4">
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

      {/* Timeline */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Deadline Timeline</h2>
      {loading && <p className="text-gray-400 text-sm">Loading deadlines…</p>}
      {error && <p className="text-red-600 text-sm">⚠ {error}</p>}
      {!loading && <Timeline deadlines={deadlines} />}

      {/* Audit link */}
      <div className="mt-8 text-right">
        <Link href={`/audit?dealId=${params.id}`} className="text-sm text-gray-400 hover:text-brand-700">
          View audit log →
        </Link>
      </div>
    </div>
  );
}
