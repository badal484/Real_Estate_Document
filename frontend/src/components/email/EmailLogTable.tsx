import type { EmailLog } from '@/types';
import { formatAuditTimestamp } from '@/utils/date';
import { Mail, RotateCw, CheckCircle2, Send, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

interface Props {
  logs: EmailLog[];
  loading?: boolean;
  onRefresh?: () => void;
}

const TEMPLATE_NAMES: Record<string, string> = {
  '3d': '3-Day Prior Reminder',
  '1d': '1-Day Urgent Notice',
  'dayOf': 'Day-Of Expiration',
  'missed': 'Past Due Breach Notice',
  'summary': 'Executive Deal Brief',
  'docs_received': 'Contract Received Notice',
};

function StatusBadge({ status }: { status: EmailLog['status'] }) {
  switch (status) {
    case 'DELIVERED':
      return (
        <Badge variant="success" className="gap-1 text-[11px] font-medium">
          <CheckCircle2 className="h-3 w-3" />
          <span>Delivered</span>
        </Badge>
      );
    case 'SENT':
      return (
        <Badge variant="info" className="gap-1 text-[11px] font-medium">
          <Send className="h-3 w-3" />
          <span>Dispatched</span>
        </Badge>
      );
    case 'BOUNCED':
      return (
        <Badge variant="danger" className="gap-1 text-[11px] font-medium">
          <XCircle className="h-3 w-3" />
          <span>Bounced</span>
        </Badge>
      );
    case 'DROPPED':
      return (
        <Badge variant="warning" className="gap-1 text-[11px] font-medium">
          <AlertTriangle className="h-3 w-3" />
          <span>Dropped</span>
        </Badge>
      );
    default:
      return (
        <Badge variant="neutral" className="gap-1 text-[11px] font-medium">
          <Clock className="h-3 w-3" />
          <span>{status}</span>
        </Badge>
      );
  }
}

export function EmailLogTable({ logs, loading, onRefresh }: Props) {
  return (
    <div className="rounded-md border border-border bg-surface overflow-hidden shadow-2xs">
      <div className="flex items-center justify-between border-b border-border px-6 py-3.5 bg-secondary/30">
        <div>
          <h3 className="text-xs font-semibold text-primary-text tracking-tight flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-primary" />
            <span>Email Dispatch Audit Log</span>
          </h3>
          <p className="text-[11px] text-secondary-text mt-0.5">
            Cryptographically tracked delivery log for all compliance notices sent via Resend API.
          </p>
        </div>
        {onRefresh && (
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={onRefresh}
            disabled={loading}
            className="h-7.5 px-2.5 text-xs gap-1.5"
          >
            <RotateCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-secondary-text mb-2.5">
            <Mail className="h-5 w-5" />
          </div>
          <h4 className="text-xs font-semibold text-primary-text">No email alerts dispatched yet</h4>
          <p className="mt-1 max-w-sm text-[11px] text-secondary-text">
            When contingency deadlines trigger their reminder windows, full audit delivery logs will be recorded here.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Recipient</TableHead>
              <TableHead className="w-[25%]">Notice Type</TableHead>
              <TableHead className="w-[20%]">Associated Milestone</TableHead>
              <TableHead className="w-[12%]">Status</TableHead>
              <TableHead className="text-right">Sent At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-mono text-xs font-medium text-primary-text">
                  {log.recipient}
                </TableCell>
                <TableCell className="text-xs text-primary-text font-medium">
                  {TEMPLATE_NAMES[log.template] ?? log.template}
                </TableCell>
                <TableCell className="text-xs text-secondary-text">
                  {log.deadline?.label ?? 'General Transaction Notice'}
                </TableCell>
                <TableCell>
                  <StatusBadge status={log.status} />
                </TableCell>
                <TableCell className="text-right text-xs font-mono text-secondary-text whitespace-nowrap">
                  {formatAuditTimestamp(log.sentAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
