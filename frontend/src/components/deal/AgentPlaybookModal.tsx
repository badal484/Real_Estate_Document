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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-xs p-4 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-primary/20 bg-primary px-6 py-4 text-primary-foreground">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-hover text-primary-foreground border border-white/10">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight">Agent &amp; Coordinator Playbook</h2>
                <Badge variant="neutral" className="bg-primary-hover text-primary-foreground text-[10px] border-white/10">
                  Legal Compliance
                </Badge>
              </div>
              <p className="text-[11px] text-primary-foreground/80">
                Standard operating guidelines for contingency timelines, EMD safety, and automated alerts.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-primary-foreground/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-border bg-muted/40 px-6">
          <button
            type="button"
            onClick={() => setActiveTab('flow')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'flow'
                ? 'border-primary text-primary bg-card'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            1. The 4-Stage Workflow
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dos')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'dos'
                ? 'border-primary text-primary bg-card'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            2. Legal DOs &amp; DON'Ts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('faq')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'faq'
                ? 'border-primary text-primary bg-card'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            3. Broker Rules &amp; FAQ
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-muted-foreground leading-relaxed">
          {activeTab === 'flow' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Transaction Execution Standard
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Follow this sequence on every active purchase contract to protect buyer deposits.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="rounded-lg border border-border p-3.5 bg-background">
                  <div className="flex items-center gap-1.5 text-foreground font-bold text-xs">
                    <FileCheck className="h-4 w-4 text-primary" />
                    <span>Stage 1 &bull; Ingest</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Upload the signed purchase agreement. The AI parses the address, parties, acceptance date, and contingency terms.
                  </p>
                </div>

                <div className="rounded-lg border border-border p-3.5 bg-background">
                  <div className="flex items-center gap-1.5 text-foreground font-bold text-xs">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Stage 2 &bull; Verify</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Review extracted deadlines. Click "Confirm All" to lock deterministic dates and activate the automated monitoring engine.
                  </p>
                </div>

                <div className="rounded-lg border border-border p-3.5 bg-background">
                  <div className="flex items-center gap-1.5 text-foreground font-bold text-xs">
                    <Scale className="h-4 w-4 text-primary" />
                    <span>Stage 3 &bull; Intelligence</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Query the contract via AI Copilot for buyer remedies, repair notice periods, and HOA restrictions with exact-quote PDF citations.
                  </p>
                </div>

                <div className="rounded-lg border border-border p-3.5 bg-background">
                  <div className="flex items-center gap-1.5 text-foreground font-bold text-xs">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>Stage 4 &bull; Protect</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
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
                <div className="rounded-lg border border-success/30 bg-success/10 p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-success font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span>Recommended Practices (DOs)</span>
                  </div>
                  <ul className="space-y-2 text-[11px] text-foreground">
                    <li className="flex items-start gap-1.5">
                      <span className="text-success font-bold">&bull;</span>
                      <span><strong>Always confirm milestones</strong> immediately upon contract intake to activate email dispatch.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-success font-bold">&bull;</span>
                      <span><strong>Add both the Agent &amp; TC</strong> so both parties receive synchronized deadline notices.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-success font-bold">&bull;</span>
                      <span><strong>Mark milestones as Completed</strong> once contingency removal forms are executed.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-success font-bold">&bull;</span>
                      <span><strong>Use Inbound Forwarding</strong> to forward counters and addenda directly to the deal repository.</span>
                    </li>
                  </ul>
                </div>

                {/* DONTs */}
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-destructive font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span>Avoidable Errors (DON'Ts)</span>
                  </div>
                  <ul className="space-y-2 text-[11px] text-foreground">
                    <li className="flex items-start gap-1.5">
                      <span className="text-destructive font-bold">&bull;</span>
                      <span><strong>DON'T manually calculate day counts</strong> — our engine handles business days and legal state holidays.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-destructive font-bold">&bull;</span>
                      <span><strong>DON'T leave dates in "Pending"</strong> — unconfirmed dates will not trigger automated reminders.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-destructive font-bold">&bull;</span>
                      <span><strong>DON'T upload unsigned drafts</strong> — confirm mutual acceptance dates before proceeding.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-destructive font-bold">&bull;</span>
                      <span><strong>DON'T ignore T-1 notices</strong> — T-1 requires immediate contingency removal submission or extension request.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-3">
              <div className="rounded-lg border border-border p-3 bg-card">
                <h4 className="font-semibold text-foreground mb-1">How does the Date Engine handle weekends and holidays?</h4>
                <p className="text-[11px] text-muted-foreground">
                  If a clause specifies "Business Days", the engine automatically rolls past Saturdays, Sundays, and legal federal/state holidays. Calendar day clauses roll to the next business day if the final day lands on a Sunday/holiday (per standard CAR / NAR contract rules).
                </p>
              </div>

              <div className="rounded-lg border border-border p-3 bg-card">
                <h4 className="font-semibold text-foreground mb-1">What happens if a buyer misses a contingency deadline?</h4>
                <p className="text-[11px] text-muted-foreground">
                  The seller may issue a formal "Notice to Buyer to Perform" giving 48–72 hours to remove the contingency. If unfulfilled, the seller can cancel the transaction and attempt to claim the Earnest Money Deposit (EMD). Our system triggers an immediate <strong>Past-Due Risk Alert</strong> to prevent this.
                </p>
              </div>

              <div className="rounded-lg border border-border p-3 bg-card">
                <h4 className="font-semibold text-foreground mb-1">Is the audit history admissible in a broker dispute?</h4>
                <p className="text-[11px] text-muted-foreground">
                  Yes. The Audit Log records immutable timestamps, user IDs, previous/new date values, and Resend email delivery receipts for every single transaction event.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-muted/30 px-6 py-3 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
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
