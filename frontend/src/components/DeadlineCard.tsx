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
    <div className={`card p-4 flex items-start justify-between gap-4 ${overdue ? 'border-red-300' : ''}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900 truncate">{deadline.label}</span>
          <StatusBadge status={deadline.status} />
        </div>

        {deadline.clause && (
          <p className="mt-1 text-xs text-gray-500 line-clamp-2">
            &ldquo;{deadline.clause.rawText}&rdquo;
          </p>
        )}

        <div className="mt-2 flex items-center gap-3 text-sm">
          <span className={`font-medium ${overdue ? 'text-red-600' : 'text-gray-700'}`}>
            {formatDate(effectiveDate)}
          </span>
          <span className={`text-xs ${overdue ? 'text-red-500' : 'text-gray-400'}`}>
            {urgencyLabel(effectiveDate)}
          </span>
          <span className="text-xs text-gray-400 capitalize">
            {deadline.dayType} days
          </span>
        </div>
      </div>

      {/* Confirm button — only shown for PENDING deadlines */}
      {deadline.status === 'PENDING' && onConfirm && (
        <button
          onClick={() => onConfirm(deadline)}
          className="btn-primary shrink-0 text-xs"
        >
          Confirm
        </button>
      )}
    </div>
  );
}
