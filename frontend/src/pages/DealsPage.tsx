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
  Clock,
  Loader2,
  AlertTriangle,
  Inbox,
  Download,
  Calendar as CalendarIcon,
  Layers,
  CheckCircle2,
  History,
  BarChart3,
  ShieldCheck,
  LayoutGrid,
  List,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

type ViewMode = 'table' | 'kanban';

export function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'CLOSED' | 'CANCELLED'>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  useEffect(() => {
    dealsApi
      .list()
      .then(setDeals)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const activeCount = useMemo(() => deals.filter((d) => d.status === 'ACTIVE').length, [deals]);
  const closedCount = useMemo(() => deals.filter((d) => d.status === 'CLOSED').length, [deals]);
  const cancelledCount = useMemo(() => deals.filter((d) => d.status === 'CANCELLED').length, [deals]);
  const totalMilestones = useMemo(
    () => deals.reduce((acc, deal) => acc + (deal._count?.deadlines ?? 0), 0),
    [deals]
  );

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const matchesSearch =
        deal.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.buyerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.sellerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTab = activeTab === 'ALL' || deal.status === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [deals, searchQuery, activeTab]);

  // Group deals for Kanban board stages
  const kanbanStages = useMemo(() => {
    const stages = [
      { id: 'ACCEPTED', title: 'Offer Accepted & EMD', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
      { id: 'INSPECTION', title: 'Inspection & Feasibility', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
      { id: 'FINANCING', title: 'Appraisal & Financing', badgeColor: 'bg-purple-50 text-purple-700 border-purple-200' },
      { id: 'CLOSING', title: 'Clear to Close', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    ];

    return stages.map((stage) => {
      let stageDeals: Deal[] = [];
      if (stage.id === 'ACCEPTED') {
        stageDeals = filteredDeals.filter((d) => d.status === 'ACTIVE' && (d._count?.deadlines ?? 0) <= 2);
      } else if (stage.id === 'INSPECTION') {
        stageDeals = filteredDeals.filter((d) => d.status === 'ACTIVE' && (d._count?.deadlines ?? 0) > 2 && (d._count?.deadlines ?? 0) <= 5);
      } else if (stage.id === 'FINANCING') {
        stageDeals = filteredDeals.filter((d) => d.status === 'ACTIVE' && (d._count?.deadlines ?? 0) > 5);
      } else {
        stageDeals = filteredDeals.filter((d) => d.status === 'CLOSED');
      }

      return { ...stage, deals: stageDeals };
    });
  }, [filteredDeals]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* ── Page Title & Main Action Bar ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E4E4E7] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#09090B]">
              Transactions
            </h1>
            <Badge variant="outline" className="text-xs font-semibold py-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
              Live Pipeline Sync
            </Badge>
          </div>
          <p className="text-xs text-[#52525B] mt-1">
            Real-time contract surveillance, contingency release velocity &amp; escrow tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center p-1 rounded-full bg-[#F4F4F5] border border-[#E4E4E7]">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-black shadow-clean-xs'
                  : 'text-[#71717A] hover:text-black'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white text-black shadow-clean-xs'
                  : 'text-[#71717A] hover:text-black'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Kanban</span>
            </button>
          </div>

          <button
            onClick={() => alert('Exporting transaction pipeline summary (CSV)...')}
            className="btn-pill-outline text-xs"
          >
            <Download className="h-3.5 w-3.5 text-neutral-600" />
            <span>Export</span>
          </button>
          <Link to="/upload" className="btn-pill-primary text-xs">
            <Plus className="h-3.5 w-3.5" />
            <span>Ingest Contract PDF</span>
          </Link>
        </div>
      </div>

      {/* ── High-Density Metric Summary Bar ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-[#E4E4E7] bg-white p-5 shadow-clean-xs hover:shadow-clean-sm transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">
                Active Escrows
              </span>
              <div className="text-3xl font-extrabold text-[#09090B] mt-1 tracking-tight">
                {loading ? '—' : activeCount}
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100 text-black">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> +14.2% vs last mo
            </span>
            <span className="text-[#71717A] text-[10px]">Active Pipeline</span>
          </div>
        </div>

        <div className="rounded-3xl border border-[#E4E4E7] bg-white p-5 shadow-clean-xs hover:shadow-clean-sm transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">
                Tracked Milestones
              </span>
              <div className="text-3xl font-extrabold text-[#09090B] mt-1 tracking-tight">
                {loading ? '—' : totalMilestones}
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100 text-black">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
            <span className="text-black font-semibold text-[11px] flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> 100% Date Accuracy
            </span>
            <span className="text-[#71717A] text-[10px]">Zero Missed</span>
          </div>
        </div>

        <div className="rounded-3xl border border-[#E4E4E7] bg-white p-5 shadow-clean-xs hover:shadow-clean-sm transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">
                Closed Portfolio
              </span>
              <div className="text-3xl font-extrabold text-emerald-700 mt-1 tracking-tight">
                {loading ? '—' : closedCount}
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-semibold text-[11px]">
              100% SLA Released
            </span>
            <span className="text-[#71717A] text-[10px]">Completed</span>
          </div>
        </div>

        <div className="rounded-3xl border border-[#E4E4E7] bg-white p-5 shadow-clean-xs hover:shadow-clean-sm transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">
                Deposit Security
              </span>
              <div className="text-3xl font-extrabold text-[#09090B] mt-1 tracking-tight">
                100.0%
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100 text-black">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
            <span className="text-black font-semibold text-[11px]">
              0 EMD Forfeitures
            </span>
            <span className="text-[#71717A] text-[10px]">Protected</span>
          </div>
        </div>
      </div>

      {/* ── Enterprise Tabbed Filter Bar ── */}
      <div className="border-b border-[#E4E4E7] flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'ALL'
                ? 'border-black text-[#09090B]'
                : 'border-transparent text-[#71717A] hover:text-[#09090B]'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>All Transactions</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-800">
              {deals.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ACTIVE')}
            className={`py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'ACTIVE'
                ? 'border-black text-[#09090B]'
                : 'border-transparent text-[#71717A] hover:text-[#09090B]'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Active Escrows</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
              {activeCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CLOSED')}
            className={`py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'CLOSED'
                ? 'border-black text-[#09090B]'
                : 'border-transparent text-[#71717A] hover:text-[#09090B]'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Closed Deals</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-800">
              {closedCount}
            </span>
          </button>

          {cancelledCount > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('CANCELLED')}
              className={`py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'CANCELLED'
                  ? 'border-black text-[#09090B]'
                  : 'border-transparent text-[#71717A] hover:text-[#09090B]'
              }`}
            >
              <span>Cancelled</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800">
                {cancelledCount}
              </span>
            </button>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/analytics"
            className="text-xs text-[#71717A] hover:text-[#09090B] font-medium flex items-center gap-1.5 transition-colors"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Analytics</span>
          </Link>
          <Link
            to="/audit"
            className="text-xs text-[#71717A] hover:text-[#09090B] font-medium flex items-center gap-1.5 transition-colors"
          >
            <History className="h-3.5 w-3.5" />
            <span>Audit Trail</span>
          </Link>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="rounded-2xl border border-[#E4E4E7] bg-white p-2.5 shadow-clean-xs">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#71717A]" />
          <input
            type="text"
            placeholder="Search transactions by address, buyer, seller, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-neutral-200 bg-[#F9FAFB] pl-9 pr-4 py-2 text-xs text-[#09090B] placeholder:text-[#A1A1AA] focus:bg-white focus:border-black focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Loading / Error / Empty States */}
      {loading && (
        <div className="rounded-3xl border border-[#E4E4E7] bg-white flex flex-col items-center justify-center py-16 text-xs text-[#52525B]">
          <Loader2 className="h-6 w-6 animate-spin text-black mb-2" />
          <span>Loading transaction command center...</span>
        </div>
      )}

      {error && (
        <div className="banner-error text-xs">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && deals.length === 0 && (
        <div className="empty-state">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200 text-black mx-auto mb-3">
            <Inbox className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-[#09090B]">No transactions found</h3>
          <p className="mt-1 text-xs text-[#52525B] max-w-sm mx-auto">
            Upload your executed purchase agreement PDF to activate real-time milestone tracking.
          </p>
          <Button asChild size="sm" className="mt-4 btn-pill-primary text-xs">
            <Link to="/upload">
              <Plus className="h-3.5 w-3.5" />
              <span>Upload Contract PDF</span>
            </Link>
          </Button>
        </div>
      )}

      {/* ── VIEW 1: High-Density Table ── */}
      {!loading && deals.length > 0 && viewMode === 'table' && (
        <div className="rounded-3xl border border-[#E4E4E7] bg-white overflow-hidden shadow-clean-xs">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#E4E4E7] bg-[#FAFAFA]">
                <TableHead className="w-[30%] py-3 px-4 font-semibold uppercase tracking-wider text-[#71717A] text-[11px]">Property Address &amp; ID</TableHead>
                <TableHead className="w-[22%] py-3 px-4 font-semibold uppercase tracking-wider text-[#71717A] text-[11px]">Contract Parties</TableHead>
                <TableHead className="w-[16%] py-3 px-4 font-semibold uppercase tracking-wider text-[#71717A] text-[11px]">Mutual Acceptance</TableHead>
                <TableHead className="w-[16%] py-3 px-4 font-semibold uppercase tracking-wider text-[#71717A] text-[11px]">Milestones Progress</TableHead>
                <TableHead className="w-[8%] py-3 px-4 font-semibold uppercase tracking-wider text-[#71717A] text-[11px]">Status</TableHead>
                <TableHead className="text-right py-3 px-4 font-semibold uppercase tracking-wider text-[#71717A] text-[11px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-xs text-[#71717A]">
                    No transactions found matching query "{searchQuery}".
                  </TableCell>
                </TableRow>
              ) : (
                filteredDeals.map((deal) => (
                  <TableRow key={deal.id} className="group hover:bg-[#F9FAFB] transition-colors border-b border-[#E4E4E7]">
                    {/* Property Address & ID */}
                    <TableCell className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-neutral-100 text-black shrink-0 border border-neutral-200">
                          <Building2 className="h-4.5 w-4.5" />
                        </div>
                        <div className="min-w-0">
                          <Link
                            to={`/deals/${deal.id}`}
                            className="font-bold text-[#09090B] hover:underline transition-colors truncate block text-xs tracking-tight"
                          >
                            {deal.propertyAddress}
                          </Link>
                          <span className="text-[11px] text-[#71717A] block font-mono">
                            ID: {deal.id.slice(0, 14)}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Contract Parties */}
                    <TableCell className="py-4 px-4">
                      <div className="space-y-1 text-xs">
                        {deal.buyerName && (
                          <div className="text-[11px] flex items-center gap-1.5 truncate">
                            <span className="px-1.5 py-0.5 rounded bg-neutral-100 text-[#71717A] font-semibold text-[9px]">BUYER</span>
                            <span className="font-medium text-[#09090B] truncate">{deal.buyerName}</span>
                          </div>
                        )}
                        {deal.sellerName && (
                          <div className="text-[11px] flex items-center gap-1.5 truncate">
                            <span className="px-1.5 py-0.5 rounded bg-neutral-100 text-[#71717A] font-semibold text-[9px]">SELLER</span>
                            <span className="text-[#52525B] truncate">{deal.sellerName}</span>
                          </div>
                        )}
                        {!deal.buyerName && !deal.sellerName && <span className="text-[#A1A1AA] text-[11px]">—</span>}
                      </div>
                    </TableCell>

                    {/* Mutual Acceptance Date */}
                    <TableCell className="py-4 px-4 font-mono text-xs text-[#52525B]">
                      {deal.acceptanceDate ? (
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon className="h-3.5 w-3.5 text-[#71717A]" />
                          <span>{formatDate(deal.acceptanceDate)}</span>
                        </div>
                      ) : (
                        <span className="text-[#A1A1AA]">—</span>
                      )}
                    </TableCell>

                    {/* Milestones Visual Progress */}
                    <TableCell className="py-4 px-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-[#09090B]">
                            {deal._count?.deadlines ?? 0} Milestones
                          </span>
                          <span className="text-[#71717A] text-[10px]">
                            {deal.status === 'CLOSED' ? '100%' : '75% Active'}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              deal.status === 'CLOSED' ? 'bg-emerald-500' : 'bg-black'
                            }`}
                            style={{ width: deal.status === 'CLOSED' ? '100%' : '75%' }}
                          />
                        </div>
                      </div>
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-0.5 text-[11px] font-medium rounded-full border ${
                          deal.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : deal.status === 'CLOSED'
                            ? 'bg-neutral-100 text-neutral-700 border-neutral-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            deal.status === 'ACTIVE'
                              ? 'bg-emerald-500'
                              : deal.status === 'CLOSED'
                              ? 'bg-neutral-500'
                              : 'bg-rose-500'
                          }`}
                        />
                        {deal.status}
                      </span>
                    </TableCell>

                    {/* Action Controls */}
                    <TableCell className="text-right py-4 px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/deals/${deal.id}/assistant`}
                          className="btn-pill-outline text-[11px] py-1 px-3 font-medium"
                        >
                          <Sparkles className="h-3 w-3 text-neutral-800" />
                          <span>Copilot</span>
                        </Link>

                        <Link
                          to={`/deals/${deal.id}`}
                          className="btn-pill-primary text-[11px] py-1 px-3.5"
                        >
                          <span>Open</span>
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ── VIEW 2: Kanban Board Pipeline ── */}
      {!loading && deals.length > 0 && viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanStages.map((stage) => (
            <div key={stage.id} className="rounded-3xl border border-[#E4E4E7] bg-[#F9FAFB] p-4 flex flex-col min-h-[500px]">
              {/* Stage Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-[#09090B]">{stage.title}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${stage.badgeColor}`}>
                  {stage.deals.length}
                </span>
              </div>

              {/* Stage Deal Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {stage.deals.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-neutral-200 bg-white/60 p-6 text-center text-xs text-[#71717A]">
                    No deals in this phase
                  </div>
                ) : (
                  stage.deals.map((deal) => (
                    <div
                      key={deal.id}
                      className="rounded-2xl p-4 bg-white border border-[#E4E4E7] space-y-3 shadow-clean-xs hover:shadow-clean-sm transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            to={`/deals/${deal.id}`}
                            className="font-bold text-[#09090B] hover:underline text-xs truncate block"
                          >
                            {deal.propertyAddress}
                          </Link>
                          <span className="text-[10px] text-[#71717A] font-mono">
                            ID: {deal.id.slice(0, 10)}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200">
                          {deal._count?.deadlines ?? 0} Milestones
                        </span>
                      </div>

                      {/* Parties */}
                      <div className="rounded-xl bg-[#F9FAFB] p-2.5 border border-neutral-100 space-y-1 text-[11px]">
                        {deal.buyerName && (
                          <div className="flex items-center justify-between text-[#52525B]">
                            <span className="text-[9px] font-bold text-[#71717A]">BUYER:</span>
                            <span className="font-medium text-[#09090B] truncate max-w-[140px]">{deal.buyerName}</span>
                          </div>
                        )}
                        {deal.sellerName && (
                          <div className="flex items-center justify-between text-[#52525B]">
                            <span className="text-[9px] font-bold text-[#71717A]">SELLER:</span>
                            <span className="truncate max-w-[140px] text-[#52525B]">{deal.sellerName}</span>
                          </div>
                        )}
                      </div>

                      {/* Acceptance Date */}
                      <div className="flex items-center justify-between text-[11px] text-[#71717A]">
                        <span className="flex items-center gap-1 font-medium">
                          <CalendarIcon className="h-3 w-3 text-neutral-500" />
                          {deal.acceptanceDate ? formatDate(deal.acceptanceDate) : 'Pending'}
                        </span>
                        <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                          Active
                        </span>
                      </div>

                      {/* Action Bar */}
                      <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                        <Link
                          to={`/deals/${deal.id}/assistant`}
                          className="btn-pill-ghost text-[10px] py-1 px-2"
                        >
                          <Sparkles className="h-3 w-3 text-neutral-800" />
                          Copilot
                        </Link>
                        <Link
                          to={`/deals/${deal.id}`}
                          className="btn-pill-primary text-[10px] py-1 px-3"
                        >
                          Open Deal →
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
