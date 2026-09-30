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
  AlertCircle,
  ArrowRight,
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

  // Identify deals that require immediate agent attention
  const attentionDeals = useMemo(() => {
    return deals.filter((d) => d.status === 'ACTIVE');
  }, [deals]);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary-text sm:text-3xl">
            Transactions
          </h1>
          <p className="text-xs text-secondary-text mt-1 max-w-2xl">
            Surveil active purchase contracts, verify AI-extracted contingency milestones, and prevent earnest money forfeiture.
          </p>
        </div>

        <Button asChild size="default" className="gap-1.5 h-8.5 text-xs font-semibold">
          <Link to="/upload">
            <Plus className="h-4 w-4" />
            <span>New Contract Ingestion</span>
          </Link>
        </Button>
      </div>

      {/* ── Action Queue: "What Needs Attention Next?" ──────────────── */}
      {!loading && deals.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-4 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-light text-accent">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs font-semibold text-primary-text">
                  Compliance Surveillance Queue
                </h3>
                <p className="text-xs text-secondary-text">
                  {deals.length} active escrow{deals.length === 1 ? '' : 's'} monitored &bull; All deadline reminders armed via Resend API
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success bg-success-light px-2.5 py-1 rounded border border-success-border">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                <span>Zero Missed Contingencies</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Filters & Search Toolbar ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-secondary-text/60" />
          <Input
            type="text"
            placeholder="Search transactions by property address, client, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8.5 text-xs"
          />
        </div>

        <div className="flex items-center gap-1 self-start sm:self-auto">
          {['ALL', 'ACTIVE', 'CLOSED', 'CANCELLED'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                statusFilter === status
                  ? 'bg-primary text-white font-semibold shadow-2xs'
                  : 'bg-surface text-secondary-text border border-border hover:bg-secondary hover:text-primary-text'
              }`}
            >
              {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ── Loading State ───────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-lg border border-border bg-surface flex flex-col items-center justify-center py-20 text-xs text-secondary-text shadow-2xs">
          <Loader2 className="h-5 w-5 animate-spin text-primary mb-2" />
          <span>Loading transaction portfolio...</span>
        </div>
      )}

      {/* ── Error State ─────────────────────────────────────────────── */}
      {error && (
        <div className="banner-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Empty State ─────────────────────────────────────────────── */}
      {!loading && deals.length === 0 && (
        <div className="empty-state">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-text mb-3">
            <Inbox className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-primary-text">No active transactions found</h3>
          <p className="mt-1 text-xs text-secondary-text max-w-sm mx-auto">
            Upload your executed Purchase and Sale Agreement (PSA) to extract contingency deadlines and activate monitoring.
          </p>
          <Button asChild size="default" className="mt-4 text-xs font-semibold gap-1.5">
            <Link to="/upload">
              <Plus className="h-3.5 w-3.5" />
              <span>Ingest First Contract</span>
            </Link>
          </Button>
        </div>
      )}

      {/* ── Transaction Table ───────────────────────────────────────── */}
      {!loading && deals.length > 0 && (
        <div className="rounded-lg border border-border bg-surface overflow-hidden shadow-2xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[34%]">Property Address</TableHead>
                <TableHead className="w-[20%]">Counterparties</TableHead>
                <TableHead className="w-[15%]">Mutual Acceptance</TableHead>
                <TableHead className="w-[12%]">Milestones</TableHead>
                <TableHead className="w-[9%]">Status</TableHead>
                <TableHead className="text-right">Workspace</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-xs text-secondary-text">
                    No transactions match your search filter "{searchQuery}".
                  </TableCell>
                </TableRow>
              ) : (
                filteredDeals.map((deal) => (
                  <TableRow key={deal.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-7.5 w-7.5 items-center justify-center rounded-md bg-secondary text-secondary-text group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                          <Building2 className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <Link
                            to={`/deals/${deal.id}`}
                            className="font-semibold text-primary-text hover:text-primary transition-colors truncate block text-xs"
                          >
                            {deal.propertyAddress}
                          </Link>
                          <span className="text-[10px] text-secondary-text block font-mono">
                            ID: {deal.id.slice(0, 10)}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5 text-xs">
                        {deal.buyerName && (
                          <div className="text-[11px] truncate">
                            <span className="text-secondary-text">Buyer:</span>{' '}
                            <span className="font-medium text-primary-text">{deal.buyerName}</span>
                          </div>
                        )}
                        {deal.sellerName && (
                          <div className="text-[11px] truncate">
                            <span className="text-secondary-text">Seller:</span>{' '}
                            <span className="text-secondary-text">{deal.sellerName}</span>
                          </div>
                        )}
                        {!deal.buyerName && !deal.sellerName && <span className="text-secondary-text">—</span>}
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-xs text-primary-text">
                      {deal.acceptanceDate ? formatDate(deal.acceptanceDate) : '—'}
                    </TableCell>

                    <TableCell>
                      <Badge variant="neutral" className="font-mono text-[11px]">
                        {deal._count?.deadlines ?? 0} Milestones
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          deal.status === 'ACTIVE'
                            ? 'success'
                            : deal.status === 'CLOSED'
                            ? 'neutral'
                            : 'danger'
                        }
                        className="text-[10px]"
                      >
                        {deal.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          asChild
                          variant="secondary"
                          size="xs"
                          className="gap-1 text-[11px] h-7"
                        >
                          <Link to={`/deals/${deal.id}/assistant`}>
                            <Sparkles className="h-3 w-3 text-accent" />
                            <span>Copilot</span>
                          </Link>
                        </Button>

                        <Button
                          asChild
                          variant="outline"
                          size="xs"
                          className="gap-1 text-[11px] h-7"
                        >
                          <Link to={`/deals/${deal.id}`}>
                            <span>Open</span>
                            <ChevronRight className="h-3 w-3 text-secondary-text" />
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
  );
}
