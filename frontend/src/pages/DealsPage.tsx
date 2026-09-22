import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dealsApi } from '@/services/api';
import type { Deal } from '@/types';
import { formatDate } from '@/utils/date';
import { IconChevronRight, IconExclamationTriangle, IconInbox, IconPlus, IconSpinner } from '@/components/icons';

const STATUS_STYLE: Record<Deal['status'], string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  CLOSED: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  CANCELLED: 'bg-red-50 text-red-700 ring-red-600/20',
};

export function DealsPage() {
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="page-eyebrow">Portfolio</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Deals</h1>
        </div>
        <Link to="/upload" className="btn-primary">
          <IconPlus className="h-4 w-4" />
          New Deal
        </Link>
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-8 text-sm text-slate-400">
          <IconSpinner className="h-4 w-4 animate-spin text-brand-600" />
          Loading deals&hellip;
        </div>
      )}

      {error && (
        <p className="banner-error mb-4">
          <IconExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      {!loading && deals.length === 0 && (
        <div className="empty-state">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm">
            <IconInbox className="h-5 w-5" />
          </span>
          <p className="mt-3 text-sm text-slate-500">No deals yet.</p>
          <Link to="/upload" className="btn-primary mt-4 inline-flex">
            <IconPlus className="h-4 w-4" />
            Upload your first contract
          </Link>
        </div>
      )}

      {deals.length > 0 && (
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Property</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Buyer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Acceptance</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Deadlines</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {deals.map((deal) => (
                <tr key={deal.id} className="transition-colors hover:bg-slate-50">
                  <td className="max-w-xs truncate px-6 py-4 font-medium text-slate-900">{deal.propertyAddress}</td>
                  <td className="px-6 py-4 text-slate-500">{deal.buyerName ?? '—'}</td>
                  <td className="px-6 py-4 text-slate-500">
                    {deal.acceptanceDate ? formatDate(deal.acceptanceDate) : '—'}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{deal._count?.deadlines ?? 0}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLE[deal.status]}`}>
                      {deal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/deals/${deal.id}`}
                      className="inline-flex items-center gap-0.5 text-xs font-semibold text-brand-700 hover:text-brand-900"
                    >
                      View
                      <IconChevronRight className="h-3.5 w-3.5" />
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
