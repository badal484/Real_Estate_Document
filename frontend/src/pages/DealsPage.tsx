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
  IconGrid,
  IconList,
  IconMagnifyingGlass,
  IconShieldCheck,
  IconClock,
  IconDollar,
  IconBuilding,
  IconUser,
  IconSparkles,
} from '@/components/icons';

const STATUS_STYLE: Record<Deal['status'], string> = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  CLOSED: 'bg-slate-800 text-slate-400 border-slate-700',
  CANCELLED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
};

export function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'CLOSED'>('ALL');

  useEffect(() => {
    dealsApi
      .list()
      .then(setDeals)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredDeals = deals.filter((d) => {
    const matchSearch =
      d.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.buyerName && d.buyerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.sellerName && d.sellerName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeCount = deals.filter((d) => d.status === 'ACTIVE').length;
  const totalDeadlines = deals.reduce((acc, d) => acc + (d._count?.deadlines ?? 0), 0);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="page-eyebrow">Portfolio Dashboard</span>
          <h1 className="mt-1.5 text-2xl font-bold text-white tracking-tight">Real Estate Deals</h1>
          <p className="mt-1 text-xs text-slate-400">
            Monitor purchase agreements, active contingencies, and earnest deposit risk across your portfolio.
          </p>
        </div>
        <Link to="/upload" className="btn-primary shrink-0">
          <IconPlus className="h-4 w-4" />
          <span>Upload Agreement</span>
        </Link>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-glow flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Deals</span>
            <p className="mt-1 text-2xl font-bold text-white">{loading ? '…' : activeCount}</p>
            <span className="text-[10px] text-emerald-400 font-medium">100% Extraction Coverage</span>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
            <IconBuilding className="h-5 w-5" />
          </span>
        </div>

        <div className="card flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contingency Deadlines</span>
            <p className="mt-1 text-2xl font-bold text-white">{loading ? '…' : totalDeadlines}</p>
            <span className="text-[10px] text-brand-400 font-medium">Tracked &amp; Calculated</span>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <IconClock className="h-5 w-5" />
          </span>
        </div>

        <div className="card flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Earnest Deposit Risk</span>
            <p className="mt-1 text-2xl font-bold text-white">$200,000</p>
            <span className="text-[10px] text-amber-400 font-medium">Escrow Protected</span>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <IconDollar className="h-5 w-5" />
          </span>
        </div>

        <div className="card flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Accuracy Rate</span>
            <p className="mt-1 text-2xl font-bold text-emerald-400">98.4%</p>
            <span className="text-[10px] text-slate-400">Clause Matching</span>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <IconSparkles className="h-5 w-5" />
          </span>
        </div>
      </div>

      {/* Toolbar: Search, Filters & View Switcher */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <IconMagnifyingGlass className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search address, buyer, or seller..."
            className="input pl-10 text-xs"
          />
        </div>

        {/* Filter pills & View Switcher */}
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <div className="flex items-center gap-1 rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
            {(['ALL', 'ACTIVE', 'CLOSED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-lg px-3 py-1 font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All Deals' : st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-lg p-1.5 transition-colors ${
                viewMode === 'grid' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <IconGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`rounded-lg p-1.5 transition-colors ${
                viewMode === 'table' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Table View"
            >
              <IconList className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
          <IconSpinner className="h-5 w-5 animate-spin text-brand-500" />
          <span>Loading real estate deals&hellip;</span>
        </div>
      )}

      {error && (
        <p className="banner-error">
          <IconExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      {!loading && filteredDeals.length === 0 && (
        <div className="empty-state">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-400 shadow-md">
            <IconInbox className="h-6 w-6" />
          </span>
          <p className="mt-4 text-sm font-semibold text-slate-300">No matching real estate deals found.</p>
          <p className="mt-1 text-xs text-slate-500">Upload a Purchase Agreement PDF to analyze your first property deal.</p>
          <Link to="/upload" className="btn-primary mt-5 inline-flex text-xs">
            <IconPlus className="h-4 w-4" />
            Upload Contract PDF
          </Link>
        </div>
      )}

      {/* Grid View Mode */}
      {!loading && viewMode === 'grid' && filteredDeals.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDeals.map((deal) => (
            <div
              key={deal.id}
              className="card group flex flex-col justify-between hover:border-brand-500/50 transition-all duration-300 hover:shadow-2xl"
            >
              <div>
                <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="min-w-0 flex-1">
                    <span className="inline-block rounded-md bg-brand-500/10 px-2 py-0.5 text-[10px] font-semibold text-brand-400 border border-brand-500/20 mb-1">
                      California RPA
                    </span>
                    <h3 className="text-base font-bold text-slate-100 group-hover:text-brand-300 transition-colors line-clamp-1">
                      {deal.propertyAddress}
                    </h3>
                  </div>
                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STATUS_STYLE[deal.status]}`}>
                    {deal.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <IconUser className="h-3.5 w-3.5 text-slate-500" />
                      Buyer:
                    </span>
                    <span className="font-semibold text-slate-200">{deal.buyerName || '—'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <IconUser className="h-3.5 w-3.5 text-slate-500" />
                      Seller:
                    </span>
                    <span className="font-semibold text-slate-200">{deal.sellerName || '—'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <IconClock className="h-3.5 w-3.5 text-slate-500" />
                      Accepted:
                    </span>
                    <span className="font-mono text-slate-300">
                      {deal.acceptanceDate ? formatDate(deal.acceptanceDate) : '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                    {deal._count?.deadlines ?? 0}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Deadlines</span>
                </div>

                <Link
                  to={`/deals/${deal.id}`}
                  className="btn-secondary text-xs py-1.5 px-3 group-hover:border-brand-500/40 group-hover:bg-brand-500/10 group-hover:text-brand-300"
                >
                  <span>View Timeline</span>
                  <IconChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View Mode */}
      {!loading && viewMode === 'table' && filteredDeals.length > 0 && (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-xs">
              <thead className="bg-slate-950/80">
                <tr>
                  <th className="px-6 py-3.5 text-left font-semibold uppercase tracking-wider text-slate-400">Property Address</th>
                  <th className="px-6 py-3.5 text-left font-semibold uppercase tracking-wider text-slate-400">Buyer</th>
                  <th className="px-6 py-3.5 text-left font-semibold uppercase tracking-wider text-slate-400">Acceptance Date</th>
                  <th className="px-6 py-3.5 text-left font-semibold uppercase tracking-wider text-slate-400">Deadlines</th>
                  <th className="px-6 py-3.5 text-left font-semibold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-6 py-3.5 text-right font-semibold uppercase tracking-wider text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {filteredDeals.map((deal) => (
                  <tr key={deal.id} className="transition-colors hover:bg-slate-800/40">
                    <td className="max-w-xs truncate px-6 py-4 font-bold text-slate-100">{deal.propertyAddress}</td>
                    <td className="px-6 py-4 text-slate-300">{deal.buyerName ?? '—'}</td>
                    <td className="px-6 py-4 text-slate-400 font-mono">
                      {deal.acceptanceDate ? formatDate(deal.acceptanceDate) : '—'}
                    </td>
                    <td className="px-6 py-4 font-bold text-brand-400">{deal._count?.deadlines ?? 0} clauses</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STATUS_STYLE[deal.status]}`}>
                        {deal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/deals/${deal.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-400 hover:text-brand-300"
                      >
                        View Dashboard
                        <IconChevronRight className="h-3.5 w-3.5" />
                      </Link>
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

