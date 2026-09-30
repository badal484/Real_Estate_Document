import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { dealsApi } from '@/services/api';
import type { Deal } from '@/types';
import { formatDate } from '@/utils/date';
import {
  Building2,
  Plus,
  Search,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  FileText,
  Loader2,
  AlertTriangle,
  Inbox,
  Bell,
  ArrowUpRight,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

export function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    dealsApi
      .list()
      .then(setDeals)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const matchesSearch =
        deal.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.buyerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.sellerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || deal.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [deals, searchQuery, statusFilter]);

  const totalMilestones = useMemo(() => {
    return deals.reduce((acc, deal) => acc + (deal._count?.deadlines ?? 0), 0);
  }, [deals]);

  const activeCount = useMemo(() => {
    return deals.filter((d) => d.status === 'ACTIVE').length;
  }, [deals]);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 font-mono">
              Portfolio Surveillance
            </span>
            <Badge variant="neutral" className="glass-badge font-mono text-[10px] text-slate-700">
              {deals.length} Active Escrows
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Transactions &amp; Contingencies
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Real-time compliance surveillance, binding milestone tracking, and AI-grounded legal contract analysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="gap-1.5 h-9 text-xs shadow-sm">
            <Link to="/upload">
              <Plus className="h-4 w-4" />
              <span>New Contract Ingestion</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* ── KPI Stats Grid (Frosted Glass Cards) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4.5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Active Transactions
            </span>
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              {loading ? '—' : activeCount}
            </div>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm ring-1 ring-white/30">
            <Building2 className="h-5 w-5 text-sky-400" />
          </div>
        </div>

        <div className="glass-card p-4.5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Monitored Milestones
            </span>
            <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
              {loading ? '—' : totalMilestones}
            </div>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 border border-emerald-500/25">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card p-4.5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Automated Dispatch
            </span>
            <div className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
              <span>Resend</span>
              <span className="text-xs text-emerald-600 font-medium">● 100%</span>
            </div>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/15 text-sky-700 border border-sky-500/25">
            <Bell className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card p-4.5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              EMD Protected Rate
            </span>
            <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
              100.0%
            </div>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-700 border border-indigo-500/25">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* ── Main Table Section (Glass Panel) ── */}
      <div className="space-y-4">
        {/* Filters & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by address, buyer, seller, or deal ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input pl-9 h-9.5 text-xs w-full rounded-xl"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto p-1 rounded-xl glass-badge">
            {['ALL', 'ACTIVE', 'CLOSED', 'CANCELLED'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-slate-900 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="glass-panel rounded-2xl flex flex-col items-center justify-center py-20 text-xs text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin text-slate-800 mb-2" />
            <span>Loading transaction portfolio...</span>
          </div>
        )}

        {error && (
          <div className="banner-error">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && deals.length === 0 && (
          <div className="glass-panel rounded-2xl flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl glass-badge text-slate-500 mb-3 shadow-2xs">
              <Inbox className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">No active transactions found</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm">
              Upload your first purchase agreement or counter offer to automatically calculate contingency milestones and activate the AI Copilot.
            </p>
            <Button asChild size="sm" className="mt-4 gap-1.5 text-xs">
              <Link to="/upload">
                <Plus className="h-3.5 w-3.5" />
                <span>Upload Contract PDF</span>
              </Link>
            </Button>
          </div>
        )}

        {/* Non-empty Table */}
        {!loading && deals.length > 0 && (
          <div className="glass-panel rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200/80 bg-slate-50/50">
                  <TableHead className="w-[32%] py-3 px-4 font-semibold text-slate-700">Property &amp; ID</TableHead>
                  <TableHead className="w-[20%] py-3 px-4 font-semibold text-slate-700">Contract Parties</TableHead>
                  <TableHead className="w-[14%] py-3 px-4 font-semibold text-slate-700">Mutual Acceptance</TableHead>
                  <TableHead className="w-[12%] py-3 px-4 font-semibold text-slate-700">Milestones</TableHead>
                  <TableHead className="w-[10%] py-3 px-4 font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="text-right py-3 px-4 font-semibold text-slate-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-xs text-slate-500">
                      No transactions match your search filter "{searchQuery}".
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDeals.map((deal) => (
                    <TableRow key={deal.id} className="group hover:bg-white/80 transition-colors border-b border-slate-100">
                      <TableCell className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-slate-900 text-white group-hover:scale-105 transition-transform shrink-0 shadow-2xs">
                            <Building2 className="h-4 w-4 text-sky-400" />
                          </div>
                          <div className="min-w-0">
                            <Link
                              to={`/deals/${deal.id}`}
                              className="font-semibold text-slate-900 hover:text-sky-600 transition-colors truncate block text-xs"
                            >
                              {deal.propertyAddress}
                            </Link>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              ID: {deal.id.slice(0, 12)}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5 px-4">
                        <div className="space-y-0.5 text-xs">
                          {deal.buyerName && (
                            <div className="text-[11px] truncate">
                              <span className="text-slate-400 font-medium">B:</span>{' '}
                              <span className="font-medium text-slate-800">{deal.buyerName}</span>
                            </div>
                          )}
                          {deal.sellerName && (
                            <div className="text-[11px] truncate">
                              <span className="text-slate-400 font-medium">S:</span>{' '}
                              <span className="text-slate-500">{deal.sellerName}</span>
                            </div>
                          )}
                          {!deal.buyerName && !deal.sellerName && <span className="text-slate-400">—</span>}
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5 px-4 font-mono text-xs text-slate-800">
                        {deal.acceptanceDate ? formatDate(deal.acceptanceDate) : '—'}
                      </TableCell>

                      <TableCell className="py-3.5 px-4">
                        <Badge variant="neutral" className="glass-badge font-mono text-[11px] text-slate-700">
                          {deal._count?.deadlines ?? 0} Milestones
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3.5 px-4">
                        <Badge
                          variant={
                            deal.status === 'ACTIVE'
                              ? 'success'
                              : deal.status === 'CLOSED'
                              ? 'neutral'
                              : 'destructive'
                          }
                          className="text-[10px]"
                        >
                          {deal.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right py-3.5 px-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            asChild
                            variant="secondary"
                            size="xs"
                            className="gap-1 text-[11px] h-7.5 rounded-lg"
                          >
                            <Link to={`/deals/${deal.id}/assistant`}>
                              <Sparkles className="h-3 w-3 text-sky-600" />
                              <span>Copilot</span>
                            </Link>
                          </Button>

                          <Button
                            asChild
                            variant="outline"
                            size="xs"
                            className="gap-1 text-[11px] h-7.5 rounded-lg"
                          >
                            <Link to={`/deals/${deal.id}`}>
                              <span>Open</span>
                              <ChevronRight className="h-3 w-3 text-slate-400" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
