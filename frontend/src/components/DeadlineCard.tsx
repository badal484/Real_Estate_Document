import type { Deadline } from '@/types';
import { StatusBadge } from './StatusBadge';
import { formatDate, urgencyLabel, isOverdue } from '@/utils/date';
import { CheckCircle2, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface Props {
  deadline: Deadline;
  onConfirm?: (deadline: Deadline) => void;
}

export function DeadlineCard({ deadline, onConfirm }: Props) {
  const effectiveDate = deadline.confirmedDate ?? deadline.computedDate;
  const overdue = isOverdue(effectiveDate) && deadline.status !== 'COMPLETED';

  return (
    <div
      className={`rounded-2xl border p-5 transition-all ${
        overdue
          ? 'border-rose-200 bg-rose-50/50 shadow-clean-sm'
          : 'border-[#E4E4E7] bg-white shadow-clean-xs hover:shadow-clean-sm hover:border-neutral-300'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-bold text-[#09090B] tracking-tight">
              {deadline.label}
            </span>
            <StatusBadge status={deadline.status} />
            {overdue && (
              <Badge variant="destructive" className="text-[10px]">
                <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                Action Required
              </Badge>
            )}
          </div>

          {deadline.clause && (
            <div className="mt-2.5 border-l-2 border-black bg-[#F9FAFB] p-2.5 rounded-r-xl text-xs font-mono text-[#52525B] italic line-clamp-2 leading-relaxed">
              &ldquo;{deadline.clause.rawText}&rdquo;
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-[#09090B]">
              <Calendar className="h-3.5 w-3.5 text-neutral-600" />
              <span className={overdue ? 'text-rose-600 font-bold' : 'text-[#09090B] font-semibold'}>
                {formatDate(effectiveDate)}
              </span>
            </div>

            <Badge variant={overdue ? 'destructive' : 'neutral'} className="text-[10px]">
              <Clock className="h-2.5 w-2.5 mr-0.5" />
              {urgencyLabel(effectiveDate)}
            </Badge>

            <span className="text-[11px] capitalize text-[#71717A] font-medium">
              {deadline.dayType.toLowerCase()} days
            </span>
          </div>
        </div>

        {deadline.status === 'PENDING' && onConfirm && (
          <Button
            variant="default"
            size="xs"
            onClick={() => onConfirm(deadline)}
            className="shrink-0 self-start sm:self-center btn-pill-primary text-[11px] px-3.5 py-1.5"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            <span>Confirm Date</span>
          </Button>
        )}
      </div>
    </div>
  );
}
