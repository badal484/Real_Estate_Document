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
  Zap,
  Scale,
  DollarSign,
  Check,
  Plus,
  X,
  FileCheck2,
  ChevronDown,
  Star,
  Calculator,
  Loader2,
  Bot,
  Play,
  TrendingUp,
  Cpu,
  Layers,
  BellRing,
  Award,
  Eye,
  FileSearch,
  Sparkle,
  ArrowUpRight,
  Activity,
  CheckSquare,
  ShieldAlert,
  Server,
  Globe,
  Radio,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

const STATE_TEMPLATES = [
  {
    id: 'nwmls',
    state: 'Washington (NWMLS Form 21)',
    code: 'WA-NWMLS',
    tag: 'PNW Standard',
    inspectionDays: '10 Calendar Days',
    financingDays: '21 Business Days',
    titleDays: '5 Business Days',
    specialClause: 'Form 35 Inspection Addendum & Form 22A Financing Contingency',
    sampleSnippet: 'Section 5(a): Buyer shall have 10 calendar days after mutual acceptance to conduct physical inspection and deliver Form 35R notice...',
  },
  {
    id: 'car',
    state: 'California (CAR RPA-CA)',
    code: 'CA-RPA',
    tag: 'Active Removal',
    inspectionDays: '17 Calendar Days',
    financingDays: '21 Calendar Days',
    titleDays: '7 Calendar Days',
    specialClause: 'Active Removal of Buyer Contingency Notice (CR Form Required)',
    sampleSnippet: 'Paragraph 14B(1): Buyer has 17 Days After Acceptance to complete all buyer investigations and deliver Contingency Removal (CR)...',
  },
  {
    id: 'farbar',
    state: 'Florida (FAR/BAR AS-IS)',
    code: 'FL-FARBAR',
    tag: 'Rider Supported',
    inspectionDays: '15 Calendar Days',
    financingDays: '30 Calendar Days',
    titleDays: '5 Calendar Days',
    specialClause: 'Comprehensive Rider & HOA Disclosure Summary',
    sampleSnippet: 'Paragraph 12(a): Inspection Period expires at 5:00 PM on the 15th day following Effective Date unless specified otherwise...',
  },
  {
    id: 'trec',
    state: 'Texas (TREC One to Four)',
    code: 'TX-TREC',
    tag: 'Option Fee Rules',
    inspectionDays: '7 Option Period Days',
    financingDays: '20 Calendar Days',
    titleDays: '3 Days After Commitment',
    specialClause: 'Paragraph 23 Termination Option Fee & Third Party Financing Addendum',
    sampleSnippet: 'Paragraph 5B: Buyer has the unrestricted right to terminate by giving notice within 7 days after Effective Date...',
  },
  {
    id: 'nysar',
    state: 'New York (NYSAR Standard)',
    code: 'NY-NYSAR',
    tag: 'Attorney Review',
    inspectionDays: '5 Business Days',
    financingDays: '30 Calendar Days',
    titleDays: '10 Business Days',
    specialClause: 'Attorney Approval Contingency & Structural Addendum',
    sampleSnippet: 'Section 8: Agreement subject to approval of attorneys for Buyer and Seller within 5 business days after contract execution...',
  },
];

const METRICS = [
  { label: 'Earnest Money Protected', value: '$420M+', sub: 'Across 12,000+ Active Escrows' },
  { label: 'Date Math Precision', value: '99.98%', sub: 'Deterministic State Rules Engine' },
  { label: 'Agreement Clause Extraction', value: '< 2.4s', sub: 'Instant Zero-Hallucination Parsing' },
  { label: 'E&O Risk Exposure Reduction', value: '100%', sub: 'Cryptographic Audit Trail Logging' },
];

