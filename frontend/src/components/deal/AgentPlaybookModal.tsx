import { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  X,
  Shield,
  FileCheck,
  Scale,
  HelpCircle,
  Clock,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-white border border-slate-700">
              <BookOpen className="h-4 w-4 text-slate-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight">Agent &amp; Coordinator Playbook</h2>
                <Badge variant="neutral" className="bg-slate-800 text-slate-200 text-[10px] border-slate-700">
                  Legal Compliance
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400">
                Standard operating guidelines for contingency timelines, EMD safety, and automated alerts.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50 px-6">
          <button
            type="button"
            onClick={() => setActiveTab('flow')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'flow'
                ? 'border-slate-900 text-slate-900 bg-white'
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
                ? 'border-slate-900 text-slate-900 bg-white'
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
                ? 'border-slate-900 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            3. Broker Rules &amp; FAQ
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-600 leading-relaxed">
          {activeTab === 'flow' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Transaction Execution Standard
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Follow this sequence on every active purchase contract to protect buyer deposits.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="rounded-lg border border-slate-200 p-3.5 bg-slate-50/50">
                  <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                    <FileCheck className="h-4 w-4 text-slate-700" />
                    <span>Stage 1 &bull; Ingest</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Upload the signed purchase agreement. The AI parses the address, parties, acceptance date, and contingency terms.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 p-3.5 bg-slate-50/50">
                  <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                    <Clock className="h-4 w-4 text-slate-700" />
                    <span>Stage 2 &bull; Verify</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Review extracted deadlines. Click "Confirm All" to lock deterministic dates and activate the automated monitoring engine.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 p-3.5 bg-slate-50/50">
                  <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                    <Scale className="h-4 w-4 text-slate-700" />
                    <span>Stage 3 &bull; Intelligence</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Query the contract via AI Copilot for buyer remedies, repair notice periods, and HOA restrictions with exact-quote PDF citations.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 p-3.5 bg-slate-50/50">
                  <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                    <Shield className="h-4 w-4 text-slate-700" />
                    <span>Stage 4 &bull; Protect</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Add Agent and TC email recipients. Resend dispatches T-3 early warnings, T-1 notices, and day-of reminders automatically.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dos' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* DOs */}
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/30 p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Recommended Practices (DOs)</span>
                  </div>
                  <ul className="space-y-2 text-[11px] text-emerald-950">
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">&bull;</span>
                      <span><strong>Always confirm milestones</strong> immediately upon contract intake to activate email dispatch.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">&bull;</span>
                      <span><strong>Add both the Agent &amp; TC</strong> so both parties receive synchronized deadline notices.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">&bull;</span>
                      <span><strong>Mark milestones as Completed</strong> once contingency removal forms are executed.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">&bull;</span>
                      <span><strong>Use Inbound Forwarding</strong> to forward counters and addenda directly to the deal repository.</span>
                    </li>
                  </ul>
                </div>

                {/* DONTs */}
                <div className="rounded-lg border border-rose-200 bg-rose-50/30 p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="h-4 w-4 text-rose-600" />
                    <span>Avoidable Errors (DON'Ts)</span>
                  </div>
                  <ul className="space-y-2 text-[11px] text-rose-950">
                    <li className="flex items-start gap-1.5">
                      <span className="text-rose-600 font-bold">&bull;</span>
                      <span><strong>DON'T manually calculate day counts</strong> — our engine handles business days and legal state holidays.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-rose-600 font-bold">&bull;</span>
                      <span><strong>DON'T leave dates in "Pending"</strong> — unconfirmed dates will not trigger automated reminders.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-rose-600 font-bold">&bull;</span>
                      <span><strong>DON'T upload unsigned drafts</strong> — confirm mutual acceptance dates before proceeding.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-rose-600 font-bold">&bull;</span>
                      <span><strong>DON'T ignore T-1 notices</strong> — T-1 requires immediate contingency removal submission or extension request.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200 p-3 bg-white">
                <h4 className="font-semibold text-slate-900 mb-1">How does the Date Engine handle weekends and holidays?</h4>
                <p className="text-[11px] text-slate-500">
                  If a clause specifies "Business Days", the engine automatically rolls past Saturdays, Sundays, and legal federal/state holidays. Calendar day clauses roll to the next business day if the final day lands on a Sunday/holiday (per standard CAR / NAR contract rules).
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 p-3 bg-white">
                <h4 className="font-semibold text-slate-900 mb-1">What happens if a buyer misses a contingency deadline?</h4>
                <p className="text-[11px] text-slate-500">
                  The seller may issue a formal "Notice to Buyer to Perform" giving 48–72 hours to remove the contingency. If unfulfilled, the seller can cancel the transaction and attempt to claim the Earnest Money Deposit (EMD). Our system triggers an immediate <strong>Past-Due Risk Alert</strong> to prevent this.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 p-3 bg-white">
                <h4 className="font-semibold text-slate-900 mb-1">Is the audit history admissible in a broker dispute?</h4>
                <p className="text-[11px] text-slate-500">
                  Yes. The Audit Log records immutable timestamps, user IDs, previous/new date values, and Resend email delivery receipts for every single transaction event.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Contingency Copilot &bull; Legal Compliance Engine
          </span>
          <Button variant="default" size="xs" onClick={onClose}>
            Close Playbook
          </Button>
        </div>
      </div>
    </div>
  );
}
