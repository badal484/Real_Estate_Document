import type { DeadlineStatus } from '@/types';
import { Badge } from './ui/badge';
import { Clock, CheckCircle2, ShieldCheck, AlertCircle, Check, AlertTriangle } from 'lucide-react';

interface Props {
  status: DeadlineStatus | 'NEEDS_REVIEW' | 'DUE_SOON' | 'OVERDUE';
  className?: string;
}

export function StatusBadge({ status, className }: Props) {
  switch (status) {
    case 'PENDING':
    case 'NEEDS_REVIEW':
      return (
        <Badge variant="needs-review" className={className}>
          <AlertTriangle className="h-3 w-3" />
          <span>Needs Review</span>
        </Badge>
      );
    case 'DUE_SOON':
      return (
        <Badge variant="warning" className={className}>
          <Clock className="h-3 w-3" />
          <span>Due Soon</span>
        </Badge>
      );
    case 'CONFIRMED':
      return (
        <Badge variant="info" className={className}>
          <CheckCircle2 className="h-3 w-3" />
          <span>Confirmed</span>
        </Badge>
      );
    case 'ACTIVE':
      return (
        <Badge variant="success" className={className}>
          <ShieldCheck className="h-3 w-3" />
          <span>Active Monitoring</span>
        </Badge>
      );
    case 'MISSED':
    case 'OVERDUE':
      return (
        <Badge variant="danger" className={className}>
          <AlertCircle className="h-3 w-3" />
          <span>Overdue</span>
        </Badge>
      );
    case 'COMPLETED':
      return (
        <Badge variant="success" className={className}>
          <Check className="h-3 w-3" />
          <span>Completed</span>
        </Badge>
      );
    default:
      return (
        <Badge variant="neutral" className={className}>
          <span>Upcoming</span>
        </Badge>
      );
  }
}
