import type { DeadlineStatus } from '@/types';
import { Badge } from './ui/badge';
import { Clock, CheckCircle2, ShieldCheck, AlertCircle, Check } from 'lucide-react';

interface Props {
  status: DeadlineStatus;
  className?: string;
}

export function StatusBadge({ status, className }: Props) {
  switch (status) {
    case 'PENDING':
      return (
        <Badge variant="warning" className={className}>
          <Clock className="h-3 w-3" />
          <span>Pending Confirmation</span>
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
          <span>Active &bull; Monitored</span>
        </Badge>
      );
    case 'MISSED':
      return (
        <Badge variant="destructive" className={className}>
          <AlertCircle className="h-3 w-3" />
          <span>Past Due &bull; Action Req.</span>
        </Badge>
      );
    case 'COMPLETED':
      return (
        <Badge variant="neutral" className={className}>
          <Check className="h-3 w-3" />
          <span>Completed</span>
        </Badge>
      );
  }
}
