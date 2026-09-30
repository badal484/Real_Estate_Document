import { useState } from 'react';
import {
  IconBookOpen,
  IconCheckCircle,
  IconExclamationTriangle,
  IconShieldCheck,
  IconSparkles,
  IconXMark,
} from '../icons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function AgentPlaybookModal({ isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'flow' | 'dos' | 'faq'>('flow');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 animate-fade-in">
      <div className="card relative w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl bg-white border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <IconBookOpen className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Agent &amp; TC Playbook: Transaction Guide</h2>
              <p className="text-[11px] text-slate-300">
                Best practices for contingency compliance, zero-risk milestones, and legal protection.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <IconXMark className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/80 px-6">
          <button
            type="button"
            onClick={() => setActiveTab('flow')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'flow'
                ? 'border-brand-700 text-brand-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            1. The 4-Stage Workflow
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dos')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'dos'
                ? 'border-brand-700 text-brand-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            2. Legal DOs &amp; DON'Ts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('faq')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'faq'
                ? 'border-brand-700 text-brand-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            3. Broker FAQs &amp; Rules
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-600 leading-relaxed">
          {activeTab === 'flow' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">How to Manage Every Transaction Like a Top 1% Brokerage</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/50">
                  <span className="inline-flex items-center gap-1 font-bold text-brand-700 uppercase tracking-wider text-[10px]">
                    Stage 1 &bull; Ingest
                  </span>
                  <h4 className="font-semibold text-slate-900 mt-1 mb-1">Upload Purchase Agreement</h4>
                  <p className="text-[11px] text-slate-500">
                    Upload the signed PDF. The AI extracts the property address, buyer/seller names, mutual acceptance date, and all contingency clauses.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/50">
                  <span className="inline-flex items-center gap-1 font-bold text-amber-700 uppercase tracking-wider text-[10px]">
                    Stage 2 &bull; Verify
                  </span>
                  <h4 className="font-semibold text-slate-900 mt-1 mb-1">Confirm Milestones</h4>
                  <p className="text-[11px] text-slate-500">
                    Review extracted dates. Click "Confirm All" to lock in deterministic dates. This automatically arms the automated background email monitor.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/50">
                  <span className="inline-flex items-center gap-1 font-bold text-blue-700 uppercase tracking-wider text-[10px]">
                    Stage 3 &bull; Intelligence
                  </span>
                  <h4 className="font-semibold text-slate-900 mt-1 mb-1">AI Legal Copilot</h4>
                  <p className="text-[11px] text-slate-500">
                    Use the dual-pane workspace to ask questions like *"What are buyer remedies if seller refuses repair?"* with instant exact-phrase PDF citations.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/50">
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 uppercase tracking-wider text-[10px]">
                    Stage 4 &bull; Protect
                  </span>
                  <h4 className="font-semibold text-slate-900 mt-1 mb-1">Automated Alerts</h4>
                  <p className="text-[11px] text-slate-500">
                    Add your Transaction Coordinator (TC) to the email list. Resend sends T-3, T-1, and Day-Of notices automatically.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dos' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* DOs */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                    <IconCheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>What You SHOULD Do (DOs)</span>
                  </div>
                  <ul className="space-y-2 text-[11px] text-emerald-950">
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">&bull;</span>
                      <span><strong>Always confirm milestones</strong> immediately after upload to activate email alerts.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">&bull;</span>
                      <span><strong>Add both the Agent and TC</strong> so that two pairs of eyes track each critical date.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">&bull;</span>
                      <span><strong>Mark milestones as Completed</strong> as soon as the signed contingency removal addendum is delivered.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">&bull;</span>
                      <span><strong>Use Inbound Forwarding</strong> to forward subsequent counters and addenda directly to the deal.</span>
                    </li>
                  </ul>
                </div>

                {/* DONTs */}
                <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
                    <IconExclamationTriangle className="h-4 w-4 text-rose-600" />
                    <span>What You MUST Avoid (DON'Ts)</span>
                  </div>
                  <ul className="space-y-2 text-[11px] text-rose-950">
                    <li className="flex items-start gap-1.5">
                      <span className="text-rose-600 font-bold">&bull;</span>
                      <span><strong>DON'T manually count days on paper</strong> — our engine accurately calculates calendar vs business days and state holidays.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-rose-600 font-bold">&bull;</span>
                      <span><strong>DON'T leave dates in "Pending"</strong> — unconfirmed dates will not trigger automated dispatches.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-rose-600 font-bold">&bull;</span>
                      <span><strong>DON'T upload incomplete contract drafts</strong> — ensure mutual acceptance signatures are present.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-rose-600 font-bold">&bull;</span>
                      <span><strong>DON'T ignore T-1 alerts</strong> — T-1 means you have 24 hours to deliver notice or request an extension.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200 p-3 bg-white">
                <h4 className="font-bold text-slate-900 mb-1">How does the Date Engine handle weekends and holidays?</h4>
                <p className="text-[11px] text-slate-500">
                  If a clause specifies "Business Days", the engine automatically rolls past Saturdays, Sundays, and legal federal/state holidays. Calendar day clauses roll to the next business day if the final day lands on a Sunday/holiday (per standard CAR / NAR contract rules).
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 p-3 bg-white">
                <h4 className="font-bold text-slate-900 mb-1">What happens if a buyer misses a contingency deadline?</h4>
                <p className="text-[11px] text-slate-500">
                  The seller may issue a formal "Notice to Buyer to Perform" giving 48–72 hours to remove the contingency. If unfulfilled, the seller can cancel the transaction and attempt to claim the Earnest Money Deposit (EMD). Our system triggers an immediate <strong>Past-Due Risk Alert</strong> to prevent this.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 p-3 bg-white">
                <h4 className="font-bold text-slate-900 mb-1">Is the audit history admissible in a broker dispute?</h4>
                <p className="text-[11px] text-slate-500">
                  Yes. The Audit Log records immutable timestamps, user IDs, previous/new date values, and Resend email delivery receipts for every single transaction event.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Contingency Copilot &bull; Real Estate Legal Compliance Engine
          </span>
          <button
            type="button"
            onClick={onClose}
            className="btn-primary text-xs py-1.5 px-4"
          >
            Got it, let's proceed
          </button>
        </div>
      </div>
    </div>
  );
}
