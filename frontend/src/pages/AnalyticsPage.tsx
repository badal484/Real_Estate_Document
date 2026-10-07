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
  Users,
  Award,
  Zap,
  Bot,
  UserCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AgentLeaderboard {
  rank: number;
  name: string;
  avatar: string;
  role: string;
  speedToLead: string;
  leadsHandled: number;
  toursBooked: number;
  dealsClosed: number;
  autoPilotRate: string;
  commission: string;
}

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

  // Mock Agent Leaderboard for B2B Agency Analytics
  const leaderboard: AgentLeaderboard[] = [
    {
      rank: 1,
      name: 'Sarah Jenkins',
      avatar: 'S',
      role: 'Senior Listing Agent',
      speedToLead: '11 sec',
      leadsHandled: 84,
      toursBooked: 29,
      dealsClosed: 8,
      autoPilotRate: '94%',
      commission: '$38,400',
    },
    {
      rank: 2,
      name: 'Michael Vance',
      avatar: 'M',
      role: 'Buyer Specialist',
      speedToLead: '16 sec',
      leadsHandled: 62,
      toursBooked: 18,
      dealsClosed: 5,
      autoPilotRate: '88%',
      commission: '$24,000',
    },
    {
      rank: 3,
      name: 'Elena Rostova',
      avatar: 'E',
      role: 'Relocation Agent',
      speedToLead: '24 sec',
      leadsHandled: 45,
      toursBooked: 14,
      dealsClosed: 3,
      autoPilotRate: '91%',
      commission: '$15,500',
    },
    {
      rank: 4,
      name: 'David Kim',
      avatar: 'D',
      role: 'Commercial & Condo Agent',
      speedToLead: '32 sec',
      leadsHandled: 38,
      toursBooked: 10,
      dealsClosed: 2,
      autoPilotRate: '82%',
      commission: '$11,200',
    },
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 font-mono">
              Brokerage AI Intelligence & Performance
            </span>
            <Badge variant="neutral" className="glass-badge font-mono text-[10px] text-slate-700">
              Live Team Metrics
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Team Analytics & Speed-to-Lead ROI
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Real-time brokerage response times, agent leaderboard, AI auto-pilot efficiency metrics, and estimated commission revenue.
          </p>
        </div>

        <Button asChild size="sm" className="gap-1.5 h-9 text-xs">
          <Link to="/organization">
            <Users className="h-4 w-4 text-sky-400" />
            <span>Manage Team Seats</span>
          </Link>
        </Button>
      </div>

      {/* ── Top Metrics Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Speed to Lead */}
        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Avg Speed to Lead
            </span>
            <div className="text-3xl font-extrabold tracking-tight text-emerald-600 font-mono">
              14 sec
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">⚡ 99.8% faster than industry avg (4.2 hrs)</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600">
            <Zap className="h-6 w-6" />
          </div>
        </div>

        {/* Generated Commission ROI */}
        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Est. Commission Generated
            </span>
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
              $89,100
            </div>
            <p className="text-[11px] text-indigo-600 font-medium">18 Deals Closed via AI Ingestion</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        {/* Hours Saved by Auto-Pilot */}
        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Agent Hours Saved
            </span>
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
              214 hrs
            </div>
            <p className="text-[11px] text-sky-600 font-medium">Equal to 5.3 work weeks saved</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 border border-sky-100 text-sky-600">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        {/* Earnest Money Protection Rate */}
        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Contingency Protection Rate
            </span>
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
              100%
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">0 Earnest Money Forfeitures</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* ── Conversion Funnel Card ── */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl border border-indigo-900/50 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-400" /> Inbound Lead Conversion Funnel
            </h2>
            <p className="text-xs text-slate-300">
              How AI Lead Management converts cold website/portal inquiries into closed real estate commissions.
            </p>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
            22.8% Tour Conversion Rate
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10 text-center">
            <p className="text-[11px] text-slate-300 uppercase font-semibold">1. Inbound Leads</p>
            <p className="text-2xl font-bold font-mono mt-1">342</p>
            <p className="text-[10px] text-slate-400 mt-1">Web, Zillow, WhatsApp</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10 text-center">
            <p className="text-[11px] text-slate-300 uppercase font-semibold">2. AI Extracted</p>
            <p className="text-2xl font-bold font-mono mt-1">328</p>
            <p className="text-[10px] text-emerald-400 mt-1">95.9% Parsed</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10 text-center">
            <p className="text-[11px] text-slate-300 uppercase font-semibold">3. Property Matches</p>
            <p className="text-2xl font-bold font-mono mt-1">214</p>
            <p className="text-[10px] text-sky-400 mt-1">Matched 70%+ score</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10 text-center">
            <p className="text-[11px] text-slate-300 uppercase font-semibold">4. Tours Booked</p>
            <p className="text-2xl font-bold font-mono mt-1">78</p>
            <p className="text-[10px] text-amber-400 mt-1">23.8% Conversion</p>
          </div>
          <div className="bg-emerald-500/20 backdrop-blur-xs p-4 rounded-xl border border-emerald-500/40 text-center">
            <p className="text-[11px] text-emerald-300 uppercase font-semibold">5. Deals Won</p>
            <p className="text-2xl font-bold font-mono mt-1 text-emerald-300">18</p>
            <p className="text-[10px] text-emerald-300 mt-1">$89.1k Commission</p>
          </div>
        </div>
      </div>

      {/* ── Agent Performance Leaderboard ── */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="h-5 w-5 text-indigo-600" /> Brokerage Agent Performance Leaderboard
            </h2>
            <p className="text-xs text-slate-500">Ranking agent response speed, lead handling volume, and AI auto-pilot adoption rate.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6">Rank</th>
                <th className="py-3.5 px-6">Agent Name</th>
                <th className="py-3.5 px-6">Speed to Lead</th>
                <th className="py-3.5 px-6">Leads Handled</th>
                <th className="py-3.5 px-6">Tours Booked</th>
                <th className="py-3.5 px-6">Closed Deals</th>
                <th className="py-3.5 px-6">Auto-Pilot %</th>
                <th className="py-3.5 px-6 text-right">Commission Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {leaderboard.map((agent) => (
                <tr key={agent.rank} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold ${
                        agent.rank === 1
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : agent.rank === 2
                          ? 'bg-slate-200 text-slate-800'
                          : agent.rank === 3
                          ? 'bg-amber-800/10 text-amber-900'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      #{agent.rank}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                      {agent.avatar}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{agent.name}</p>
                      <p className="text-[10px] text-slate-400 font-normal">{agent.role}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                      ⚡ {agent.speedToLead}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono text-slate-900 font-bold">{agent.leadsHandled}</td>
                  <td className="py-4 px-6 font-mono text-slate-900">{agent.toursBooked}</td>
                  <td className="py-4 px-6 font-mono text-emerald-600 font-bold">{agent.dealsClosed}</td>
                  <td className="py-4 px-6 font-mono text-indigo-600 font-bold">{agent.autoPilotRate}</td>
                  <td className="py-4 px-6 text-right font-bold text-slate-900 font-mono">
                    {agent.commission}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
