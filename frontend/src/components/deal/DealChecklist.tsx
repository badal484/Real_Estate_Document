import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Deadline, NotificationSetting } from '@/types';
import {
  IconCheckCircle,
  IconChevronRight,
  IconSparkles,
  IconEnvelope,
  IconDocumentText,
  IconExclamationTriangle,
  IconSpinner,
} from '../icons';

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
  const confirmedDeadlines = deadlines.filter((d) => d.status === 'CONFIRMED' || d.status === 'ACTIVE' || d.status === 'COMPLETED').length;
  const allDeadlinesConfirmed = totalDeadlines > 0 && confirmedDeadlines === totalDeadlines;

  const hasRecipients = (notifSettings?.recipients?.length ?? 0) > 0;
  const alertsEnabled = notifSettings?.enabled ?? false;

  // Step 1: Uploaded (always true if we are on this deal page)
  const step1 = true;
  // Step 2: Milestones confirmed
  const step2 = allDeadlinesConfirmed;
  // Step 3: Alert recipients configured
  const step3 = hasRecipients && alertsEnabled;
  // Step 4: AI review available
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
    <div className="card border-brand-200/80 bg-gradient-to-br from-white via-brand-50/20 to-slate-50/50 p-5 shadow-xs overflow-hidden transition-all">
      {/* Header & Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-700 text-white font-bold text-xs shadow-xs">
            {completedCount}/4
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                Transaction Setup &amp; Compliance Checklist
              </h3>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                percentage === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-brand-100 text-brand-800'
              }`}>
                {percentage}% Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Follow these steps to lock in deadlines, arm automated reminders, and eliminate transaction risk.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 self-end sm:self-center"
        >
          {collapsed ? 'Show Checklist &darr;' : 'Hide Checklist &uarr;'}
        </button>
      </div>

      {!collapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
          {/* Step 1: Upload */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Step 1</span>
                <IconCheckCircle className="h-4 w-4 text-emerald-600" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-1">Contract Ingested</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                PDF parsed, text indexed, and clauses identified by AI.
              </p>
            </div>
            <span className="mt-2 text-[10px] font-semibold text-emerald-700">Completed &bull; Verified</span>
          </div>

          {/* Step 2: Milestone Confirmation */}
          <div className={`rounded-xl border p-3 flex flex-col justify-between ${
            step2 ? 'border-emerald-200 bg-emerald-50/40' : 'border-amber-200 bg-amber-50/40'
          }`}>
            <div>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  step2 ? 'text-emerald-700' : 'text-amber-800'
                }`}>
                  Step 2
                </span>
                {step2 ? (
                  <IconCheckCircle className="h-4 w-4 text-emerald-600" />
                ) : (
                  <IconExclamationTriangle className="h-4 w-4 text-amber-600" />
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-1">
                {step2 ? 'Deadlines Confirmed' : 'Confirm Deadlines'}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {confirmedDeadlines} of {totalDeadlines} milestones verified.
              </p>
            </div>

            {!step2 && onConfirmAll && (
              <button
                type="button"
                onClick={handleConfirmAllClick}
                disabled={confirmingAll}
                className="mt-2 btn-brand text-[10px] py-1 px-2.5 flex items-center justify-center gap-1"
              >
                {confirmingAll ? (
                  <IconSpinner className="h-3 w-3 animate-spin text-white" />
                ) : (
                  <IconCheckCircle className="h-3 w-3" />
                )}
                <span>Confirm All ({totalDeadlines - confirmedDeadlines})</span>
              </button>
            )}
            {step2 && (
              <span className="mt-2 text-[10px] font-semibold text-emerald-700">All Dates Locked</span>
            )}
          </div>

          {/* Step 3: Alerts Setup */}
          <div className={`rounded-xl border p-3 flex flex-col justify-between ${
            step3 ? 'border-emerald-200 bg-emerald-50/40' : 'border-brand-200 bg-white'
          }`}>
            <div>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  step3 ? 'text-emerald-700' : 'text-brand-700'
                }`}>
                  Step 3
                </span>
                {step3 ? (
                  <IconCheckCircle className="h-4 w-4 text-emerald-600" />
                ) : (
                  <IconEnvelope className="h-4 w-4 text-brand-600" />
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-1">
                {step3 ? 'Alerts Armed' : 'Configure Recipients'}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {hasRecipients
                  ? `${notifSettings?.recipients?.length} recipient(s) monitoring.`
                  : 'Add Agent &amp; TC email for 3d/1d reminders.'}
              </p>
            </div>

            <Link
              to={`/deals/${dealId}/notifications`}
              className="mt-2 text-[10px] font-bold text-brand-700 hover:text-brand-900 inline-flex items-center gap-1"
            >
              <span>{step3 ? 'Manage Settings &rarr;' : 'Add Recipients &rarr;'}</span>
            </Link>
          </div>

          {/* Step 4: AI Legal Copilot */}
          <div className="rounded-xl border border-slate-200 bg-white p-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Step 4</span>
                <IconSparkles className="h-4 w-4 text-brand-500" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-1">AI Legal Review</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Inspect buyer remedies, HOA clauses, and health score.
              </p>
            </div>

            <Link
              to={`/deals/${dealId}/assistant`}
              className="mt-2 btn-secondary text-[10px] py-1 px-2 flex items-center justify-center gap-1 text-slate-700"
            >
              <IconSparkles className="h-3 w-3 text-brand-600" />
              <span>Open AI Copilot &rarr;</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
