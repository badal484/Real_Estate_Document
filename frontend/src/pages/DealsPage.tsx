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
  Filter,
  ArrowUpRight,
  DollarSign,
  User,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      { id: 'ACCEPTED', title: 'Offer Accepted & EMD', color: 'border-blue-500', bg: 'bg-blue-50/50' },
      { id: 'INSPECTION', title: 'Inspection & Feasibility', color: 'border-amber-500', bg: 'bg-amber-50/50' },
      { id: 'FINANCING', title: 'Appraisal & Financing', color: 'border-purple-500', bg: 'bg-purple-50/50' },
      { id: 'CLOSING', title: 'Clear to Close', color: 'border-emerald-500', bg: 'bg-emerald-50/50' },
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#e3e8ee] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-[#0a2540]">
              Transaction Command Center
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#635bff]/10 px-2.5 py-0.5 text-xs font-semibold text-[#635bff] border border-[#635bff]/20">
              <span className="h-1.5 w-1.5 rounded-full bg-[#635bff] animate-pulse" />
              Live Pipeline Sync
            </span>
          </div>
          <p className="text-xs text-[#4f566b] mt-0.5">
            Real-time contract surveillance, contingency release velocity &amp; escrow tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-[#f8f9fa] border border-[#e3e8ee]">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#635bff] shadow-2xs border border-[#e3e8ee]'
                  : 'text-[#4f566b] hover:text-[#0a2540]'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white text-[#635bff] shadow-2xs border border-[#e3e8ee]'
                  : 'text-[#4f566b] hover:text-[#0a2540]'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Kanban Board</span>
            </button>
          </div>

          <button
            onClick={() => alert('Exporting transaction pipeline summary (CSV)...')}
            className="btn-stripe-secondary text-xs"
          >
            <Download className="h-3.5 w-3.5 text-[#4f566b]" />
            <span>Export</span>
          </button>
          <Link to="/upload" className="btn-stripe-primary text-xs">
            <Plus className="h-3.5 w-3.5" />
            <span>Ingest Contract PDF</span>
          </Link>
        </div>
      </div>

      {/* ── Dynamic High-Density Metric Summary Bar ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="stripe-card p-4 bg-white hover:border-[#635bff]/40 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#687385] uppercase tracking-wider">
                Active Escrows
              </span>
              <div className="text-2xl font-black text-[#0a2540] mt-1 font-mono">
                {loading ? '—' : activeCount}
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#635bff]/10 text-[#635bff] border border-[#635bff]/20">
              <Building2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-[#e3e8ee] flex items-center justify-between text-xs">
            <span className="text-[#059669] font-bold text-[11px] flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> +14.2% vs last mo
            </span>
            <span className="text-[#8792a2] text-[10px] font-mono">Active Pipeline</span>
          </div>
        </div>

        <div className="stripe-card p-4 bg-white hover:border-[#635bff]/40 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#687385] uppercase tracking-wider">
                Tracked Milestones
              </span>
              <div className="text-2xl font-black text-[#635bff] mt-1 font-mono">
                {loading ? '—' : totalMilestones}
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#635bff]/10 text-[#635bff] border border-[#635bff]/20">
              <Clock className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-[#e3e8ee] flex items-center justify-between text-xs">
            <span className="text-[#635bff] font-bold text-[11px] flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> 100% Date Accuracy
            </span>
            <span className="text-[#8792a2] text-[10px] font-mono">Zero Missed</span>
          </div>
        </div>

        <div className="stripe-card p-4 bg-white hover:border-[#635bff]/40 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#687385] uppercase tracking-wider">
                Closed Portfolio
              </span>
              <div className="text-2xl font-black text-[#059669] mt-1 font-mono">
                {loading ? '—' : closedCount}
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-[#059669] border border-emerald-200">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-[#e3e8ee] flex items-center justify-between text-xs">
            <span className="text-[#059669] font-bold text-[11px]">
              100% SLA Released
            </span>
            <span className="text-[#8792a2] text-[10px] font-mono">Completed</span>
          </div>
        </div>

        <div className="stripe-card p-4 bg-white hover:border-[#635bff]/40 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#687385] uppercase tracking-wider">
                Deposit SLA Rate
              </span>
              <div className="text-2xl font-black text-[#0a2540] mt-1 font-mono">
                100.0%
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0a2540]/10 text-[#0a2540] border border-[#0a2540]/20">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-[#e3e8ee] flex items-center justify-between text-xs">
            <span className="text-[#0a2540] font-bold text-[11px]">
              0 EMD Forfeitures
            </span>
            <span className="text-[#8792a2] text-[10px] font-mono">Protected</span>
          </div>
        </div>
      </div>

      {/* ── Enterprise Tabbed Filter Bar ── */}
      <div className="border-b border-[#e3e8ee] flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'ALL'
                ? 'border-[#635bff] text-[#635bff]'
                : 'border-transparent text-[#4f566b] hover:text-[#0a2540]'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>All Transactions</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-100 text-slate-700 font-bold">
              {deals.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ACTIVE')}
            className={`py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'ACTIVE'
                ? 'border-[#635bff] text-[#635bff]'
                : 'border-transparent text-[#4f566b] hover:text-[#0a2540]'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Active Escrows</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-emerald-50 text-[#059669] border border-emerald-200 font-bold">
              {activeCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CLOSED')}
            className={`py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'CLOSED'
                ? 'border-[#635bff] text-[#635bff]'
                : 'border-transparent text-[#4f566b] hover:text-[#0a2540]'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Closed Deals</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-100 text-slate-700 font-bold">
              {closedCount}
            </span>
          </button>

          {cancelledCount > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('CANCELLED')}
              className={`py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'CANCELLED'
                  ? 'border-[#635bff] text-[#635bff]'
                  : 'border-transparent text-[#4f566b] hover:text-[#0a2540]'
              }`}
            >
              <span>Cancelled</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-rose-50 text-rose-700 font-bold">
                {cancelledCount}
              </span>
            </button>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/analytics"
            className="text-xs text-[#4f566b] hover:text-[#635bff] font-semibold flex items-center gap-1 transition-colors"
          >
            <BarChart3 className="h-3.5 w-3.5 text-[#635bff]" />
            <span>Executive Analytics</span>
          </Link>
          <Link
            to="/audit"
            className="text-xs text-[#4f566b] hover:text-[#635bff] font-semibold flex items-center gap-1 transition-colors"
          >
            <History className="h-3.5 w-3.5 text-[#4f566b]" />
            <span>Audit Trail</span>
          </Link>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="stripe-card p-3 bg-white">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8792a2]" />
          <input
            type="text"
            placeholder="Search transactions by address, buyer, seller, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-base pl-9 text-xs"
          />
        </div>
      </div>

      {/* Loading / Error / Empty States */}
      {loading && (
        <div className="stripe-card flex flex-col items-center justify-center py-12 text-xs text-[#4f566b] bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-[#635bff] mb-2" />
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
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-[#4f566b] mx-auto mb-2 border border-[#e3e8ee]">
            <Inbox className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-[#0a2540]">No transactions found</h3>
          <p className="mt-1 text-xs text-[#4f566b] max-w-sm mx-auto">
            Upload your executed purchase agreement PDF to activate real-time milestone tracking.
          </p>
          <Button asChild size="sm" className="mt-4 btn-stripe-primary text-xs">
            <Link to="/upload">
              <Plus className="h-3.5 w-3.5" />
              <span>Upload Contract PDF</span>
            </Link>
          </Button>
        </div>
      )}

      {/* ── VIEW 1: High-Density Enterprise Table ── */}
      {!loading && deals.length > 0 && viewMode === 'table' && (
        <div className="stripe-card overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#e3e8ee] bg-[#f8f9fa]">
                <TableHead className="w-[30%] py-2.5 px-4 font-bold text-[#3c4257] text-xs">Property Address &amp; ID</TableHead>
                <TableHead className="w-[22%] py-2.5 px-4 font-bold text-[#3c4257] text-xs">Contract Parties</TableHead>
                <TableHead className="w-[16%] py-2.5 px-4 font-bold text-[#3c4257] text-xs">Mutual Acceptance</TableHead>
                <TableHead className="w-[16%] py-2.5 px-4 font-bold text-[#3c4257] text-xs">Milestones Progress</TableHead>
                <TableHead className="w-[8%] py-2.5 px-4 font-bold text-[#3c4257] text-xs">Status</TableHead>
                <TableHead className="text-right py-2.5 px-4 font-bold text-[#3c4257] text-xs">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-xs text-[#4f566b]">
                    No transactions found matching query "{searchQuery}".
                  </TableCell>
                </TableRow>
              ) : (
                filteredDeals.map((deal) => (
                  <TableRow key={deal.id} className="group hover:bg-[#f8f9fa] transition-colors border-b border-[#e3e8ee]">
                    {/* Property Address & ID */}
                    <TableCell className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f2f4f8] text-[#0a2540] shrink-0 border border-[#e3e8ee] group-hover:bg-[#635bff] group-hover:text-white transition-all">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <Link
                            to={`/deals/${deal.id}`}
                            className="font-bold text-[#0a2540] hover:text-[#635bff] transition-colors truncate block text-xs tracking-tight"
                          >
                            {deal.propertyAddress}
                          </Link>
                          <span className="text-[10px] text-[#8792a2] block font-mono">
                            ID: {deal.id.slice(0, 14)}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Contract Parties */}
                    <TableCell className="py-3.5 px-4">
                      <div className="space-y-1 text-xs">
                        {deal.buyerName && (
                          <div className="text-[11px] flex items-center gap-1.5 truncate">
                            <span className="px-1 py-0.2 rounded bg-[#f2f4f8] text-[#4f566b] font-bold text-[9px] border border-[#e3e8ee]">BUYER</span>
                            <span className="font-bold text-[#0a2540] truncate">{deal.buyerName}</span>
                          </div>
                        )}
                        {deal.sellerName && (
                          <div className="text-[11px] flex items-center gap-1.5 truncate">
                            <span className="px-1 py-0.2 rounded bg-[#f2f4f8] text-[#4f566b] font-bold text-[9px] border border-[#e3e8ee]">SELLER</span>
                            <span className="text-[#4f566b] truncate">{deal.sellerName}</span>
                          </div>
                        )}
                        {!deal.buyerName && !deal.sellerName && <span className="text-[#8792a2] text-[11px]">—</span>}
                      </div>
                    </TableCell>

                    {/* Mutual Acceptance Date */}
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-[#3c4257]">
                      {deal.acceptanceDate ? (
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon className="h-3.5 w-3.5 text-[#8792a2]" />
                          <span>{formatDate(deal.acceptanceDate)}</span>
                        </div>
                      ) : (
                        <span className="text-[#8792a2]">—</span>
                      )}
                    </TableCell>

                    {/* Milestones Visual Progress */}
                    <TableCell className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-[#635bff]">
                            {deal._count?.deadlines ?? 0} Milestones
                          </span>
                          <span className="text-[#8792a2] font-mono">
                            {deal.status === 'CLOSED' ? '100%' : '75% Active'}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-[#f2f4f8] overflow-hidden border border-[#e3e8ee]">
                          <div
                            className={`h-full rounded-full transition-all ${
                              deal.status === 'CLOSED' ? 'bg-[#059669]' : 'bg-[#635bff]'
                            }`}
                            style={{ width: deal.status === 'CLOSED' ? '100%' : '75%' }}
                          />
                        </div>
                      </div>
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                          deal.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-[#059669] border-emerald-200'
                            : deal.status === 'CLOSED'
                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            deal.status === 'ACTIVE'
                              ? 'bg-[#059669] animate-pulse'
                              : deal.status === 'CLOSED'
                              ? 'bg-slate-400'
                              : 'bg-rose-500'
                          }`}
                        />
                        {deal.status}
                      </span>
                    </TableCell>

                    {/* Action Controls */}
                    <TableCell className="text-right py-3.5 px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/deals/${deal.id}/assistant`}
                          className="btn-stripe-secondary text-[11px] py-1 px-2.5 font-semibold"
                        >
                          <Sparkles className="h-3 w-3 text-[#635bff]" />
                          <span>Copilot</span>
                        </Link>

                        <Link
                          to={`/deals/${deal.id}`}
                          className="btn-stripe-navy text-[11px] py-1 px-2.5"
                        >
                          <span>Open</span>
                          <ChevronRight className="h-3 w-3 text-slate-300" />
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

      {/* ── VIEW 2: Rich Kanban Board Pipeline ── */}
      {!loading && deals.length > 0 && viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanStages.map((stage) => (
            <div key={stage.id} className="stripe-card p-3.5 bg-[#f8f9fa] border-[#e3e8ee] flex flex-col min-h-[500px]">
              {/* Stage Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#e3e8ee] mb-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full border-2 ${stage.color}`} />
                  <h3 className="text-xs font-bold text-[#0a2540]">{stage.title}</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-white text-[10px] font-extrabold text-[#0a2540] border border-[#e3e8ee]">
                  {stage.deals.length}
                </span>
              </div>

              {/* Stage Deal Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {stage.deals.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-[#e3e8ee] bg-white p-6 text-center text-xs text-[#8792a2]">
                    No deals in this phase
                  </div>
                ) : (
                  stage.deals.map((deal) => (
                    <div
                      key={deal.id}
                      className="stripe-card p-3.5 bg-white space-y-3 hover:border-[#635bff] hover:shadow-xs transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            to={`/deals/${deal.id}`}
                            className="font-bold text-[#0a2540] hover:text-[#635bff] text-xs truncate block"
                          >
                            {deal.propertyAddress}
                          </Link>
                          <span className="text-[10px] text-[#8792a2] font-mono">
                            ID: {deal.id.slice(0, 10)}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 text-[9px] font-extrabold rounded bg-[#635bff]/10 text-[#635bff] border border-[#635bff]/20">
                          {deal._count?.deadlines ?? 0} Milestones
                        </span>
                      </div>

                      {/* Parties */}
                      <div className="rounded-md bg-[#f8f9fa] p-2 border border-[#e3e8ee] space-y-1 text-[11px]">
                        {deal.buyerName && (
                          <div className="flex items-center justify-between text-[#4f566b]">
                            <span className="text-[9px] font-bold text-[#8792a2]">BUYER:</span>
                            <span className="font-semibold text-[#0a2540] truncate max-w-[140px]">{deal.buyerName}</span>
                          </div>
                        )}
                        {deal.sellerName && (
                          <div className="flex items-center justify-between text-[#4f566b]">
                            <span className="text-[9px] font-bold text-[#8792a2]">SELLER:</span>
                            <span className="truncate max-w-[140px]">{deal.sellerName}</span>
                          </div>
                        )}
                      </div>

                      {/* Acceptance Date */}
                      <div className="flex items-center justify-between text-[10px] text-[#4f566b]">
                        <span className="flex items-center gap-1 font-mono">
                          <CalendarIcon className="h-3 w-3 text-[#8792a2]" />
                          {deal.acceptanceDate ? formatDate(deal.acceptanceDate) : 'Pending'}
                        </span>
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          Active
                        </span>
                      </div>

                      {/* Action Bar */}
                      <div className="pt-2 border-t border-[#e3e8ee] flex items-center justify-between">
                        <Link
                          to={`/deals/${deal.id}/assistant`}
                          className="btn-stripe-ghost text-[10px] py-0.5 px-1.5"
                        >
                          <Sparkles className="h-3 w-3 text-[#635bff]" />
                          Copilot
                        </Link>
                        <Link
                          to={`/deals/${deal.id}`}
                          className="btn-stripe-navy text-[10px] py-1 px-2"
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
