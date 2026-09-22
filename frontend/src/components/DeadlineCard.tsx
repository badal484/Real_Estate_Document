import type { Deadline } from '@/types';
import { StatusBadge } from './StatusBadge';
import { formatDate, urgencyLabel, isOverdue } from '@/utils/date';

interface Props {
  deadline: Deadline;
  onConfirm?: (deadline: Deadline) => void;
}

export function DeadlineCard({ deadline, onConfirm }: Props) {
  const effectiveDate = deadline.confirmedDate ?? deadline.computedDate;
  const overdue = isOverdue(effectiveDate) && deadline.status !== 'COMPLETED';

  return (
    <div
      className={`card flex items-start justify-between gap-4 p-4 ${
        overdue ? 'border-l-[3px] border-l-red-500' : ''
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate font-semibold text-slate-900">{deadline.label}</span>
          <StatusBadge status={deadline.status} />
        </div>

        {deadline.clause && (
          <p className="mt-1 line-clamp-2 text-xs text-slate-500">
            &ldquo;{deadline.clause.rawText}&rdquo;
          </p>
        )}

        <div className="mt-2 flex items-center gap-3 text-sm">
          <span className={`font-medium ${overdue ? 'text-red-600' : 'text-slate-700'}`}>
            {formatDate(effectiveDate)}
          </span>
          <span className={`text-xs ${overdue ? 'font-medium text-red-500' : 'text-slate-400'}`}>
            {urgencyLabel(effectiveDate)}
          </span>
          <span className="text-xs capitalize text-slate-400">{deadline.dayType} days</span>
        </div>
      </div>

      {deadline.status === 'PENDING' && onConfirm && (
        <button onClick={() => onConfirm(deadline)} className="btn-primary shrink-0 text-xs">
          Confirm
        </button>
      )}
    </div>
  );
}
