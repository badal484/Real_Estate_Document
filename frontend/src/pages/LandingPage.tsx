import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Building2,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Scale,
  Sparkles,
  ChevronRight,
  FileText,
  Clock,
  Bell,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FeatureCarousel } from '@/components/ui/FeatureCarousel';
import { motion } from 'framer-motion';

const STATE_TEMPLATES = [
  {
    id: 'nwmls',
    state: 'Washington',
    code: 'WA (NWMLS)',
    inspection: '10 Calendar Days',
    financing: '21 Business Days',
    title: '5 Business Days',
    cutoff: '9:00 PM PST',
    rule: 'Form 35 inspection & Form 22A financing addenda rules apply.',
  },
  {
    id: 'car',
    state: 'California',
    code: 'CA (CAR RPA)',
    inspection: '17 Calendar Days',
    financing: '21 Calendar Days',
    title: '7 Calendar Days',
    cutoff: '11:59 PM PST',
    rule: 'Active contingency removal (CR) notice required by buyer.',
  },
  {
    id: 'farbar',
    state: 'Florida',
    code: 'FL (FAR/BAR)',
    inspection: '15 Calendar Days',
    financing: '30 Calendar Days',
    title: '5 Calendar Days',
    cutoff: '5:00 PM EST',
    rule: 'AS-IS contract with comprehensive rider timelines.',
  },
  {
    id: 'trec',
    state: 'Texas',
    code: 'TX (TREC)',
    inspection: '7 Option Days',
    financing: '20 Calendar Days',
    title: '3 Days Post-Commitment',
    cutoff: '5:00 PM CST',
    rule: 'Paragraph 23 termination option fee rules strictly enforced.',
  },
  {
    id: 'nysar',
    state: 'New York',
    code: 'NY (NYSAR)',
    inspection: '5 Business Days',
    financing: '30 Calendar Days',
    title: '10 Business Days',
    cutoff: '5:00 PM EST',
    rule: 'Mandatory attorney approval contingency window.',
  },
];

const METRICS = [
  { value: '$420M+', label: 'Earnest Money Protected', sub: 'Across 12,000+ Escrows' },
  { value: '99.98%', label: 'Date Math Precision', sub: 'Deterministic State Rules' },
  { value: '< 2.4s', label: 'Clause Extraction Speed', sub: 'Verbatim PDF Citations' },
  { value: '100%', label: 'E&O Risk Mitigation', sub: 'Cryptographic Audit Trail' },
];

