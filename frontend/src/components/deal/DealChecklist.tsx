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
    <div className="rounded-lg border border-border bg-surface p-4 shadow-2xs">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white font-bold text-xs">
            {completedCount}/4
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-primary-text tracking-tight">
                Transaction Setup &amp; Verification Pipeline
              </h3>
              <Badge variant={percentage === 100 ? 'success' : 'neutral'}>
                {percentage}% Configured
              </Badge>
            </div>
            <p className="text-[11px] text-secondary-text mt-0.5">
              Verify deadlines, arm automated reminders, and review contractual remedies.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-secondary-text hover:text-primary-text self-end sm:self-center transition-colors"
        >
          <span>{collapsed ? 'Expand Pipeline' : 'Collapse'}</span>
          {collapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
        </button>
      </div>

      {!collapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3.5">
          {/* Step 1: Upload */}
          <div className="rounded-md border border-border bg-secondary/30 p-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary-text">Step 1</span>
                <CheckCircle2 className="h-4 w-4 text-success" />
              </div>
              <h4 className="text-xs font-semibold text-primary-text mt-1">Contract Ingested</h4>
              <p className="text-[11px] text-secondary-text mt-0.5">
                PDF parsed, text indexed, and clauses identified.
              </p>
            </div>
            <span className="mt-2 text-[10px] font-semibold text-success">Verified &bull; Ready</span>
          </div>

          {/* Step 2: Milestone Confirmation */}
          <div
            className={`rounded-md border p-3 flex flex-col justify-between ${
              step2 ? 'border-border bg-secondary/30' : 'border-warning-border bg-warning-light'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    step2 ? 'text-secondary-text' : 'text-warning'
                  }`}
                >
                  Step 2
                </span>
                {step2 ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-warning" />
                )}
              </div>
              <h4 className="text-xs font-semibold text-primary-text mt-1">
                {step2 ? 'Deadlines Confirmed' : 'Confirm Deadlines'}
              </h4>
              <p className="text-[11px] text-secondary-text mt-0.5">
                {confirmedDeadlines} of {totalDeadlines} milestones verified.
              </p>
            </div>

            {!step2 && onConfirmAll ? (
              <Button
                variant="default"
                size="xs"
                onClick={handleConfirmAllClick}
                disabled={confirmingAll}
                className="mt-2 w-full font-semibold"
              >
                {confirmingAll ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                )}
                <span>Confirm All ({totalDeadlines - confirmedDeadlines})</span>
              </Button>
            ) : (
              <span className="mt-2 text-[10px] font-semibold text-success">All Dates Confirmed</span>
            )}
          </div>

          {/* Step 3: Alerts Setup */}
          <div
            className={`rounded-md border p-3 flex flex-col justify-between ${
              step3 ? 'border-border bg-secondary/30' : 'border-border bg-surface'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary-text">Step 3</span>
                {step3 ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <Mail className="h-4 w-4 text-secondary-text" />
                )}
              </div>
              <h4 className="text-xs font-semibold text-primary-text mt-1">
                {step3 ? 'Alerts Armed' : 'Configure Alerts'}
              </h4>
              <p className="text-[11px] text-secondary-text mt-0.5">
                {hasRecipients
                  ? `${notifSettings?.recipients?.length} recipient(s) monitoring.`
                  : 'Add Agent &amp; TC email for 3d/1d reminders.'}
              </p>
            </div>

            <Link
              to={`/deals/${dealId}/notifications`}
              className="mt-2 text-[10px] font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              <span>{step3 ? 'Manage Recipients' : 'Add Recipients'}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Step 4: AI Legal Copilot */}
          <div className="rounded-md border border-border bg-secondary/30 p-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary-text">Step 4</span>
                <Sparkles className="h-4 w-4 text-accent" />
              </div>
              <h4 className="text-xs font-semibold text-primary-text mt-1">AI Legal Review</h4>
              <p className="text-[11px] text-secondary-text mt-0.5">
                Inspect buyer remedies, HOA clauses, and transaction risk.
              </p>
            </div>

            <Link
              to={`/deals/${dealId}/assistant`}
              className="mt-2 btn-secondary text-[10px] py-1 px-2 flex items-center justify-center gap-1"
            >
              <Sparkles className="h-3 w-3 text-accent" />
              <span>Open AI Copilot</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
