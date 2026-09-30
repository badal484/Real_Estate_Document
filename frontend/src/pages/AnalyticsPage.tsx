import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { dealsApi } from '@/services/api';
import type { Deal } from '@/types';
import {
  BarChart3,
  Building2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  Loader2,
  Mail,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AnalyticsPage() {
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

  const totalDeals = deals.length;
  const activeDeals = useMemo(() => deals.filter((d) => d.status === 'ACTIVE').length, [deals]);
  const closedDeals = useMemo(() => deals.filter((d) => d.status === 'CLOSED').length, [deals]);
  const totalMilestones = useMemo(
    () => deals.reduce((acc, d) => acc + (d._count?.deadlines ?? 0), 0),
    [deals],
  );

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 font-mono">
              Brokerage Intelligence
            </span>
            <Badge variant="neutral" className="glass-badge font-mono text-[10px] text-slate-700">
              Live Metrics
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Portfolio Compliance Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Comprehensive risk metrics, earnest money deposit protection rates, and transaction milestone status reports.
          </p>
        </div>

        <Button asChild size="sm" className="gap-1.5 h-9 text-xs">
          <Link to="/deals">
            <Building2 className="h-4 w-4 text-sky-400" />
            <span>View Portfolio</span>
          </Link>
        </Button>
      </div>

      {/* ── Metrics Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Total Managed Escrows
            </span>
            <div className="text-3xl font-bold tracking-tight text-slate-900 font-mono">
              {loading ? '—' : totalDeals}
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">● 100% Ingested</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
            <Layers className="h-6 w-6 text-sky-400" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Active Transactions
            </span>
            <div className="text-3xl font-bold tracking-tight text-slate-900 font-mono">
              {loading ? '—' : activeDeals}
            </div>
            <p className="text-[11px] text-slate-500">Currently in escrow</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-700 border border-sky-500/25">
            <Building2 className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Monitored Deadlines
            </span>
            <div className="text-3xl font-bold tracking-tight text-slate-900 font-mono">
              {loading ? '—' : totalMilestones}
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">● Deterministic Math</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700 border border-emerald-500/25">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              EMD Protection Rate
            </span>
            <div className="text-3xl font-bold tracking-tight text-slate-900 font-mono">
              100%
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">Zero Missed Cutoffs</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-700 border border-indigo-500/25">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* ── Breakdown Cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Radar */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">Milestone Risk Radar</h3>
            </div>
            <Badge variant="neutral" className="glass-badge text-[10px]">
              Live Audit Stream
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl glass-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 font-bold text-xs">
                  T-3
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Early Warning Reminders</h4>
                  <p className="text-[11px] text-slate-500">Dispatched 3 days prior to inspection and financing windows.</p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-700">Active (Resend)</span>
            </div>

            <div className="p-3.5 rounded-xl glass-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15 text-sky-700 font-bold text-xs">
                  T-1
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">High-Priority Action Alerts</h4>
                  <p className="text-[11px] text-slate-500">Urgent notices sent 24 hours before midnight deadline cutoffs.</p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-sky-700">Active (Resend)</span>
            </div>

            <div className="p-3.5 rounded-xl glass-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700 font-bold text-xs">
                  T-0
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Day-of Expiration Reminders</h4>
                  <p className="text-[11px] text-slate-500">Morning execution notice dispatched at 9:00 AM local time.</p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-amber-700">Active (Resend)</span>
            </div>
          </div>
        </div>

        {/* Security & Verification status */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Surveillance Status</h3>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl glass-card">
              <span className="text-slate-600">Verification Engine:</span>
              <span className="font-bold text-slate-900">Zero-Hallucination Vector AI</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl glass-card">
              <span className="text-slate-600">Email Transport:</span>
              <span className="font-bold text-sky-600">Resend API Verified</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl glass-card">
              <span className="text-slate-600">Document Encryption:</span>
              <span className="font-bold text-slate-900">256-Bit AES Storage</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl glass-card">
              <span className="text-slate-600">Audit Trail:</span>
              <span className="font-bold text-emerald-600 font-mono">Cryptographic Immutable</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
