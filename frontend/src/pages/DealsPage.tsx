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
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary font-mono">
              Portfolio Management
            </span>
            <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[10px] font-mono font-medium text-foreground">
              {deals.length} Total Escrows
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Transactions &amp; Contingencies
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time compliance surveillance, binding contingency tracking, and AI-grounded legal analysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="gap-1.5 h-9 text-xs">
            <Link to="/upload">
              <Plus className="h-4 w-4" />
              <span>New Contract Ingestion</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/70 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Active Transactions
              </span>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {loading ? '—' : activeCount}
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Monitored Milestones
              </span>
              <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {loading ? '—' : totalMilestones}
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Automated Alerts
              </span>
              <div className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-1.5">
                <span>Resend</span>
                <span className="text-xs text-emerald-600 font-medium">● 100%</span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Bell className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                EMD Protected Rate
              </span>
              <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
                100.0%
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Section */}
      <div className="space-y-4">
        {/* Filters & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by address, buyer, seller, or deal ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs bg-background"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            {['ALL', 'ACTIVE', 'CLOSED', 'CANCELLED'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-primary text-primary-foreground shadow-2xs font-semibold'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {status === 'ALL' ? 'All Transactions' : status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="rounded-xl border border-border/70 bg-card flex flex-col items-center justify-center py-20 text-xs text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
            <span>Loading transaction portfolio...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && deals.length === 0 && (
          <div className="rounded-xl border border-border/70 bg-card flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground border border-border/60 mb-3">
              <Inbox className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">No active transactions found</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
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
          <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[32%]">Property &amp; ID</TableHead>
                  <TableHead className="w-[20%]">Contract Parties</TableHead>
                  <TableHead className="w-[14%]">Mutual Acceptance</TableHead>
                  <TableHead className="w-[12%]">Milestones</TableHead>
                  <TableHead className="w-[10%]">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-xs text-muted-foreground">
                      No transactions match your search filter "{searchQuery}".
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDeals.map((deal) => (
                    <TableRow key={deal.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <Link
                              to={`/deals/${deal.id}`}
                              className="font-semibold text-foreground hover:text-primary transition-colors truncate block text-xs"
                            >
                              {deal.propertyAddress}
                            </Link>
                            <span className="text-[10px] text-muted-foreground block font-mono">
                              ID: {deal.id.slice(0, 12)}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-0.5 text-xs">
                          {deal.buyerName && (
                            <div className="text-[11px] truncate">
                              <span className="text-muted-foreground font-medium">B:</span>{' '}
                              <span className="font-medium text-foreground">{deal.buyerName}</span>
                            </div>
                          )}
                          {deal.sellerName && (
                            <div className="text-[11px] truncate">
                              <span className="text-muted-foreground font-medium">S:</span>{' '}
                              <span className="text-muted-foreground">{deal.sellerName}</span>
                            </div>
                          )}
                          {!deal.buyerName && !deal.sellerName && <span className="text-muted-foreground">—</span>}
                        </div>
                      </TableCell>

                      <TableCell className="font-mono text-xs text-foreground">
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
                              : 'destructive'
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
                              <Sparkles className="h-3 w-3 text-primary" />
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
                              <ChevronRight className="h-3 w-3 text-muted-foreground" />
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
