import type { Deadline } from '@/types';
import { StatusBadge } from './StatusBadge';
import { formatDate, urgencyLabel, isOverdue } from '@/utils/date';
import { CheckCircle2, Calendar, Clock, AlertTriangle, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface Props {
  deadline: Deadline;
  onConfirm?: (deadline: Deadline) => void;
}

export function DeadlineCard({ deadline, onConfirm }: Props) {
  const effectiveDate = deadline.confirmedDate ?? deadline.computedDate;
  const overdue = isOverdue(effectiveDate) && deadline.status !== 'COMPLETED';

  let borderStyle = 'border-border bg-surface';
  if (overdue) {
    borderStyle = 'border-danger-border bg-danger-light/40';
  } else if (deadline.status === 'PENDING') {
    borderStyle = 'border-warning-border bg-warning-light/30';
  }

  return (
    <div className={`rounded-md border p-4 transition-colors ${borderStyle} shadow-2xs`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-xs font-bold text-primary-text tracking-tight">
              {deadline.label}
            </span>
            <StatusBadge status={deadline.status} />
            {overdue && (
              <Badge variant="danger" className="text-[10px]">
                <AlertTriangle className="h-2.5 w-2.5" />
                <span>Overdue Action Required</span>
              </Badge>
            )}
          </div>

          {deadline.clause && (
            <div className="mt-2.5 border-l-2 border-border bg-secondary/50 p-2.5 rounded-r text-[11px] font-mono text-secondary-text line-clamp-2 leading-relaxed">
              &ldquo;{deadline.clause.rawText}&rdquo;
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 font-mono font-semibold text-primary-text">
              <Calendar className="h-3.5 w-3.5 text-secondary-text" />
              <span className={overdue ? 'text-danger font-bold' : 'text-primary-text'}>
                {formatDate(effectiveDate)}
              </span>
            </div>

            <Badge variant={overdue ? 'danger' : 'neutral'} className="text-[10px]">
              <Clock className="h-2.5 w-2.5" />
              <span>{urgencyLabel(effectiveDate)}</span>
            </Badge>

            <span className="text-[11px] capitalize text-secondary-text font-medium">
              {deadline.dayType.toLowerCase()} days calculation
            </span>
          </div>
        </div>

        {deadline.status === 'PENDING' && onConfirm && (
          <Button
            variant="default"
            size="xs"
            onClick={() => onConfirm(deadline)}
            className="shrink-0 self-start sm:self-center font-semibold"
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            <span>Confirm Date</span>
          </Button>
        )}
      </div>
    </div>
  );
}
