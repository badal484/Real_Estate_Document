import type { Deadline } from '@/types';
import { StatusBadge } from './StatusBadge';
import { formatDate, urgencyLabel, isOverdue } from '@/utils/date';
import { IconCheckCircle } from './icons';

interface Props {
  deadline: Deadline;
  onConfirm?: (deadline: Deadline) => void;
}

export function DeadlineCard({ deadline, onConfirm }: Props) {
  const effectiveDate = deadline.confirmedDate ?? deadline.computedDate;
  const overdue = isOverdue(effectiveDate) && deadline.status !== 'COMPLETED';

  return (
    <div
      className={`card-hover p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
        overdue ? 'border-l-4 border-l-rose-500 bg-rose-50/20' : 'bg-white'
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-xs font-bold text-slate-900 tracking-tight">
            {deadline.label}
          </span>
          <StatusBadge status={deadline.status} />
          {overdue && (
            <span className="rounded-full bg-rose-100 px-2 py-0.2 text-[10px] font-bold text-rose-800">
              Action Overdue
            </span>
          )}
        </div>

        {deadline.clause && (
          <div className="mt-2 border-l-2 border-slate-200 bg-slate-50/80 p-2 rounded-r text-[11px] font-mono text-slate-600 italic line-clamp-2 leading-relaxed">
            &ldquo;{deadline.clause.rawText}&rdquo;
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
          <span className={`font-mono font-bold ${overdue ? 'text-rose-600' : 'text-slate-900'}`}>
            {formatDate(effectiveDate)}
          </span>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${overdue ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600'}`}>
            {urgencyLabel(effectiveDate)}
          </span>
          <span className="text-[11px] capitalize text-slate-400 font-medium">
            {deadline.dayType.toLowerCase()} days
          </span>
        </div>
      </div>

      {deadline.status === 'PENDING' && onConfirm && (
        <button
          type="button"
          onClick={() => onConfirm(deadline)}
          className="btn-primary shrink-0 text-xs py-1.5 px-3 self-start sm:self-center"
        >
          <IconCheckCircle className="h-3.5 w-3.5" />
          <span>Confirm Date</span>
        </button>
      )}
    </div>
  );
}

