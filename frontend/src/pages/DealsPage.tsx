import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dealsApi } from '@/services/api';
import type { Deal } from '@/types';
import { formatDate } from '@/utils/date';
import {
  IconChevronRight,
  IconExclamationTriangle,
  IconInbox,
  IconPlus,
  IconSpinner,
  IconBuilding,
  IconSparkles,
  IconShieldCheck,
} from '@/components/icons';

const STATUS_STYLE: Record<Deal['status'], string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  CLOSED: 'bg-slate-100 text-slate-700 border-slate-200',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200/80',
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
    <div className="space-y-6 max-w-[1600px] mx-auto px-4 sm:px-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="page-eyebrow">Transaction Management</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
              {deals.length} Active Escrows
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">
            Transactions &amp; Contingencies
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time compliance, contingency deadlines, and AI-grounded contract insights.
          </p>
        </div>

        <Link to="/upload" className="btn-primary self-start sm:self-auto text-xs py-2 px-3.5">
          <IconPlus className="h-4 w-4" />
          <span>Upload New Contract</span>
        </Link>
      </div>

      {loading && (
        <div className="card flex items-center justify-center gap-2.5 py-16 text-sm text-slate-400">
          <IconSpinner className="h-5 w-5 animate-spin text-brand-600" />
          <span>Loading transactions portfolio&hellip;</span>
        </div>
      )}

      {error && (
        <div className="banner-error">
          <IconExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && deals.length === 0 && (
        <div className="empty-state">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 shadow-2xs">
            <IconInbox className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-slate-900">No active transactions</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            Upload your first purchase agreement or counter offer to automatically calculate deadlines and activate the AI Copilot.
          </p>
          <Link to="/upload" className="btn-primary mt-4 inline-flex text-xs">
            <IconPlus className="h-4 w-4" />
            <span>Upload Purchase Agreement</span>
          </Link>
        </div>
      )}

      {deals.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/90 text-slate-700 border-b border-slate-200/80 text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider">Property Address</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider">Parties</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider">Acceptance</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider">Deadlines</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-brand-50 group-hover:text-brand-700 transition-colors shrink-0">
                          <IconBuilding className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <Link
                            to={`/deals/${deal.id}`}
                            className="font-bold text-slate-900 hover:text-brand-700 transition-colors truncate block"
                          >
                            {deal.propertyAddress}
                          </Link>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            ID: {deal.id.slice(0, 10)}&hellip;
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="space-y-0.5">
                        {deal.buyerName && (
                          <div className="text-[11px]">
                            <span className="text-slate-400 font-medium">B:</span>{' '}
                            <span className="font-semibold text-slate-800">{deal.buyerName}</span>
                          </div>
                        )}
                        {deal.sellerName && (
                          <div className="text-[11px]">
                            <span className="text-slate-400 font-medium">S:</span>{' '}
                            <span className="font-medium text-slate-700">{deal.sellerName}</span>
                          </div>
                        )}
                        {!deal.buyerName && !deal.sellerName && <span>—</span>}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700 font-medium">
                      {deal.acceptanceDate ? formatDate(deal.acceptanceDate) : '—'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700 border border-slate-200">
                        {deal._count?.deadlines ?? 0} Milestones
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                          STATUS_STYLE[deal.status]
                        }`}
                      >
                        {deal.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/deals/${deal.id}/assistant`}
                          className="btn-secondary text-[11px] py-1 px-2.5 inline-flex items-center gap-1"
                          title="Ask AI Copilot"
                        >
                          <IconSparkles className="h-3 w-3 text-brand-600" />
                          <span>Copilot</span>
                        </Link>

                        <Link
                          to={`/deals/${deal.id}`}
                          className="btn-secondary text-[11px] py-1 px-2.5 inline-flex items-center gap-0.5 text-slate-700 hover:text-slate-900 font-semibold"
                        >
                          <span>View</span>
                          <IconChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