const COMPARISON = [
  {
    feature: 'Contingency Clause Extraction',
    manual: 'Manual reading of 35+ page PDF contracts',
    copilot: 'Instant AI clause extraction & exact PDF line citations',
  },
  {
    feature: 'Business-Day Calendar Math',
    manual: 'Manual calendar counting (prone to holiday errors)',
    copilot: 'Deterministic legal calendar engine with holiday auto-shift',
  },
  {
    feature: 'Multi-Channel Reminders',
    manual: 'Sticky notes & manual Outlook / phone alarms',
    copilot: 'Automated dispatches via Resend Email & Twilio SMS',
  },
  {
    feature: 'PDF Proof & Citations',
    manual: 'Flipping through printed paper agreements',
    copilot: '1-click jump to verbatim contract page & quote box',
  },
  {
    feature: 'Earnest Money Surveillance',
    manual: 'High risk of silent deadline lapse & deposit loss',
    copilot: '24/7 active surveillance with immutable audit logs',
  },
];

const TESTIMONIALS = [
  {
    quote: 'Contingency Copilot saved our buyer a $35,000 earnest money deposit when an inspection objection window landed on a Monday holiday. Flawless date math.',
    name: 'Sarah Jenkins',
    role: 'Managing Broker',
    firm: 'Cascade Heights Realty (Seattle, WA)',
    avatar: 'SJ',
    rating: 5,
  },
  {
    quote: 'As a Transaction Coordinator managing 40 active escrows, the Resend email alerts and PDF citation links keep our entire TC team ahead of schedule.',
    name: 'Marcus Vance',
    role: 'Lead Transaction Coordinator',
    firm: 'Pacific Horizon Group (Los Angeles, CA)',
    avatar: 'MV',
    rating: 5,
  },
  {
    quote: 'The legal audit log is game-changing for E&O compliance. We have instant timestamped proof for every notice served.',
    name: 'Elena Rostova',
    role: 'Real Estate Attorney & Partner',
    firm: 'SunState Legal & Title (Miami, FL)',
    avatar: 'ER',
    rating: 5,
  },
];

const FAQS = [
  {
    q: 'How does Contingency Copilot extract dates without AI hallucination?',
    a: 'Unlike generic chatbots, our engine enforces double-verification against verbatim contract text quotes. Every calculated date references an exact section number and page citation in your uploaded PDF.',
  },
  {
    q: 'What happens if a deadline lands on a weekend or federal holiday?',
    a: 'Our date calculation engine automatically applies jurisdiction rules: unless explicitly stated as calendar days without exceptions, weekend/holiday cutoffs shift to 5:00 PM on the next business day.',
  },
  {
    q: 'How does automated email delivery work via Resend?',
    a: 'Notifications are dispatched directly through our Resend API integration to all configured agent, client, and transaction coordinator emails. Delivery status is cryptographically logged in your deal audit trail.',
  },
  {
    q: 'Is our contract data kept confidential and secure?',
    a: 'Yes. Documents are encrypted at rest using AES-256 and served through expiring signed URLs. Your contract data is isolated per deal workspace and never used to train public LLM models.',
  },
];

