'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { dealsApi } from '@/services/api';
import type { Deal } from '@/types';
import { formatDate } from '@/utils/date';

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dealsApi
      .list()
      .then(setDeals)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
        <Link href="/upload" className="btn-primary">
          + New Deal
        </Link>
      </div>

      {loading && <p className="text-gray-400 text-sm">Loading…</p>}
      {error && <p className="text-red-600 text-sm">⚠ {error}</p>}

      {!loading && deals.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-16 text-center">
          <p className="text-gray-400 text-sm">No deals yet.</p>
          <Link href="/upload" className="btn-primary mt-4 inline-flex">
            Upload your first contract
          </Link>
        </div>
      )}

      {deals.length > 0 && (
        <div className="overflow-hidden card">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Property</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Buyer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Acceptance</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Deadlines</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {deals.map((deal) => (
                <tr key={deal.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">{deal.propertyAddress}</td>
                  <td className="px-6 py-4 text-gray-500">{deal.buyerName ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {deal.acceptanceDate ? formatDate(deal.acceptanceDate) : '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{deal._count?.deadlines ?? 0}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      deal.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                      deal.status === 'CLOSED' ? 'bg-gray-100 text-gray-600' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {deal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/deals/${deal.id}`} className="text-brand-600 hover:text-brand-800 font-medium text-xs">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
