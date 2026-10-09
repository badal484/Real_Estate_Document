import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dealsApi } from '@/services/api';
import type { Deal } from '@/types';
import {
  BarChart3,
  Clock,
  ShieldCheck,
  TrendingUp,
  Layers,
  DollarSign,
  Users,
  Award,
  Zap,
  Download,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

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

const MONTHLY_VOLUME_DATA = [
  { month: 'Jan', volume: 4.2, escrows: 8, closed: 6 },
  { month: 'Feb', volume: 5.8, escrows: 11, closed: 9 },
  { month: 'Mar', volume: 7.1, escrows: 14, closed: 12 },
  { month: 'Apr', volume: 6.4, escrows: 12, closed: 10 },
  { month: 'May', volume: 8.9, escrows: 17, closed: 15 },
  { month: 'Jun', volume: 10.5, escrows: 21, closed: 18 },
  { month: 'Jul', volume: 12.3, escrows: 24, closed: 21 },
];

const CONTINGENCY_BREAKDOWN = [
  { category: 'Inspection', total: 42, resolved: 39, avgDays: 7.2 },
  { category: 'Financing', total: 38, resolved: 35, avgDays: 14.8 },
  { category: 'Appraisal', total: 29, resolved: 28, avgDays: 10.4 },
  { category: 'Title/HOA', total: 24, resolved: 24, avgDays: 4.1 },
  { category: 'Insurance', total: 18, resolved: 17, avgDays: 5.6 },
];

const LEAD_SOURCE_DATA = [
  { name: 'Website Portal', value: 45, color: '#C9A961' },
  { name: 'Zillow / Realtor', value: 30, color: '#34D399' },
  { name: 'WhatsApp Bot', value: 15, color: '#818CF8' },
  { name: 'Referral Direct', value: 10, color: '#F59E0B' },
];

export function AnalyticsPage() {
  const [, setDeals] = useState<Deal[]>([]);
  const [, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    dealsApi
      .list()
      .then(setDeals)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* ── Luxury Header Controls ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-[#F5F5F7]">
              Brokerage Analytics & Intelligence
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C9A961]/10 px-2.5 py-0.5 text-xs font-medium text-[#C9A961] border border-[#C9A961]/20">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C9A961] animate-pulse" />
              Live Executive Dashboard
            </span>
          </div>
          <p className="text-xs text-[#9A9AA5] mt-1">
            Real-time pipeline velocity, escrow volume trendline, contingency speed metrics, and commission forecasting.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => alert('Exporting Analytics PDF/CSV summary...')}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-[#141418] hover:bg-white/[0.06] hover:border-white/20 text-[#F5F5F7] px-4 py-2 text-xs font-medium transition-all"
          >
            <Download className="h-3.5 w-3.5 text-[#9A9AA5]" />
            <span>Export Analytics</span>
          </button>
          <Link
            to="/organization"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#C9A961] hover:bg-[#D4B774] text-[#0A0A0B] px-4 py-2 text-xs font-semibold transition-all shadow-sm"
          >
            <Users className="h-3.5 w-3.5" />
            <span>Manage Team Seats</span>
          </Link>
        </div>
      </div>

      {/* ── Top Metric Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Speed to Lead */}
        <div className="bg-[#141418] border border-white/[0.08] rounded-xl p-4.5 relative overflow-hidden shadow-lg group hover:border-[#C9A961]/30 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-medium text-[#9A9AA5] uppercase tracking-wider">
                Avg Speed to Lead
              </span>
              <div className="text-2xl font-bold text-[#34D399] font-mono mt-1">
                14 sec
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20">
              <Zap className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-2.5 border-t border-white/[0.06]">
            <span className="text-[#34D399] font-medium text-[11px]">
              ⚡ 99.8% faster than industry avg
            </span>
            <span className="text-[#6E6E7A] text-[10px]">Real-Time AI</span>
          </div>
        </div>

        {/* Est Commission */}
        <div className="bg-[#141418] border border-white/[0.08] rounded-xl p-4.5 relative overflow-hidden shadow-lg group hover:border-[#C9A961]/30 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-medium text-[#9A9AA5] uppercase tracking-wider">
                Commission Pipeline
              </span>
              <div className="text-2xl font-bold text-[#C9A961] font-mono mt-1">
                $89,100
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C9A961]/10 text-[#C9A961] border border-[#C9A961]/20">
              <DollarSign className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-2.5 border-t border-white/[0.06]">
            <span className="text-[#C9A961] font-medium text-[11px] flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> +24% QoQ Growth
            </span>
            <span className="text-[#6E6E7A] text-[10px]">18 Deals Closed</span>
          </div>
        </div>

        {/* Hours Saved */}
        <div className="bg-[#141418] border border-white/[0.08] rounded-xl p-4.5 relative overflow-hidden shadow-lg group hover:border-[#C9A961]/30 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-medium text-[#9A9AA5] uppercase tracking-wider">
                Agent Hours Saved
              </span>
              <div className="text-2xl font-bold text-[#F5F5F7] font-mono mt-1">
                214 hrs
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] text-[#F5F5F7] border border-white/[0.08]">
              <Clock className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-2.5 border-t border-white/[0.06]">
            <span className="text-[#9A9AA5] font-medium text-[11px]">
              5.3 work weeks reclaimed
            </span>
            <span className="text-[#6E6E7A] text-[10px]">Auto-Pilot RAG</span>
          </div>
        </div>

        {/* Protection Rate */}
        <div className="bg-[#141418] border border-white/[0.08] rounded-xl p-4.5 relative overflow-hidden shadow-lg group hover:border-[#C9A961]/30 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-medium text-[#9A9AA5] uppercase tracking-wider">
                Contingency SLA Rate
              </span>
              <div className="text-2xl font-bold text-[#34D399] font-mono mt-1">
                100%
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-2.5 border-t border-white/[0.06]">
            <span className="text-[#34D399] font-medium text-[11px]">
              0 Deposit Forfeitures
            </span>
            <span className="text-[#6E6E7A] text-[10px]">Zero Missed</span>
          </div>
        </div>
      </div>

      {/* ── Interactive Recharts Graphical Analytics Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Volume Trend Area Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-[#141418] border border-white/[0.08] rounded-xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <h2 className="text-sm font-semibold text-[#F5F5F7] flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[#C9A961]" />
                Escrow Volume &amp; Transaction Growth ($M)
              </h2>
              <p className="text-[11px] text-[#9A9AA5] mt-0.5">
                Monthly total volume in escrow vs. successfully closed contract pipeline.
              </p>
            </div>
            <span className="text-[11px] font-bold text-[#C9A961] bg-[#C9A961]/10 px-2.5 py-1 rounded-md border border-[#C9A961]/20 font-mono">
              $12.3M YTD Peak
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_VOLUME_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A961" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#C9A961" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorClosed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34D399" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34D399" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6E6E7A' }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6E6E7A' }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#141418',
                    borderColor: 'rgba(255,255,255,0.12)',
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#F5F5F7',
                  }}
                  itemStyle={{ color: '#F5F5F7' }}
                />
                <Area type="monotone" dataKey="volume" name="Escrow Volume ($M)" stroke="#C9A961" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVolume)" />
                <Area type="monotone" dataKey="closed" name="Closed Count" stroke="#34D399" strokeWidth={2} fillOpacity={1} fill="url(#colorClosed)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Source Breakdown Donut Chart (1 Col) */}
        <div className="bg-[#141418] border border-white/[0.08] rounded-xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h2 className="text-sm font-semibold text-[#F5F5F7] flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-[#C9A961]" />
                Inbound Lead Attribution
              </h2>
              <span className="text-[10px] text-[#6E6E7A]">Parsed automatically</span>
            </div>

            <div className="h-56 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={LEAD_SOURCE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {LEAD_SOURCE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#141418',
                      borderColor: 'rgba(255,255,255,0.12)',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#F5F5F7',
                    }}
                    itemStyle={{ color: '#F5F5F7' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/[0.06]">
            {LEAD_SOURCE_DATA.map((source) => (
              <div key={source.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: source.color }} />
                  <span className="text-[#9A9AA5] font-medium">{source.name}</span>
                </div>
                <span className="font-mono text-[#F5F5F7] font-bold">{source.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Contingency Resolution Speed Bar Chart ── */}
      <div className="bg-[#141418] border border-white/[0.08] rounded-xl p-5 space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div>
            <h2 className="text-sm font-semibold text-[#F5F5F7] flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#C9A961]" />
              Contingency Clause Resolution Velocity
            </h2>
            <p className="text-[11px] text-[#9A9AA5] mt-0.5">
              Average resolution days vs. total processed contingencies across portfolio.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#34D399] bg-[#34D399]/10 px-2.5 py-1 rounded-md border border-[#34D399]/20 font-mono">
            Avg 8.3 Days to Release
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CONTINGENCY_BREAKDOWN} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#6E6E7A' }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6E6E7A' }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#141418',
                  borderColor: 'rgba(255,255,255,0.12)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#F5F5F7',
                }}
                itemStyle={{ color: '#F5F5F7' }}
              />
              <Bar dataKey="total" name="Total Contingencies" fill="#C9A961" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolved" name="Released / Cleared" fill="#34D399" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Conversion Funnel Card ── */}
      <div className="bg-[#141418] border border-white/[0.08] rounded-xl p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div>
            <h2 className="text-sm font-semibold text-[#F5F5F7] flex items-center gap-2 uppercase tracking-wider">
              <TrendingUp className="h-4 w-4 text-[#C9A961]" /> Inbound Lead Conversion Funnel
            </h2>
            <p className="text-xs text-[#9A9AA5] mt-0.5">
              How Apex AI Escrow Copilot converts cold website and MLS inquiries into closed commissions.
            </p>
          </div>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/25">
            22.8% Tour Conversion Rate
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
          <div className="bg-[#0D0D11] p-3.5 rounded-lg border border-white/[0.06] text-center">
            <p className="text-[10px] text-[#9A9AA5] uppercase font-semibold">1. Inbound Leads</p>
            <p className="text-xl font-bold font-mono mt-1 text-[#F5F5F7]">342</p>
            <p className="text-[10px] text-[#6E6E7A] mt-1">Web, Zillow, WhatsApp</p>
          </div>
          <div className="bg-[#0D0D11] p-3.5 rounded-lg border border-white/[0.06] text-center">
            <p className="text-[10px] text-[#9A9AA5] uppercase font-semibold">2. AI Extracted</p>
            <p className="text-xl font-bold font-mono mt-1 text-[#F5F5F7]">328</p>
            <p className="text-[10px] text-[#34D399] mt-1">95.9% Parsed</p>
          </div>
          <div className="bg-[#0D0D11] p-3.5 rounded-lg border border-white/[0.06] text-center">
            <p className="text-[10px] text-[#9A9AA5] uppercase font-semibold">3. Property Matches</p>
            <p className="text-xl font-bold font-mono mt-1 text-[#F5F5F7]">214</p>
            <p className="text-[10px] text-[#C9A961] mt-1">Matched 70%+ score</p>
          </div>
          <div className="bg-[#0D0D11] p-3.5 rounded-lg border border-white/[0.06] text-center">
            <p className="text-[10px] text-[#9A9AA5] uppercase font-semibold">4. Tours Booked</p>
            <p className="text-xl font-bold font-mono mt-1 text-[#F5F5F7]">78</p>
            <p className="text-[10px] text-amber-400 mt-1">23.8% Conversion</p>
          </div>
          <div className="bg-[#C9A961]/10 p-3.5 rounded-lg border border-[#C9A961]/30 text-center">
            <p className="text-[10px] text-[#C9A961] uppercase font-semibold">5. Deals Won</p>
            <p className="text-xl font-bold font-mono mt-1 text-[#C9A961]">18</p>
            <p className="text-[10px] text-[#C9A961]/80 mt-1">$89.1k Commission</p>
          </div>
        </div>
      </div>

      {/* ── Agent Performance Leaderboard ── */}
      <div className="bg-[#141418] border border-white/[0.08] rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#F5F5F7] flex items-center gap-2">
              <Award className="h-4 w-4 text-[#C9A961]" /> Brokerage Agent Performance Leaderboard
            </h2>
            <p className="text-xs text-[#9A9AA5] mt-0.5">Ranking agent response speed, lead handling volume, and AI auto-pilot adoption rate.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0D0D11] text-[#9A9AA5] font-semibold border-b border-white/[0.06]">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Agent Name</th>
                <th className="py-3 px-4">Speed to Lead</th>
                <th className="py-3 px-4">Leads Handled</th>
                <th className="py-3 px-4">Tours Booked</th>
                <th className="py-3 px-4">Closed Deals</th>
                <th className="py-3 px-4">Auto-Pilot %</th>
                <th className="py-3 px-4 text-right">Commission Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-[#F5F5F7]">
              {leaderboard.map((agent) => (
                <tr key={agent.rank} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-semibold">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        agent.rank === 1
                          ? 'bg-[#C9A961]/20 text-[#C9A961] border border-[#C9A961]/40'
                          : agent.rank === 2
                          ? 'bg-slate-300/20 text-slate-300 border border-slate-400/30'
                          : agent.rank === 3
                          ? 'bg-amber-700/20 text-amber-500 border border-amber-600/30'
                          : 'bg-white/5 text-[#9A9AA5]'
                      }`}
                    >
                      #{agent.rank}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#F5F5F7]">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-[#C9A961]/20 text-[#C9A961] font-semibold flex items-center justify-center text-xs border border-[#C9A961]/30">
                        {agent.avatar}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#F5F5F7]">{agent.name}</p>
                        <p className="text-[10px] text-[#6E6E7A] font-normal">{agent.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-[#34D399]/10 text-[#34D399] font-semibold text-[11px] border border-[#34D399]/20">
                      ⚡ {agent.speedToLead}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#F5F5F7]">{agent.leadsHandled}</td>
                  <td className="py-3.5 px-4 font-mono text-[#9A9AA5]">{agent.toursBooked}</td>
                  <td className="py-3.5 px-4 font-mono text-[#34D399] font-bold">{agent.dealsClosed}</td>
                  <td className="py-3.5 px-4 font-mono text-[#C9A961] font-bold">{agent.autoPilotRate}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#F5F5F7] font-mono">
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
