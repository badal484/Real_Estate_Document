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
    <div className="bg-white border border-[#E4E4E7] rounded-3xl p-6 shadow-clean-sm">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E4E4E7]">
        <div className="flex items-center gap-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#F4F4F5] text-[#09090B] font-semibold text-xs border border-[#E4E4E7]">
            {completedCount}/4
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#09090B] tracking-tight">
                Transaction Setup &amp; Compliance Stepper
              </h3>
              <Badge variant={percentage === 100 ? 'success' : 'neutral'} className="text-[11px] px-2.5 py-0.5 rounded-full">
                {percentage}% Ready
              </Badge>
            </div>
            <p className="text-xs text-[#71717A] mt-0.5">
              Lock in contingency dates, arm automated email alerts, and inspect legal risks.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#71717A] hover:text-[#09090B] self-end sm:self-center cursor-pointer transition-colors"
        >
          <span>{collapsed ? 'Expand Checklist' : 'Collapse'}</span>
          {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
      </div>

      {!collapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4">
          {/* Step 1: Upload */}
          <div className="bg-[#F9FAFB] border border-[#E4E4E7] rounded-2xl p-4 flex flex-col justify-between hover:border-[#D4D4D8] transition-all">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A1A1AA]">Step 1</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <h4 className="text-xs font-semibold text-[#09090B] mt-1.5">Contract Ingested</h4>
              <p className="text-xs text-[#71717A] mt-1">
                PDF parsed, text indexed, and clauses identified by AI.
              </p>
            </div>
            <span className="mt-3.5 text-xs font-medium text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Verified &bull; Ingested</span>
            </span>
          </div>

          {/* Step 2: Milestone Confirmation */}
          <div
            className={`rounded-2xl p-4 flex flex-col justify-between transition-all ${
              step2
                ? 'bg-[#F9FAFB] border border-[#E4E4E7] hover:border-[#D4D4D8]'
                : 'bg-amber-50/50 border border-amber-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-semibold uppercase tracking-wider ${
                    step2 ? 'text-[#A1A1AA]' : 'text-amber-800'
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
              <h4 className="text-xs font-semibold text-[#09090B] mt-1.5">
                {step2 ? 'Deadlines Confirmed' : 'Confirm Deadlines'}
              </h4>
              <p className="text-xs text-[#71717A] mt-1">
                {confirmedDeadlines} of {totalDeadlines} milestones verified.
              </p>
            </div>

            {!step2 && onConfirmAll ? (
              <Button
                variant="default"
                size="sm"
                onClick={handleConfirmAllClick}
                disabled={confirmingAll}
                className="mt-3.5 w-full bg-[#09090B] hover:bg-black text-white font-medium rounded-full text-xs"
              >
                {confirmingAll ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                )}
                <span>Confirm All ({totalDeadlines - confirmedDeadlines})</span>
              </Button>
            ) : (
              <span className="mt-3.5 text-xs font-medium text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>All Dates Locked</span>
              </span>
            )}
          </div>

          {/* Step 3: Alerts Setup */}
          <div className="bg-[#F9FAFB] border border-[#E4E4E7] rounded-2xl p-4 flex flex-col justify-between hover:border-[#D4D4D8] transition-all">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A1A1AA]">Step 3</span>
                {step3 ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Mail className="h-4 w-4 text-[#A1A1AA]" />
                )}
              </div>
              <h4 className="text-xs font-semibold text-[#09090B] mt-1.5">
                {step3 ? 'Alerts Armed' : 'Configure Alerts'}
              </h4>
              <p className="text-xs text-[#71717A] mt-1">
                {hasRecipients
                  ? `${notifSettings?.recipients?.length} recipient(s) monitoring.`
                  : 'Add Agent &amp; TC email for 3d/1d reminders.'}
              </p>
            </div>

            <Link
              to={`/deals/${dealId}/notifications`}
              className="mt-3.5 text-xs font-medium text-[#09090B] hover:underline inline-flex items-center gap-1 transition-colors"
            >
              <span>{step3 ? 'Manage Settings' : 'Add Recipients'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Step 4: AI Legal Copilot */}
          <div className="bg-[#F9FAFB] border border-[#E4E4E7] rounded-2xl p-4 flex flex-col justify-between hover:border-[#D4D4D8] transition-all">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A1A1AA]">Step 4</span>
                <Sparkles className="h-4 w-4 text-amber-500" />
              </div>
              <h4 className="text-xs font-semibold text-[#09090B] mt-1.5">AI Legal Review</h4>
              <p className="text-xs text-[#71717A] mt-1">
                Inspect buyer remedies, HOA clauses, and health score.
              </p>
            </div>

            <Link
              to={`/deals/${dealId}/assistant`}
              className="mt-3.5 rounded-full border border-[#E4E4E7] bg-white hover:bg-[#F4F4F5] text-[#09090B] text-xs font-medium py-1.5 px-3 flex items-center justify-center gap-1.5 transition-all shadow-clean-xs active:scale-95"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Open AI Copilot</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
