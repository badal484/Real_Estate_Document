import { useState } from 'react';
import type { Deadline } from '@/types';
import { StatusBadge } from './StatusBadge';
import { formatDate, urgencyLabel, isOverdue } from '@/utils/date';
import { IconPencilSquare, IconDocumentText, IconClock, IconSparkles } from './icons';

interface Props {
  deadline: Deadline;
  onConfirm?: (deadline: Deadline) => void;
  onEdit?: (deadline: Deadline) => void;
}

export function DeadlineCard({ deadline, onConfirm, onEdit }: Props) {
  const [expanded, setExpanded] = useState(false);
  const effectiveDate = deadline.confirmedDate ?? deadline.computedDate;
  const overdue = isOverdue(effectiveDate) && deadline.status !== 'COMPLETED';
  const urgency = urgencyLabel(effectiveDate);

  return (
    <div
      className={`card relative overflow-hidden transition-all duration-300 hover:shadow-2xl ${
        overdue
          ? 'border-l-4 border-l-rose-500 border-rose-500/30 bg-gradient-to-r from-rose-950/20 to-slate-900'
          : deadline.status === 'PENDING'
          ? 'border-l-4 border-l-amber-500 border-amber-500/30'
          : 'border-l-4 border-l-emerald-500 border-slate-800'
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          {/* Header Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-base font-bold text-slate-100 tracking-tight">{deadline.label}</h3>
            <StatusBadge status={deadline.status} />
            <span className="rounded-md border border-slate-700/80 bg-slate-950 px-2 py-0.5 text-[11px] font-mono text-slate-400 capitalize">
              {deadline.clause?.numberOfDays ?? '17'} {deadline.dayType} days
            </span>
          </div>

          {/* Extracted Clause Preview */}
          {deadline.clause && (
            <div className="mt-2.5 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 text-xs leading-relaxed text-slate-300">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-400 flex items-center gap-1">
                  <IconSparkles className="h-3 w-3 text-brand-400" />
                  Clause Quote (Section {deadline.clause.clauseType || 'Standard'})
                </span>
                {deadline.clause.confidence && (
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {Math.round(deadline.clause.confidence * 100)}% AI Confidence
                  </span>
                )}
              </div>
              <p className={expanded ? 'text-slate-200 font-sans' : 'line-clamp-2 text-slate-300 font-sans'}>
                &ldquo;{deadline.clause.rawText}&rdquo;
              </p>
              {deadline.clause.rawText.length > 110 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="mt-1 text-[10px] font-semibold text-brand-400 hover:text-brand-300"
                >
                  {expanded ? 'Show Less' : 'Read Full Clause Quote'}
                </button>
              )}
            </div>
          )}

          {/* Date & Urgency Row */}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <IconClock className={`h-4 w-4 ${overdue ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`} />
              <span className={`font-semibold ${overdue ? 'text-rose-400' : 'text-slate-200'}`}>
                {formatDate(effectiveDate)}
              </span>
            </div>

            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${
                overdue
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : urgency.includes('today') || urgency.includes('Tomorrow') || urgency.includes('days')
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {urgency}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex shrink-0 items-center gap-2 pt-2 sm:pt-0">
          {onEdit && (
            <button
              onClick={() => onEdit(deadline)}
              className="btn-secondary text-xs py-1.5 px-3"
              title="Edit deadline date or day type"
            >
              <IconPencilSquare className="h-3.5 w-3.5" />
              <span>Edit</span>
            </button>
          )}

          {deadline.status === 'PENDING' && onConfirm && (
            <button
              onClick={() => onConfirm(deadline)}
              className="btn-primary text-xs py-1.5 px-3.5"
            >
              Confirm
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

