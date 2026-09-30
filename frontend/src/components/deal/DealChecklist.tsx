import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Deadline, NotificationSetting } from '@/types';
import {
  CheckCircle2,
  AlertTriangle,
  Mail,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface Props {
  dealId: string;
  deadlines: Deadline[];
  notifSettings: NotificationSetting | null;
  onConfirmAll?: () => Promise<void>;
}

export function DealChecklist({ dealId, deadlines, notifSettings, onConfirmAll }: Props) {
  const [confirmingAll, setConfirmingAll] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const totalDeadlines = deadlines.length;
  const confirmedDeadlines = deadlines.filter(
    (d) => d.status === 'CONFIRMED' || d.status === 'ACTIVE' || d.status === 'COMPLETED',
  ).length;
  const allDeadlinesConfirmed = totalDeadlines > 0 && confirmedDeadlines === totalDeadlines;

  const hasRecipients = (notifSettings?.recipients?.length ?? 0) > 0;
  const alertsEnabled = notifSettings?.enabled ?? false;

  const step1 = true;
  const step2 = allDeadlinesConfirmed;
  const step3 = hasRecipients && alertsEnabled;
  const step4 = totalDeadlines > 0;

  const completedCount = [step1, step2, step3, step4].filter(Boolean).length;
  const percentage = Math.round((completedCount / 4) * 100);

  const handleConfirmAllClick = async () => {
    if (!onConfirmAll) return;
    setConfirmingAll(true);
    try {
      await onConfirmAll();
    } finally {
      setConfirmingAll(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-4.5 shadow-sm">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
        <div className="flex items-center gap-3">
          <div className="flex h-7.5 w-7.5 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-xs ring-1 ring-white/20">
            {completedCount}/4
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                Transaction Setup &amp; Compliance Stepper
              </h3>
              <Badge variant={percentage === 100 ? 'success' : 'neutral'} className="glass-badge text-[10px]">
                {percentage}% Ready
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Lock in contingency dates, arm automated email alerts, and inspect legal risks.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900 self-end sm:self-center cursor-pointer transition-colors"
        >
          <span>{collapsed ? 'Expand Checklist' : 'Collapse'}</span>
          {collapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </button>
      </div>

      {!collapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3.5">
          {/* Step 1: Upload */}
          <div className="glass-card rounded-xl p-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 1</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-1">Contract Ingested</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                PDF parsed, text indexed, and clauses identified by AI.
              </p>
            </div>
            <span className="mt-2 text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>Verified &bull; Ingested</span>
            </span>
          </div>

          {/* Step 2: Milestone Confirmation */}
          <div
            className={`glass-card rounded-xl p-3 flex flex-col justify-between ${
              step2 ? '' : 'border-amber-300/80 bg-amber-50/40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    step2 ? 'text-slate-400' : 'text-amber-800'
                  }`}
                >
                  Step 2
                </span>
                {step2 ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-1">
                {step2 ? 'Deadlines Confirmed' : 'Confirm Deadlines'}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {confirmedDeadlines} of {totalDeadlines} milestones verified.
              </p>
            </div>

            {!step2 && onConfirmAll ? (
              <Button
                variant="default"
                size="xs"
                onClick={handleConfirmAllClick}
                disabled={confirmingAll}
                className="mt-2 w-full shadow-2xs"
              >
                {confirmingAll ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                )}
                <span>Confirm All ({totalDeadlines - confirmedDeadlines})</span>
              </Button>
            ) : (
              <span className="mt-2 text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>All Dates Locked</span>
              </span>
            )}
          </div>

          {/* Step 3: Alerts Setup */}
          <div className="glass-card rounded-xl p-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 3</span>
                {step3 ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Mail className="h-4 w-4 text-slate-400" />
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-1">
                {step3 ? 'Alerts Armed' : 'Configure Alerts'}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {hasRecipients
                  ? `${notifSettings?.recipients?.length} recipient(s) monitoring.`
                  : 'Add Agent &amp; TC email for 3d/1d reminders.'}
              </p>
            </div>

            <Link
              to={`/deals/${dealId}/notifications`}
              className="mt-2 text-[10px] font-semibold text-slate-900 hover:text-sky-600 inline-flex items-center gap-1 transition-colors"
            >
              <span>{step3 ? 'Manage Settings' : 'Add Recipients'}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Step 4: AI Legal Copilot */}
          <div className="glass-card rounded-xl p-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 4</span>
                <Sparkles className="h-4 w-4 text-sky-600" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-1">AI Legal Review</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Inspect buyer remedies, HOA clauses, and health score.
              </p>
            </div>

            <Link
              to={`/deals/${dealId}/assistant`}
              className="mt-2 btn-secondary text-[10px] py-1 px-2.5 flex items-center justify-center gap-1"
            >
              <Sparkles className="h-3 w-3 text-sky-600" />
              <span>Open AI Copilot</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
