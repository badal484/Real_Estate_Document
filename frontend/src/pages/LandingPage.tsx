import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Building2,
  Sparkles,
  ShieldCheck,
  Clock,
  Mail,
  ArrowRight,
  CheckCircle2,
  FileText,
  Lock,
  Search,
  ChevronRight,
  Zap,
  BarChart3,
  HelpCircle,
  AlertTriangle,
  Layers,
  Scale,
  DollarSign,
  UserCheck,
  Check,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

const DEMO_CLAUSES = [
  {
    title: 'Property Inspection Contingency',
    clauseText: 'Buyer shall have ten (10) calendar days from Mutual Acceptance Date to complete all physical inspections and deliver written Notice of Objections (Section 10.A).',
    type: '10 Calendar Days',
    calcDate: 'Calculated: 10 Days from Acceptance',
    citation: 'Section 10.A, Page 3',
    riskLevel: 'High Priority',
  },
  {
    title: 'Financing & Mortgage Approval',
    clauseText: 'This agreement is contingent upon Buyer obtaining written loan commitment within twenty-one (21) days of acceptance date (Section 14.C).',
    type: '21 Business Days',
    calcDate: 'Calculated: 21 Days from Acceptance',
    citation: 'Section 14.C, Page 6',
    riskLevel: 'Action Critical',
  },
  {
    title: 'Title Commitment Review',
    clauseText: 'Buyer shall review Preliminary Title Report and deliver written title objections within five (5) business days after receipt of Title (Section 8.B).',
    type: '5 Business Days',
    calcDate: 'Calculated: 5 Business Days after Receipt',
    citation: 'Section 8.B, Page 4',
    riskLevel: 'Standard Runway',
  },
];

