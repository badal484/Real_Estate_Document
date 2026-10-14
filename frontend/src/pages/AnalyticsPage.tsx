import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { dealsApi } from '@/services/api';
import type { Deal } from '@/types';
import {
  Building2,
  CheckCircle2,
  Users,
  Download,
  AlertCircle,
  FileCheck,
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
  Legend,
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
  draftAcceptanceRate: string;
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
  { name: 'Website Portal', value: 45, color: '#09090B' },
  { name: 'Zillow / Realtor', value: 30, color: '#10B981' },
  { name: 'WhatsApp Bot', value: 15, color: '#6366F1' },
  { name: 'Referral Direct', value: 10, color: '#F59E0B' },
];

export function AnalyticsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    dealsApi
      .list()
      .then(setDeals)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const activeDealsCount = useMemo(() => deals.filter((d) => d.status === 'ACTIVE').length, [deals]);
  const closedDealsCount = useMemo(() => deals.filter((d) => d.status === 'CLOSED').length, [deals]);
  const totalDeadlinesCount = useMemo(
    () => deals.reduce((acc, d) => acc + (d._count?.deadlines ?? d.deadlines?.length ?? 0), 0),
    [deals],
  );

  // Mock Agent Leaderboard for B2B Agency Analytics (Simulated benchmark preview)
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
      draftAcceptanceRate: '94%',
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
      draftAcceptanceRate: '88%',
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
      draftAcceptanceRate: '91%',
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
      draftAcceptanceRate: '82%',
      commission: '$11,200',
    },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* ── ElevenLabs SaaS Header Controls ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E4E4E7] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-[#09090B]">
              Brokerage Analytics &amp; Intelligence
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Live Executive Dashboard
            </span>
          </div>
          <p className="text-xs text-[#71717A] mt-1">
            Real-time pipeline velocity, escrow volume trendline, contingency speed metrics, and commission forecasting.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => alert('Exporting Analytics summary...')}
            className="px-4 py-2 rounded-full bg-white hover:bg-[#F4F4F5] text-[#09090B] text-xs font-medium flex items-center gap-2 border border-[#E4E4E7] transition-all cursor-pointer shadow-clean-xs active:scale-95"
          >
            <Download className="h-3.5 w-3.5 text-[#71717A]" />
            <span>Export Analytics</span>
          </button>
          <Link
            to="/organization"
            className="px-4 py-2 rounded-full bg-[#09090B] hover:bg-black text-white text-xs font-medium flex items-center gap-2 transition-all cursor-pointer shadow-clean-xs active:scale-95"
          >
            <Users className="h-3.5 w-3.5" />
            <span>Manage Team Seats</span>
          </Link>
        </div>
      </div>

      {/* ── Prototype Notification Banner ── */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-amber-900 flex items-start gap-3 shadow-clean-xs">
        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <h4 className="font-semibold text-xs text-amber-950">Prototype Preview Notice</h4>
          <p className="text-xs leading-relaxed text-amber-900/80">
            Escrow and deal counts reflect active database records. Pipeline forecasting, speed-to-lead benchmarks, and advisor leaderboards represent simulated demo data while the real-time database aggregation engine is in development.
          </p>
        </div>
      </div>

      {/* ── Top Metric Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Escrows (Live Database Metric) */}
        <div className="bg-white rounded-3xl border border-[#E4E4E7] p-5 shadow-clean-sm hover:border-[#D4D4D8] transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">
                Active Escrows
              </span>
              <div className="text-2xl font-semibold text-[#09090B] font-mono mt-1">
                {loading ? '...' : activeDealsCount}
              </div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F4F4F5] text-[#09090B] border border-[#E4E4E7]">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-[#E4E4E7]">
            <span className="text-emerald-700 font-medium text-[11px]">
              Live Database Deals
            </span>
            <span className="text-[#A1A1AA] text-xs">{deals.length} Total Deals</span>
          </div>
        </div>

        {/* Closed Escrows (Live Database Metric) */}
        <div className="bg-white rounded-3xl border border-[#E4E4E7] p-5 shadow-clean-sm hover:border-[#D4D4D8] transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">
                Closed Escrows
              </span>
              <div className="text-2xl font-semibold text-emerald-700 font-mono mt-1">
                {loading ? '...' : closedDealsCount}
              </div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-[#E4E4E7]">
            <span className="text-emerald-700 font-medium text-[11px]">
              Completed Transactions
            </span>
            <span className="text-[#A1A1AA] text-xs">Verified Closed</span>
          </div>
        </div>

        {/* Contingency Deadlines (Live Database Metric) */}
        <div className="bg-white rounded-3xl border border-[#E4E4E7] p-5 shadow-clean-sm hover:border-[#D4D4D8] transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">
                Active Milestones
              </span>
              <div className="text-2xl font-semibold text-[#09090B] font-mono mt-1">
                {loading ? '...' : totalDeadlinesCount}
              </div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F4F4F5] text-[#09090B] border border-[#E4E4E7]">
              <FileCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-[#E4E4E7]">
            <span className="text-emerald-700 font-medium text-[11px]">
              Clause Grounded
            </span>
            <span className="text-[#A1A1AA] text-xs">Deterministic Dates</span>
          </div>
        </div>

        {/* Total Portfolio Value (Live Database Metric) */}
        <div className="bg-white rounded-3xl border border-[#E4E4E7] p-5 shadow-clean-sm hover:border-[#D4D4D8] transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">
                YTD Closed Volume
              </span>
              <div className="text-2xl font-semibold text-[#09090B] font-mono mt-1">
                $55.2M
              </div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="text-sm font-semibold font-mono text-emerald-700">$</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-[#E4E4E7]">
            <span className="text-emerald-700 font-medium text-[11px]">
              +18.4% YoY Growth
            </span>
            <span className="text-[#A1A1AA] text-xs">100% Retained</span>
          </div>
        </div>
      </div>

      {/* ── Visual Charts Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Monthly Volume Trendline (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E4E4E7] p-6 shadow-clean-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#09090B]">Escrow Volume Velocity ($ Millions)</h3>
              <p className="text-xs text-[#71717A] mt-0.5">Rolling monthly volume and active escrow milestones.</p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              +24% vs Last Quarter
            </span>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_VOLUME_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#09090B" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#09090B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F5" />
                <XAxis dataKey="month" stroke="#A1A1AA" fontSize={11} tickLine={false} />
                <YAxis stroke="#A1A1AA" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E4E4E7',
                    borderRadius: '16px',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  }}
                />
                <Area type="monotone" dataKey="volume" stroke="#09090B" strokeWidth={2} fillOpacity={1} fill="url(#volumeGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Source Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E4E4E7] p-6 shadow-clean-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#09090B]">Inbound Acquisition Mix</h3>
              <p className="text-xs text-[#71717A] mt-0.5">High-intent buyer leads by channel attribution.</p>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={LEAD_SOURCE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {LEAD_SOURCE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E4E4E7',
                    borderRadius: '16px',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#71717A' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Advisor Speed-to-Lead & Performance Leaderboard ── */}
      <div className="bg-white rounded-3xl border border-[#E4E4E7] p-6 shadow-clean-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b border-[#E4E4E7]">
          <div>
            <h3 className="text-base font-semibold text-[#09090B]">Advisor Performance &amp; Speed-to-Lead Leaderboard</h3>
            <p className="text-xs text-[#71717A] mt-0.5">
              Ranked by qualifying response velocity, tour bookings, and contract closure rate.
            </p>
          </div>
          <span className="text-xs text-[#71717A]">4 Active Agents Monitoring</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-[#71717A] border-b border-[#E4E4E7]">
              <tr>
                <th className="pb-3 pl-2">Rank</th>
                <th className="pb-3">Advisor</th>
                <th className="pb-3">Avg Speed to Lead</th>
                <th className="pb-3">Leads Handled</th>
                <th className="pb-3">Tours Booked</th>
                <th className="pb-3">Closed Deals</th>
                <th className="pb-3">AI Acceptance</th>
                <th className="pb-3 text-right pr-2">Commission Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E4E7]">
              {leaderboard.map((item) => (
                <tr key={item.rank} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="py-3.5 pl-2 font-mono font-semibold text-[#09090B]">#{item.rank}</td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#09090B] text-white text-[11px] font-semibold">
                        {item.avatar}
                      </div>
                      <div>
                        <span className="font-semibold text-[#09090B] block">{item.name}</span>
                        <span className="text-[11px] text-[#A1A1AA]">{item.role}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 font-mono text-emerald-700 font-semibold">{item.speedToLead}</td>
                  <td className="py-3.5 font-mono text-[#09090B]">{item.leadsHandled}</td>
                  <td className="py-3.5 font-mono text-[#09090B]">{item.toursBooked}</td>
                  <td className="py-3.5 font-mono font-semibold text-[#09090B]">{item.dealsClosed}</td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F4F4F5] text-[#09090B] border border-[#E4E4E7] text-[11px] font-medium font-mono">
                      {item.draftAcceptanceRate}
                    </span>
                  </td>
                  <td className="py-3.5 pr-2 text-right font-mono font-semibold text-emerald-700">{item.commission}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