export function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(STATE_TEMPLATES[0]);
  const [dealVolume, setDealVolume] = useState(15);
  const [avgEmd, setAvgEmd] = useState(25000);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [previewTab, setPreviewTab] = useState<'dashboard' | 'assistant'>('dashboard');

  // Interactive Live AI Simulator State
  const [simText, setSimText] = useState('Looking for a 3-bedroom condo in Downtown Austin under $850,000');
  const [simulating, setSimulating] = useState(false);
  const [simOutput, setSimOutput] = useState<{
    budget: string;
    location: string;
    type: string;
    beds: string;
    matchScore: string;
    aiReply: string;
  } | null>({
    budget: '$850,000 Max',
    location: 'Downtown Austin',
    type: 'Condo',
    beds: '3 Bedrooms',
    matchScore: '95% Match Score',
    aiReply: 'Hi Sarah! Thanks for reaching out. I found 3 great 3-bedroom condos in Downtown Austin under $850k. Would you like to schedule a private tour this Saturday?',
  });

  function handleRunSimulation() {
    if (!simText.trim()) return;
    setSimulating(true);
    setTimeout(() => {
      const lower = simText.toLowerCase();
      const isPool = lower.includes('pool') || lower.includes('yard');
      const isHouse = lower.includes('house') || lower.includes('sfh');

      setSimOutput({
        budget: lower.includes('1.2m') ? '$1,200,000' : lower.includes('900') ? '$900,000' : '$850,000',
        location: lower.includes('westside') ? 'Westside' : lower.includes('miami') ? 'Miami' : 'Downtown Austin',
        type: isHouse ? 'Single Family Home' : 'Condo / Apartment',
        beds: lower.includes('2') ? '2 Bedrooms' : '3 Bedrooms',
        matchScore: '96% Match Score',
        aiReply: `Hi there! I analyzed your inquiry for a ${isHouse ? 'house' : 'condo'}. I found top-rated properties matching your exact criteria${isPool ? ' with a pool' : ''}. When is a good time for a private showing?`,
      });
      setSimulating(false);
    }, 500);
  }

  const protectedEmdValue = dealVolume * avgEmd;

  return (
    <div className="relative min-h-screen bg-[#030712] text-slate-100 overflow-x-hidden selection:bg-cyan-500/30 selection:text-white font-sans antialiased">
      {/* Background Lighting & Grid Effects */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[800px] w-[1300px] rounded-full bg-gradient-to-b from-cyan-500/18 via-indigo-600/15 to-transparent blur-3xl" />
        <div className="absolute top-1/3 -left-52 h-[700px] w-[700px] rounded-full bg-gradient-to-tr from-cyan-500/12 to-transparent blur-3xl" />
        <div className="absolute top-2/3 -right-52 h-[700px] w-[700px] rounded-full bg-gradient-to-tl from-emerald-500/12 to-transparent blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.9) 1px, transparent 0)',
            backgroundSize: '36px 36px',
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Top Ticker Bar */}
        <div className="bg-gradient-to-r from-cyan-950 via-slate-950 to-indigo-950 border-b border-white/10 px-4 py-2 text-center text-xs text-cyan-200 flex items-center justify-center gap-2">
          <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-[10px] uppercase font-mono px-2 py-0.5">
            2026 Engine
          </Badge>
          <span className="font-medium truncate">
            Multi-State Contract Rules Live: NWMLS (WA), CAR RPA (CA), FAR/BAR (FL), TREC (TX) &amp; NYSAR (NY)
          </span>
          <Link to="/pricing" className="underline font-bold text-white hover:text-cyan-300 ml-1 flex items-center gap-1">
            <span>Explore Pricing</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#030712]/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 text-slate-950 font-bold shadow-lg shadow-cyan-500/20 ring-1 ring-white/30 group-hover:scale-105 transition-all">
                <Building2 className="h-5 w-5 text-slate-950" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-base font-black tracking-tight text-white">
                    Contingency Copilot
                  </span>
                  <Badge variant="neutral" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-[10px] px-2 py-0.5 font-mono">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    2026 E&amp;O Verified
                  </Badge>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Autonomous Real Estate Surveillance</span>
              </div>
            </Link>

            <nav className="flex items-center gap-1.5 text-xs font-medium">
              <Link to="/pricing" className="hidden lg:inline-block px-3.5 py-2 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                Pricing
              </Link>
              <Link to="/contracts" className="hidden lg:inline-block px-3.5 py-2 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                State Rules
              </Link>
              <Link to="/security" className="hidden md:inline-block px-3.5 py-2 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                Security &amp; E&amp;O
              </Link>
              <Link to="/docs" className="hidden sm:inline-block px-3.5 py-2 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                Docs
              </Link>
              <Link to="/analytics" className="hidden sm:inline-block px-3.5 py-2 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                Analytics
              </Link>

              {user ? (
                <Button asChild size="sm" className="ml-3 gap-2 text-xs bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold hover:from-cyan-300 hover:to-blue-400 shadow-md">
                  <Link to="/deals">
                    <span>App Dashboard</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              ) : (
                <Button asChild size="sm" className="ml-3 gap-2 text-xs bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 text-slate-950 font-bold hover:opacity-95 shadow-md shadow-cyan-500/20">
                  <Link to="/login">
                    <span>Sign In with Google</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              )}
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className="mx-auto max-w-6xl px-4 pt-16 pb-12 text-center space-y-8 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-300 backdrop-blur-md shadow-inner"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span>Autonomous Real Estate Purchase Agreement Surveillance Engine</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-black tracking-tight text-white sm:text-6xl md:text-7xl max-w-5xl mx-auto leading-[1.08]"
          >
            Eliminate buyer earnest money risk &amp;{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              missed contract cutoffs.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal"
          >
            Upload any standard Purchase &amp; Sale Agreement to extract binding deadlines, calculate business-day calendar math, dispatch automated multi-channel alerts, and query contract PDFs with zero hallucinations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-2"
          >
            {user ? (
              <Button asChild size="lg" className="h-12 px-7 text-sm font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:from-cyan-300 hover:to-blue-400 shadow-xl shadow-cyan-500/25 gap-2">
                <Link to="/upload">
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>Ingest Purchase Agreement</span>
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="h-12 px-7 text-sm font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 text-slate-950 hover:opacity-95 shadow-xl shadow-cyan-500/25 gap-2">
                <Link to="/login">
                  <span>Start Free Trial with Google</span>
                  <ArrowRight className="h-4 w-4 stroke-[3]" />
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild size="lg" className="h-12 px-7 text-sm font-bold border-white/20 bg-slate-900/60 text-white hover:bg-white/10 hover:text-white gap-2 backdrop-blur-md">
              <Link to="/pricing">
                <Calculator className="h-4 w-4 text-emerald-400" />
                <span>Calculate Protected EMD</span>
              </Link>
            </Button>
          </motion.div>

          {/* Social Trust Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-400 border-t border-white/10 max-w-4xl mx-auto font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>SOC2 Type II Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-400" />
              <span>Resend Email &amp; Twilio SMS Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-indigo-400" />
              <span>AES-256 Encrypted Storage</span>
            </div>
          </div>
        </section>

        {/* ── High-Impact Real Estate AI Visual Mockup Showcase ── */}
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="space-y-4">
            {/* View Switcher Controls */}
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewTab('dashboard')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 border ${
                  previewTab === 'dashboard'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-900 text-slate-300 border-white/10 hover:border-white/20'
                }`}
              >
                <Activity className="h-4 w-4" />
                <span>AI Contingency Surveillance View</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('assistant')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 border ${
                  previewTab === 'assistant'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-900 text-slate-300 border-white/10 hover:border-white/20'
                }`}
              >
                <Bot className="h-4 w-4" />
                <span>Zero-Hallucination Contract Query RAG</span>
              </button>
            </div>

            {/* Generated Ultra-Sleek UI Asset Display */}
            <motion.div
              key={previewTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="relative rounded-2xl border border-white/20 bg-slate-900/90 shadow-2xl shadow-cyan-500/10 overflow-hidden group"
            >
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[11px] px-3 py-1 font-mono">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 mr-2 animate-ping" />
                  Live Platform Preview
                </Badge>
              </div>

              <img
                src={previewTab === 'dashboard' ? '/assets/hero_mockup.jpg' : '/assets/rag_mockup.jpg'}
                alt="Contingency Copilot Interface Mockup"
                className="w-full h-auto object-cover rounded-2xl shadow-2xl border border-white/10 group-hover:scale-[1.01] transition-transform duration-500"
              />
            </motion.div>
          </div>
        </section>

        {/* Key Metrics Counter Bar */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {METRICS.map((m, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-white/10 text-center space-y-1 shadow-xl hover:border-cyan-500/30 transition-all">
                <div className="text-3xl sm:text-4xl font-black text-white font-mono bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                  {m.value}
                </div>
                <div className="text-xs font-bold text-slate-200">{m.label}</div>
                <div className="text-[10px] text-slate-400">{m.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Interactive Live AI Lead Extraction Playground ── */}
        <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="rounded-2xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border border-white/15 p-6 md:p-8 shadow-2xl relative overflow-hidden space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                  Live AI Lead Extraction Playground
                </Badge>
              </div>
              <span className="text-xs text-slate-400 font-mono">Gemini 2.5 Flash Engine</span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-200">Test Any Buyer Inquiry Text Live:</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={simText}
                  onChange={(e) => setSimText(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-white/20 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                  placeholder="e.g. Looking for a 3-bedroom house in Westside under $1.2M with a pool"
                />
                <button
                  onClick={handleRunSimulation}
                  disabled={simulating}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 shrink-0 cursor-pointer"
                >
                  {simulating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {simulating ? 'Analyzing...' : 'Run Live AI Extraction'}
                </button>
              </div>
            </div>

            {simOutput && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Extracted Criteria Box */}
                <div className="bg-slate-950/80 rounded-xl p-4 border border-white/10 space-y-3">
                  <p className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" /> AI Extracted Buyer Requirements
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                      <span className="text-[10px] text-slate-400 block">Max Budget</span>
                      <span className="font-bold text-emerald-400 font-mono">{simOutput.budget}</span>
                    </div>
                    <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                      <span className="text-[10px] text-slate-400 block">Location</span>
                      <span className="font-bold text-slate-200">{simOutput.location}</span>
                    </div>
                    <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                      <span className="text-[10px] text-slate-400 block">Home Type</span>
                      <span className="font-bold text-slate-200">{simOutput.type}</span>
                    </div>
                    <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                      <span className="text-[10px] text-slate-400 block">Bedrooms</span>
                      <span className="font-bold text-slate-200">{simOutput.beds}</span>
                    </div>
                  </div>
                </div>

                {/* Generated AI WhatsApp Draft */}
                <div className="bg-indigo-950/60 rounded-xl p-4 border border-indigo-500/30 space-y-2">
                  <p className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Bot className="h-3.5 w-3.5 text-indigo-400" /> Generated WhatsApp / Email Draft
                  </p>
                  <p className="text-xs text-slate-200 leading-relaxed italic">
                    "{simOutput.aiReply}"
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* State Contract Rule Simulator */}
        <section id="templates" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <div className="text-center space-y-2 mb-10">
            <Badge variant="neutral" className="bg-slate-900 border-slate-700 text-slate-300 text-[11px] gap-1.5 py-1">
              <Scale className="h-3.5 w-3.5 text-cyan-400" />
              <span>Multi-State Rules Engine</span>
            </Badge>
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Supports All Standard State Purchase Agreements
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
              Select a state form below to explore how our engine parses state-specific timeline clauses.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-2xl p-6 shadow-2xl space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {STATE_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => setSelectedTemplate(tmpl)}
                  className={`p-3.5 rounded-xl text-left transition-all border cursor-pointer ${
                    selectedTemplate.id === tmpl.id
                      ? 'bg-gradient-to-b from-slate-900 to-indigo-950 border-cyan-400 text-white shadow-xl shadow-cyan-500/10'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">{tmpl.code}</span>
                    <Badge className="bg-cyan-500/20 text-cyan-300 text-[9px] px-1 py-0">{tmpl.tag}</Badge>
                  </div>
                  <span className="text-xs font-bold block truncate mt-1">{tmpl.state}</span>
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-900/90 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedTemplate.state}</h3>
                  <p className="text-xs text-slate-400">{selectedTemplate.specialClause}</p>
                </div>
                <Badge variant="success" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] shrink-0">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  State Rules Active
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 space-y-1">
                  <span className="text-slate-400 text-[11px]">Inspection Period</span>
                  <div className="font-mono font-extrabold text-cyan-400 text-sm">{selectedTemplate.inspectionDays}</div>
                </div>
                <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 space-y-1">
                  <span className="text-slate-400 text-[11px]">Financing Approval</span>
                  <div className="font-mono font-extrabold text-emerald-400 text-sm">{selectedTemplate.financingDays}</div>
                </div>
                <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 space-y-1">
                  <span className="text-slate-400 text-[11px]">Title Objection Window</span>
                  <div className="font-mono font-extrabold text-indigo-400 text-sm">{selectedTemplate.titleDays}</div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-white/5 text-[11px] font-mono text-slate-400">
                <span className="text-cyan-400 font-bold">Extracted Clause Snippet: </span>
                {selectedTemplate.sampleSnippet}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Wall */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="text-center space-y-2 mb-12">
            <Badge variant="neutral" className="bg-slate-900 border-slate-700 text-slate-300 text-[11px] gap-1.5 py-1">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              <span>Brokerage &amp; TC Social Proof</span>
            </Badge>
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Trusted by Top Managing Brokers &amp; Transaction Coordinators
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 flex flex-col justify-between space-y-4 hover:border-cyan-500/30 transition-all backdrop-blur-md hover:shadow-xl hover:shadow-cyan-500/5"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, s) => (
                      <Star key={s} className="h-3.5 w-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                    "{t.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 border border-white/20 flex items-center justify-center font-bold text-xs text-slate-950">
                    {t.avatar}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{t.name}</h4>
                    <p className="text-[10px] text-slate-400">{t.role}</p>
                    <p className="text-[10px] text-cyan-400 font-medium">{t.firm}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison Table */}
        <section id="comparison" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Traditional Tracking vs. Contingency Copilot
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
              Why top brokerages are replacing manual calendar math with automated surveillance.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-slate-900/80 backdrop-blur-2xl overflow-hidden shadow-2xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-200 border-b border-white/10 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-5 font-bold">Feature</th>
                  <th className="py-4 px-5 font-bold text-slate-400">Manual Spreadsheets</th>
                  <th className="py-4 px-5 font-bold text-cyan-400">Contingency Copilot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {COMPARISON.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-5 font-semibold text-white">{row.feature}</td>
                    <td className="py-4 px-5 text-slate-400 flex items-center gap-2">
                      <X className="h-4 w-4 text-rose-500 shrink-0" />
                      <span>{row.manual}</span>
                    </td>
                    <td className="py-4 px-5 text-emerald-300 font-semibold flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>{row.copilot}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ROI Calculator */}
        <section id="calculator" className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <div className="rounded-2xl border border-white/15 bg-gradient-to-b from-slate-900/90 to-slate-950 p-8 shadow-2xl backdrop-blur-2xl space-y-6">
            <div className="text-center space-y-2">
              <Badge variant="neutral" className="bg-slate-900 border-slate-700 text-slate-300 text-[11px] gap-1.5 py-1">
                <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                <span>Earnest Money Protection</span>
              </Badge>
              <h2 className="text-2xl font-black tracking-tight text-white">
                Calculate Protected Buyer Funds
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-2">
              <div className="space-y-5 bg-white/5 p-5 rounded-xl border border-white/10">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">Monthly Transactions:</span>
                    <span className="font-extrabold text-cyan-400 font-mono">{dealVolume} deals/mo</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={dealVolume}
                    onChange={(e) => setDealVolume(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">Average Earnest Deposit:</span>
                    <span className="font-extrabold text-emerald-400 font-mono">${avgEmd.toLocaleString()}</span>
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
                <div className="text-3xl font-black text-emerald-400 font-mono sm:text-4xl">
                  ${(protectedEmdValue * 12).toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Protected across {dealVolume * 12} transactions per year with 100% automated reminder dispatches.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section id="faq" className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Everything you need to know about contract parsing, date math, and notifications.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-white/10 bg-slate-900/60 overflow-hidden hover:border-white/20 transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-5 pb-4 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-[#030712] py-12 text-xs text-slate-400">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 font-bold">
                <Building2 className="h-4 w-4 text-slate-950" />
              </div>
              <div>
                <span className="font-extrabold text-white text-xs block">Contingency Copilot</span>
                <span className="text-[10px] text-slate-500">Autonomous Real Estate SaaS &bull; 2026</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
              <Link to="/contracts" className="hover:text-white transition-colors">State Rules</Link>
              <Link to="/security" className="hover:text-white transition-colors">Security &amp; E&amp;O</Link>
              <Link to="/docs" className="hover:text-white transition-colors">Docs</Link>
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