export function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDemoIndex, setSelectedDemoIndex] = useState(0);
  const [dealVolume, setDealVolume] = useState(15);
  const [avgEmd, setAvgEmd] = useState(25000);

  const activeDemo = DEMO_CLAUSES[selectedDemoIndex];
  const protectedEmdValue = dealVolume * avgEmd;

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden selection:bg-sky-500/30 selection:text-white">
      {/* ── Background Mesh & Ambient Lighting ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[750px] w-[1000px] rounded-full bg-gradient-to-b from-sky-500/15 via-blue-600/10 to-transparent blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-indigo-500/15 to-transparent blur-3xl" />
        <div className="absolute bottom-1/4 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-tl from-emerald-500/10 to-transparent blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.8) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative z-10">
        {/* ── Navigation Header ── */}
        <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3.5 sm:px-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md ring-1 ring-white/20 group-hover:scale-105 transition-transform">
                <Building2 className="h-5 w-5 text-sky-400" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-white">
                  Contingency Copilot
                </span>
                <Badge variant="neutral" className="bg-slate-900/80 border-slate-700 text-slate-300 text-[10px] px-2 py-0.5">
                  <ShieldCheck className="h-3 w-3 text-emerald-400 mr-1" />
                  2026 Legal AI SaaS
                </Badge>
              </div>
            </Link>

            <nav className="flex items-center gap-2 text-xs font-medium">
              <a href="#features" className="hidden md:inline-block px-3 py-1.5 text-slate-300 hover:text-white transition-colors">
                Capabilities
              </a>
              <a href="#demo" className="hidden md:inline-block px-3 py-1.5 text-slate-300 hover:text-white transition-colors">
                Interactive Sandbox
              </a>
              <a href="#calculator" className="hidden md:inline-block px-3 py-1.5 text-slate-300 hover:text-white transition-colors">
                ROI Calculator
              </a>
              <Link to="/docs" className="hidden sm:inline-block px-3 py-1.5 text-slate-300 hover:text-white transition-colors">
                Documentation
              </Link>
              <Link to="/analytics" className="hidden sm:inline-block px-3 py-1.5 text-slate-300 hover:text-white transition-colors">
                Analytics
              </Link>

              {user ? (
                <Button asChild size="sm" className="ml-2 gap-1.5 text-xs bg-white text-slate-950 hover:bg-slate-200">
                  <Link to="/deals">
                    <span>Go to App Dashboard</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              ) : (
                <Button asChild size="sm" className="ml-2 gap-1.5 text-xs bg-white text-slate-950 hover:bg-slate-200 font-semibold shadow-md">
                  <Link to="/login">
                    <span>Sign In with Google</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              )}
            </nav>
          </div>
        </header>

        {/* ── Hero Section ── */}
        <section className="mx-auto max-w-6xl px-4 pt-16 pb-20 text-center space-y-8 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-xs font-medium text-sky-300 backdrop-blur-md"
          >
            <Sparkles className="h-3.5 w-3.5 text-sky-400" />
            <span>Autonomous Contingency Surveillance for Brokerages</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl max-w-4xl mx-auto leading-[1.15]"
          >
            Never let a real-estate contingency deadline lapse.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            Upload purchase agreements to automatically parse binding contingency clauses, compute business-day math, deliver automated Resend alerts, and query PDF contracts with zero hallucinations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3 pt-2"
          >
            {user ? (
              <Button asChild size="lg" className="h-11 px-6 text-sm font-bold bg-white text-slate-950 hover:bg-slate-200 shadow-xl gap-2">
                <Link to="/upload">
                  <Plus className="h-4 w-4" />
                  <span>Ingest Purchase Agreement</span>
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="h-11 px-6 text-sm font-bold bg-white text-slate-950 hover:bg-slate-200 shadow-xl gap-2">
                <Link to="/login">
                  <span>Sign In with Google</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
            <a href="#demo">
              <Button variant="outline" size="lg" className="h-11 px-6 text-sm font-semibold border-white/20 text-white hover:bg-white/10 gap-2">
                <Sparkles className="h-4 w-4 text-sky-400" />
                <span>Try Live Demo Sandbox</span>
              </Button>
            </a>
          </motion.div>

          {/* Social Proof Trust Banner */}
          <div className="pt-10 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-400 border-t border-white/10 max-w-3xl mx-auto">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>SOC2 Type II Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-sky-400" />
              <span>Resend API Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-indigo-400" />
              <span>256-Bit Encrypted Link Storage</span>
            </div>
          </div>
        </section>

        {/* ── Interactive Demo Sandbox ── */}
        <section id="demo" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <div className="text-center space-y-2 mb-10">
            <Badge variant="neutral" className="bg-slate-900 border-slate-700 text-slate-300 text-[11px] gap-1.5 py-1">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Interactive Contract Sandbox</span>
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              See How AI Parses Contract Clauses
            </h2>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              Select a sample contingency clause below to preview deterministic deadline calculation and verbatim citation matching.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/[0.05] backdrop-blur-2xl p-6 shadow-2xl space-y-6">
            {/* Clause Selector Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
              {DEMO_CLAUSES.map((clause, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedDemoIndex(idx)}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                    selectedDemoIndex === idx
                      ? 'bg-slate-900 text-white ring-1 ring-sky-400 shadow-md'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {clause.title}
                </button>
              ))}
            </div>

            {/* Active Clause Details */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-7 space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400">
                  Verbatim PDF Quotation
                </span>
                <div className="rounded-xl border border-white/10 bg-slate-900/80 p-4 font-mono text-xs text-slate-200 leading-relaxed shadow-inner">
                  &ldquo;{activeDemo.clauseText}&rdquo;
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <FileText className="h-3.5 w-3.5 text-slate-500" />
                  <span>Document Citation: <strong className="text-slate-200">{activeDemo.citation}</strong></span>
                </div>
              </div>

              <div className="md:col-span-5 space-y-3 rounded-xl border border-white/10 bg-slate-900/60 p-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Computed Output
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/10">
                    <span className="text-slate-400">Timeline Window:</span>
                    <span className="font-semibold text-white font-mono">{activeDemo.type}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/10">
                    <span className="text-slate-400">Target Timestamp:</span>
                    <span className="font-semibold text-emerald-400 font-mono">{activeDemo.calcDate}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Severity Level:</span>
                    <span className="font-semibold text-amber-400">{activeDemo.riskLevel}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => navigate(user ? '/upload' : '/login')}
                    size="sm"
                    className="w-full text-xs font-bold gap-1.5 bg-sky-500 hover:bg-sky-600 text-white"
                  >
                    <span>Try With Your PDF</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Key Capabilities Grid ── */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Engineered for Modern Brokerage Operations
            </h2>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              Built on legal contract parsing algorithms and automated notification dispatches.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 space-y-3 backdrop-blur-xl hover:border-white/20 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">AI Clause Extraction</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Parses PDF contracts to discover binding inspection, appraisal, loan commitment, title, and HOA contingencies with verbatim quotes.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 space-y-3 backdrop-blur-xl hover:border-white/20 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Deterministic Calendar Math</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Computes relative calendar and business-day cutoff timestamps based on contract mutual acceptance date and local timezone.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 space-y-3 backdrop-blur-xl hover:border-white/20 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Resend Email Alerts</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Delivers automated idempotent reminder notices at T-3, T-1, and 9:00 AM day-of deadline to agents, buyers, and transaction coordinators.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 space-y-3 backdrop-blur-xl hover:border-white/20 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Page-Aware PDF Viewer</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click any citation in the AI Q&amp;A copilot to jump directly to page numbers with in-situ yellow bounding box quote highlights.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 space-y-3 backdrop-blur-xl hover:border-white/20 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Tamper-Evident Audit Trail</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cryptographically records all document ingestions, date edits, manual confirmations, and notification dispatches for compliance audits.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 space-y-3 backdrop-blur-xl hover:border-white/20 transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Executive Deal Briefs</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generates instant transaction health scores (0-100), risk matrix severity tables, and exportable Markdown executive briefs.
              </p>
            </div>
          </div>
        </section>

        {/* ── Interactive ROI & EMD Protection Calculator ── */}
        <section id="calculator" className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <div className="rounded-2xl border border-white/15 bg-gradient-to-b from-slate-900/90 to-slate-950 p-8 shadow-2xl backdrop-blur-2xl space-y-6">
            <div className="text-center space-y-2">
              <Badge variant="neutral" className="bg-slate-900 border-slate-700 text-slate-300 text-[11px] gap-1.5 py-1">
                <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                <span>Brokerage Risk Protection Calculator</span>
              </Badge>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Calculate Protected Earnest Money
              </h2>
              <p className="text-xs text-slate-400">
                Estimate how much buyer earnest money deposit value your brokerage protects per year with automated surveillance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-2">
              <div className="space-y-4 bg-white/5 p-5 rounded-xl border border-white/10">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Monthly Transactions:</span>
                    <span className="font-bold text-sky-400 font-mono">{dealVolume} deals/mo</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={dealVolume}
                    onChange={(e) => setDealVolume(Number(e.target.value))}
                    className="w-full accent-sky-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Average Earnest Money Deposit:</span>
                    <span className="font-bold text-emerald-400 font-mono">${avgEmd.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="100000"
                    step="5000"
                    value={avgEmd}
                    onChange={(e) => setAvgEmd(Number(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </div>
              </div>

              <div className="text-center space-y-2 p-6 rounded-xl bg-slate-900 border border-white/10">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Annual Protected EMD Value
                </span>
                <div className="text-3xl font-extrabold text-emerald-400 font-mono sm:text-4xl">
                  ${(protectedEmdValue * 12).toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-400">
                  Protected across {dealVolume * 12} transactions per year with 100% automated reminder dispatches.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-white/10 bg-slate-950 py-12 text-xs text-slate-400">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white">
                <Building2 className="h-4 w-4 text-sky-400" />
              </div>
              <span className="font-bold text-white text-xs">Contingency Copilot</span>
              <span className="text-slate-500">&bull; 2026 Legal AI Real Estate SaaS</span>
            </div>

            <div className="flex items-center gap-6">
              <Link to="/docs" className="hover:text-white transition-colors">Documentation</Link>
              <Link to="/analytics" className="hover:text-white transition-colors">Analytics</Link>
              <Link to="/deals" className="hover:text-white transition-colors">Portfolio</Link>
              <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
