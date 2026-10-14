import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Mail,
  Sparkles,
  AlertTriangle,
  Scale,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function DocsPage() {
  const [activeTab, setActiveTab] = useState<'lifecycle' | 'math' | 'alerts' | 'dos'>('lifecycle');

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12 font-sans">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E4E7] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#09090B] font-mono">
              Brokerage Knowledge Base
            </span>
            <Badge variant="neutral" className="bg-zinc-100 text-zinc-800 border border-[#E4E4E7] font-mono text-[10px] rounded-full px-2.5 py-0.5">
              Agent Playbook &amp; Rules
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#09090B] sm:text-3xl">
            Documentation &amp; Compliance Guidelines
          </h1>
          <p className="text-xs text-[#71717A] mt-1 max-w-2xl">
            Standard operating procedures for managing contingency timelines, contract math rules, and automated dispatches.
          </p>
        </div>

        <Button asChild size="sm" className="rounded-full bg-[#09090B] hover:bg-black text-white font-medium gap-1.5 h-9 text-xs shadow-clean-xs">
          <Link to="/upload">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Ingest Contract PDF</span>
          </Link>
        </Button>
      </div>

      {/* ── Tab Selector (ElevenLabs Segmented Control) ── */}
      <div className="inline-flex flex-wrap gap-1 p-1 bg-[#F4F4F5] rounded-full border border-[#E4E4E7]">
        {[
          { id: 'lifecycle', label: '1. Transaction Lifecycle', icon: Calendar },
          { id: 'math', label: '2. Calculation Rules & Math', icon: Clock },
          { id: 'alerts', label: '3. Resend Alert Windows', icon: Mail },
          { id: 'dos', label: '4. Legal DOs & DON’Ts', icon: Scale },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-[#09090B] shadow-clean-xs'
                  : 'text-[#71717A] hover:text-[#09090B]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      <div className="bg-white p-8 rounded-3xl border border-[#E4E4E7] shadow-clean-sm space-y-6">
        {activeTab === 'lifecycle' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-[#09090B] flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#09090B]" />
              <span>4-Stage Contingency Lifecycle</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-5 rounded-2xl bg-[#F9FAFB] border border-[#E4E4E7] space-y-1.5 hover:border-zinc-400 transition-all">
                <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-wider">Stage 1</span>
                <h3 className="font-bold text-[#09090B]">Contract Ingestion</h3>
                <p className="text-[#71717A] leading-relaxed">
                  Upload Executed Purchase &amp; Sale Agreement PDF. AI vector embeddings index the contract text layers.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F9FAFB] border border-[#E4E4E7] space-y-1.5 hover:border-zinc-400 transition-all">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Stage 2</span>
                <h3 className="font-bold text-[#09090B]">Verification &amp; Confirmation</h3>
                <p className="text-[#71717A] leading-relaxed">
                  Agent reviews extracted clauses against PDF quotes, adjusts dates if needed, and clicks "Confirm All".
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F9FAFB] border border-[#E4E4E7] space-y-1.5 hover:border-zinc-400 transition-all">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Stage 3</span>
                <h3 className="font-bold text-[#09090B]">Automated Alert Surveillance</h3>
                <p className="text-[#71717A] leading-relaxed">
                  Resend engine triggers automated reminder notices to agents and TCs at T-3, T-1, and day-of cutoff.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F9FAFB] border border-[#E4E4E7] space-y-1.5 hover:border-zinc-400 transition-all">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Stage 4</span>
                <h3 className="font-bold text-[#09090B]">Waiver &amp; Execution Locking</h3>
                <p className="text-[#71717A] leading-relaxed">
                  Written contingency notices or waivers are signed and recorded in the tamper-evident audit history.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'math' && (
          <div className="space-y-6 text-xs">
            <h2 className="text-base font-bold text-[#09090B] flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#09090B]" />
              <span>Deterministic Date Calculation Rules</span>
            </h2>

            <div className="space-y-3">
              <div className="p-5 rounded-2xl bg-[#F9FAFB] border border-[#E4E4E7] space-y-1">
                <h3 className="font-bold text-[#09090B]">Day 0 Rule</h3>
                <p className="text-[#71717A] leading-relaxed">
                  The date of Mutual Acceptance is Day 0. Calculation begins on Day 1 (the calendar day following acceptance).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F9FAFB] border border-[#E4E4E7] space-y-1">
                <h3 className="font-bold text-[#09090B]">Calendar Days vs. Business Days</h3>
                <p className="text-[#71717A] leading-relaxed">
                  Unless the contract explicitly states "Business Days", all timeline windows default to consecutive calendar days. If a deadline lands on a weekend or federal holiday, cutoff shifts to 5:00 PM on the next business day.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F9FAFB] border border-[#E4E4E7] space-y-1">
                <h3 className="font-bold text-[#09090B]">5:00 PM Local Time Cutoff</h3>
                <p className="text-[#71717A] leading-relaxed">
                  Notice cutoffs default to 5:00 PM local property timezone unless otherwise specified in special stipulations.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6 text-xs">
            <h2 className="text-base font-bold text-[#09090B] flex items-center gap-2">
              <Mail className="h-5 w-5 text-[#09090B]" />
              <span>Resend Automated Alert Schedule</span>
            </h2>

            <div className="space-y-3">
              <div className="p-5 rounded-2xl bg-[#F9FAFB] border border-[#E4E4E7] space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="neutral" className="font-mono text-[10px] rounded-full px-2.5 py-0.5 bg-zinc-100 text-zinc-800 border border-[#E4E4E7]">T-3 Days</Badge>
                  <h3 className="font-bold text-[#09090B]">Early Warning Notice</h3>
                </div>
                <p className="text-[#71717A] leading-relaxed">
                  Dispatched 3 calendar days prior to expiration. Gives buyer and agent runway to schedule inspections or title reviews.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F9FAFB] border border-[#E4E4E7] space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="warning" className="font-mono text-[10px] rounded-full px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200">T-1 Day</Badge>
                  <h3 className="font-bold text-[#09090B]">High-Priority Action Required</h3>
                </div>
                <p className="text-[#71717A] leading-relaxed">
                  Dispatched 24 hours prior to deadline cutoff. Reminds agent to draft objection notice or request formal extension.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F9FAFB] border border-[#E4E4E7] space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="destructive" className="font-mono text-[10px] rounded-full px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200">T-0 Day Of</Badge>
                  <h3 className="font-bold text-[#09090B]">Execution Notice</h3>
                </div>
                <p className="text-[#71717A] leading-relaxed">
                  Dispatched at 9:00 AM local time on the expiration date. Final alert before 5:00 PM waiver cutoff.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dos' && (
          <div className="space-y-6 text-xs">
            <h2 className="text-base font-bold text-[#09090B] flex items-center gap-2">
              <Scale className="h-5 w-5 text-[#09090B]" />
              <span>Legal DOs &amp; DON’Ts Cheat Sheet</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl border border-emerald-200 bg-emerald-50/70 space-y-3">
                <h3 className="font-bold text-emerald-800 flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>DOs</span>
                </h3>
                <ul className="space-y-2 text-emerald-950 list-disc pl-4 leading-relaxed font-medium">
                  <li>DO verify Mutual Acceptance Date on the binding contract signature page.</li>
                  <li>DO deliver written objection notices before 5:00 PM local cutoff time.</li>
                  <li>DO obtain written extension addenda signed by both parties before deadline lapses.</li>
                </ul>
              </div>

              <div className="p-6 rounded-3xl border border-rose-200 bg-rose-50/70 space-y-3">
                <h3 className="font-bold text-rose-800 flex items-center gap-1.5 text-sm">
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                  <span>DON’Ts</span>
                </h3>
                <ul className="space-y-2 text-rose-950 list-disc pl-4 leading-relaxed font-medium">
                  <li>DON’T rely on verbal communications or text messages for contingency waivers.</li>
                  <li>DON’T assume automatic extension without executed written mutual consent.</li>
                  <li>DON’T let earnest money deposits remain unmonitored without active email alerts.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