export function LandingPage() {
  const { user } = useAuth();
  const [selectedState, setSelectedState] = useState(STATE_TEMPLATES[0]);
  const [activeTab, setActiveTab] = useState<'surveillance' | 'copilot' | 'alerts'>('surveillance');

  return (
    <div className="min-h-screen bg-white text-[#09090B] font-sans antialiased overflow-x-hidden selection:bg-neutral-200">
      {/* ── 0. Top Announcement Banner (ElevenLabs Style) ── */}
      <div className="border-b border-neutral-200/80 bg-[#FAFAFA] py-2 px-4 text-center text-xs font-medium text-[#52525B]">
        <span className="inline-flex items-center gap-2">
          <span className="rounded-full bg-black text-white px-2 py-0.5 text-[10px] font-bold">V2</span>
          <span>Meet Contingency Copilot v2 — Deterministic real estate contract surveillance.</span>
          <Link to="/docs" className="font-semibold text-black hover:underline inline-flex items-center gap-0.5 ml-1">
            Discover <ChevronRight className="h-3 w-3" />
          </Link>
        </span>
      </div>

      {/* ── 1. Minimal Header / Navbar (ElevenLabs Style) ── */}
      <header className="sticky top-0 z-50 border-b border-neutral-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#09090B] text-white font-bold shadow-clean-xs">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-[#09090B]">
              Contingency Copilot
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs text-[#52525B] font-medium">
            <a href="#features" className="hover:text-black transition-colors">Features</a>
            <a href="#state-rules" className="hover:text-black transition-colors">State Rules</a>
            <Link to="/pricing" className="hover:text-black transition-colors">Pricing</Link>
            <Link to="/security" className="hover:text-black transition-colors">Security &amp; E&amp;O</Link>
            <Link to="/docs" className="hover:text-black transition-colors">Docs</Link>
          </nav>

          <div className="flex items-center gap-2.5">
            {user ? (
              <Button asChild size="sm" className="btn-pill-primary text-xs">
                <Link to="/deals">
                  <span>Workspace</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Link>
              </Button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-medium text-[#52525B] hover:text-black transition-colors"
                >
                  Log in
                </Link>
                <Button asChild size="sm" className="btn-pill-primary text-xs">
                  <Link to="/login">
                    <span>Sign up</span>
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── 2. ElevenLabs-Inspired Hero Section ── */}
      <section className="px-6 pt-20 pb-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end mb-12">
          {/* Main bold headline (Left) */}
          <div className="lg:col-span-7 space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#09090B] leading-[1.06]">
              Bringing precision <br className="hidden sm:inline" />
              to contract closings
            </h1>
          </div>

          {/* Subtitle & Dual Pill Buttons (Right) */}
          <div className="lg:col-span-5 space-y-6">
            <p className="text-sm sm:text-base text-[#52525B] leading-relaxed">
              Powering premier brokerages, escrow teams, and top agents. Ingest executed Purchase &amp; Sale Agreements to extract binding deadlines, calculate statutory calendar math, and eliminate missed contingencies.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="btn-pill-primary text-xs px-6 py-3">
                <Link to={user ? "/upload" : "/login"}>
                  <span>Get started free</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="btn-pill-outline text-xs px-6 py-3">
                <Link to="/pricing">
                  <span>Contact sales</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* ── Segmented Control Bar (ElevenLabs Pill Tab Style) ── */}
        <div className="rounded-3xl border border-neutral-200/80 bg-[#F9FAFB] p-3 sm:p-5 shadow-clean-sm">
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setActiveTab('surveillance')}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'surveillance'
                  ? 'bg-white text-black shadow-clean-xs border border-neutral-200'
                  : 'text-[#71717A] hover:text-black hover:bg-neutral-200/50'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Contract Surveillance</span>
            </button>

            <button
              onClick={() => setActiveTab('copilot')}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'copilot'
                  ? 'bg-white text-black shadow-clean-xs border border-neutral-200'
                  : 'text-[#71717A] hover:text-black hover:bg-neutral-200/50'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              <span>AI Copilot &amp; Citations</span>
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'alerts'
                  ? 'bg-white text-black shadow-clean-xs border border-neutral-200'
                  : 'text-[#71717A] hover:text-black hover:bg-neutral-200/50'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>Milestone Alerts</span>
            </button>
          </div>

          {/* Hero Visual Mockup Container */}
          <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-clean-sm">
            <img
              src="/assets/hero_mockup.jpg"
              alt="Contingency Copilot Interface Showcase"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="pt-10 flex flex-wrap items-center justify-center gap-8 text-xs text-[#52525B] max-w-3xl mx-auto font-medium">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> SOC2 Type II Certified
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Multi-State Legal Standards
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> 256-Bit Encrypted Vault
          </span>
        </div>
      </section>

      {/* ── 3. FEATURES SECTION CAROUSEL (ElevenLabs Style) ── */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-neutral-200/80">
        <div className="space-y-3 mb-12 max-w-2xl">
          <Badge variant="outline" className="text-xs font-semibold px-3 py-1">
            <Sparkles className="h-3.5 w-3.5 text-neutral-800 mr-1.5" />
            Platform Capabilities
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#09090B] tracking-tight">
            Engineered for flawless transactions
          </h2>
          <p className="text-sm text-[#52525B] leading-relaxed">
            Browse our complete suite of real estate contract surveillance tools. Explore how each module guards transactions.
          </p>
        </div>

        {/* Interactive Feature Slider Component */}
        <FeatureCarousel />
      </section>

      {/* ── 4. Key Metrics Grid ── */}
      <section className="border-y border-neutral-200/80 bg-[#FAFAFA] py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {METRICS.map((m, i) => (
            <div key={i} className="space-y-1">
              <div className="text-3xl sm:text-5xl font-extrabold text-[#09090B] tracking-tight">
                {m.value}
              </div>
              <div className="text-xs font-semibold text-[#09090B]">{m.label}</div>
              <div className="text-[11px] text-[#71717A]">{m.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. State Contract Rules Selector ── */}
      <section id="state-rules" className="max-w-6xl mx-auto px-6 py-24 space-y-10">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <Badge variant="outline" className="text-xs font-semibold px-3 py-1">
            <Scale className="h-3.5 w-3.5 text-neutral-800 mr-1.5" />
            State Jurisdiction Engine
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#09090B] tracking-tight">
            Multi-State Statutory Accuracy
          </h2>
          <p className="text-sm text-[#52525B]">
            Real estate deadlines vary strictly by governing state association standard forms. Select your market to inspect the rules.
          </p>
        </div>

        {/* State Pill Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {STATE_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedState(t)}
              className={`rounded-full px-5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                selectedState.id === t.id
                  ? 'bg-black text-white shadow-clean-xs'
                  : 'bg-[#F4F4F5] text-[#52525B] hover:text-black hover:bg-neutral-200/70 border border-neutral-200'
              }`}
            >
              {t.state} ({t.code.split(' ')[0]})
            </button>
          ))}
        </div>

        {/* Selected State Rule Card */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-7 sm:p-9 shadow-clean-sm max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-[#09090B]">{selectedState.state}</span>
                <Badge variant="default" className="text-[11px] font-semibold">{selectedState.code}</Badge>
              </div>
              <p className="text-xs text-[#52525B] mt-1">{selectedState.rule}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#71717A] uppercase font-semibold tracking-wider block">Official Cutoff Time</span>
              <span className="text-sm font-bold text-[#09090B]">{selectedState.cutoff}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-neutral-200/70">
              <span className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1">Inspection Period</span>
              <span className="text-base font-bold text-[#09090B] block">{selectedState.inspection}</span>
              <span className="text-[11px] text-[#71717A] mt-1 block">Buyer right to remedy or terminate</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-neutral-200/70">
              <span className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1">Financing Commitment</span>
              <span className="text-base font-bold text-[#09090B] block">{selectedState.financing}</span>
              <span className="text-[11px] text-[#71717A] mt-1 block">Loan approval &amp; appraisal addendum</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-neutral-200/70">
              <span className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1">Title Examination</span>
              <span className="text-base font-bold text-[#09090B] block">{selectedState.title}</span>
              <span className="text-[11px] text-[#71717A] mt-1 block">Objections to defects &amp; encumbrances</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Bottom Call to Action ── */}
      <section className="border-t border-neutral-200/80 bg-[#FAFAFA] py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#09090B]">
            Never miss a closing deadline again.
          </h2>
          <p className="text-sm sm:text-base text-[#52525B] max-w-xl mx-auto">
            Join thousands of real estate professionals protecting earnest money deposits with automated surveillance.
          </p>
          <div className="pt-2">
            <Button asChild size="lg" className="btn-pill-primary text-xs px-8 py-3">
              <Link to={user ? "/upload" : "/login"}>
                <span>Get started in 30 seconds</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── 7. Footer ── */}
      <footer className="border-t border-neutral-200/80 bg-white py-12 px-6 text-xs text-[#71717A]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-black text-white flex items-center justify-center font-bold text-[10px]">
              C
            </div>
            <span className="font-semibold text-[#09090B]">Contingency Copilot</span>
            <span className="text-neutral-400">© 2026</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <Link to="/pricing" className="hover:text-black">Pricing</Link>
            <Link to="/security" className="hover:text-black">Security</Link>
            <Link to="/docs" className="hover:text-black">API Docs</Link>
            <Link to="/contracts" className="hover:text-black">Contracts Library</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
