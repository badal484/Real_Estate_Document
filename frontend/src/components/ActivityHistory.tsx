import { useState, type ComponentType } from 'react';
import type { AuditLog } from '@/types';
import { formatAuditTimestamp, formatShortDate } from '@/utils/date';
import {
  Building2,
  FileText,
  Search,
  Sparkles,
  CheckCircle2,
  Edit3,
  Bell,
  ListOrdered,
  MapPin,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertTriangle,
  Send,
  Inbox,
  Database,
  History,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Props {
  logs: AuditLog[];
  loading?: boolean;
  error?: string | null;
  initialLimit?: number;
  title?: string;
}

interface EventView {
  Icon: LucideIcon;
  iconBgClass: string;
  iconTextClass: string;
  title: string;
  description: string;
  changeDiff?: string;
  actorText?: string;
}

/**
 * Normalizes deadline label so "Inspection" becomes "Inspection deadline",
 * but "Inspection Contingency" or "Financing Deadline" remains natural.
 */
function formatDeadlineLabel(rawLabel?: string | null): string {
  if (!rawLabel) return 'Contingency deadline';
  const label = rawLabel.trim();
  const lower = label.toLowerCase();
  if (lower.includes('deadline') || lower.includes('contingency')) {
    return label;
  }
  return `${label} deadline`;
}

/**
 * Safely parses audit log payload and extracts human-readable timeline details.
 */
function parseEventDetails(log: AuditLog): EventView {
  const prev = (log.previousValue as Record<string, unknown>) ?? {};
  const next = (log.newValue as Record<string, unknown>) ?? {};
  const note = log.note;

  let actorText = '';
  if (log.actor && log.actor.toLowerCase() !== 'system') {
    actorText = `by ${log.actor}`;
  } else if (log.actor === 'system') {
    actorText = 'by System Agent';
  }

  switch (log.action) {
    case 'DEAL_CREATED': {
      const address = (next['propertyAddress'] as string) || (prev['propertyAddress'] as string);
      return {
        Icon: Building2,
        iconBgClass: 'bg-success/10 ring-success/30',
        iconTextClass: 'text-success',
        title: 'Deal Ingested',
        description: address ? `Transaction workspace initialized for ${address}` : 'Transaction initialized',
        actorText,
      };
    }

    case 'DOCUMENT_UPLOADED': {
      const filename = (next['filename'] as string) || (next['originalname'] as string) || note || 'document.pdf';
      return {
        Icon: FileText,
        iconBgClass: 'bg-info/10 ring-info/30',
        iconTextClass: 'text-info',
        title: 'Contract Uploaded',
        description: filename,
        actorText,
      };
    }

    case 'EXTRACTION_STARTED': {
      return {
        Icon: Search,
        iconBgClass: 'bg-warning/10 ring-warning/30',
        iconTextClass: 'text-warning',
        title: 'Clause Extraction Initiated',
        description: 'AI model scanning PDF text layers for contingency timelines',
        actorText,
      };
    }

    case 'EXTRACTION_COMPLETED': {
      const clausesCount = (next['clauses'] as number) ?? (next['count'] as number) ?? 3;
      return {
        Icon: Sparkles,
        iconBgClass: 'bg-primary/10 ring-primary/30',
        iconTextClass: 'text-primary',
        title: 'Extraction Completed',
        description: `AI discovered ${clausesCount} binding contingency clause${clausesCount === 1 ? '' : 's'} with verified citations`,
        actorText,
      };
    }

    case 'DEADLINE_CONFIRMED': {
      const rawLabel = (next['label'] as string) || (prev['label'] as string);
      const label = formatDeadlineLabel(rawLabel);
      const targetDateIso = (next['confirmedDate'] as string) || (next['computedDate'] as string);
      const formattedTarget = targetDateIso ? formatShortDate(targetDateIso) : '';
      return {
        Icon: CheckCircle2,
        iconBgClass: 'bg-success/10 ring-success/30',
        iconTextClass: 'text-success',
        title: 'Deadline Confirmed',
        description: formattedTarget ? `${label} confirmed for ${formattedTarget}` : `${label} confirmed`,
        actorText,
      };
    }

    case 'DEADLINE_EDITED': {
      const rawLabel = (next['label'] as string) || (prev['label'] as string);
      const label = formatDeadlineLabel(rawLabel);

      const oldDateIso = (prev['computedDate'] as string) || (prev['confirmedDate'] as string);
      const newDateIso = (next['confirmedDate'] as string) || (next['computedDate'] as string);

      let changeDiff: string | undefined;
      if (oldDateIso && newDateIso) {
        changeDiff = `${formatShortDate(oldDateIso)} → ${formatShortDate(newDateIso)}`;
      }

      return {
        Icon: Edit3,
        iconBgClass: 'bg-warning/10 ring-warning/30',
        iconTextClass: 'text-warning',
        title: 'Deadline Adjusted',
        description: `${label} date modified manually`,
        changeDiff,
        actorText,
      };
    }

    case 'DEADLINE_ACTIVATED': {
      const rawLabel = (next['label'] as string) || (prev['label'] as string);
      const label = formatDeadlineLabel(rawLabel);
      return {
        Icon: CheckCircle2,
        iconBgClass: 'bg-success/10 ring-success/30',
        iconTextClass: 'text-success',
        title: 'Alert Dispatch Armed',
        description: `${label} reminders armed for automated distribution`,
        actorText,
      };
    }

    case 'ALERT_SENT': {
      const rawLabel = (next['label'] as string) || (prev['label'] as string) || (next['deadlineLabel'] as string);
      const label = formatDeadlineLabel(rawLabel);
      const recipient = (next['recipient'] as string) || (prev['recipient'] as string);
      return {
        Icon: Send,
        iconBgClass: 'bg-info/10 ring-info/30',
        iconTextClass: 'text-info',
        title: 'Email Alert Dispatched',
        description: recipient ? `${label} notice delivered to ${recipient}` : `Reminder sent for ${label}`,
        actorText,
      };
    }

    case 'EMAIL_SENT_TEST': {
      const recipient = (next['to'] as string) || 'test recipient';
      return {
        Icon: Send,
        iconBgClass: 'bg-info/10 ring-info/30',
        iconTextClass: 'text-info',
        title: 'Test Alert Dispatched',
        description: `Sample reminder delivered to ${recipient}`,
        actorText,
      };
    }

    case 'EMAIL_INBOUND_RECEIVED': {
      const from = (next['from'] as string) || 'inbound sender';
      return {
        Icon: Inbox,
        iconBgClass: 'bg-success/10 ring-success/30',
        iconTextClass: 'text-success',
        title: 'Inbound Document Received',
        description: `Forwarded contract package from ${from}`,
        actorText,
      };
    }

    case 'DOCUMENT_INDEXED': {
      const chunksCount = (next['chunksCount'] as number) ?? (next['count'] as number) ?? 1;
      const docType = (next['docType'] as string)?.replace(/_/g, ' ') || 'Document';
      return {
        Icon: Database,
        iconBgClass: 'bg-primary/10 ring-primary/30',
        iconTextClass: 'text-primary',
        title: 'Vector Index Updated',
        description: `${docType} indexed into ${chunksCount} citation-ready page embeddings`,
        actorText,
      };
    }

    case 'ASSISTANT_QUERY': {
      const citationsCount = (next['citationsCount'] as number) ?? 0;
      return {
        Icon: Sparkles,
        iconBgClass: 'bg-primary/10 ring-primary/30',
        iconTextClass: 'text-primary',
        title: 'AI Copilot Query',
        description: `Assistant answered question with ${citationsCount} verified contract citation${citationsCount === 1 ? '' : 's'}`,
        actorText,
      };
    }

    case 'DEAL_UPDATED': {
      return {
        Icon: ListOrdered,
        iconBgClass: 'bg-muted ring-border/80',
        iconTextClass: 'text-muted-foreground',
        title: 'Deal Configuration Updated',
        description: 'Deal metadata modified',
        actorText,
      };
    }

    default: {
      return {
        Icon: History,
        iconBgClass: 'bg-muted ring-border/80',
        iconTextClass: 'text-muted-foreground',
        title: (log.action as string).replace(/_/g, ' '),
        description: note || 'Activity recorded',
        actorText,
      };
    }
  }
}

export function ActivityHistory({
  logs,
  loading = false,
  error = null,
  initialLimit = 5,
  title = 'Activity History',
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const displayedLogs = isExpanded ? sortedLogs : sortedLogs.slice(0, initialLimit);
  const hasMore = sortedLogs.length > initialLimit;

  return (
    <div className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground tracking-tight">
            {title}
          </h3>
        </div>
        {sortedLogs.length > 0 && (
          <Badge variant="neutral" className="text-[11px] font-mono font-medium">
            {sortedLogs.length} events
          </Badge>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-8 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Loading audit history trail...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && sortedLogs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground border border-border/60 mb-2">
            <ListOrdered className="h-5 w-5" />
          </div>
          <h4 className="text-xs font-semibold text-foreground">No activity recorded yet</h4>
          <p className="mt-0.5 text-[11px] text-muted-foreground max-w-xs">
            Transaction milestones, AI extractions, and alert dispatches will appear here.
          </p>
        </div>
      )}

      {!loading && !error && sortedLogs.length > 0 && (
        <div>
          <ol className="relative my-2 ml-4 space-y-6 border-l border-border/70">
            {displayedLogs.map((log) => {
              const event = parseEventDetails(log);
              const { Icon } = event;
              return (
                <li key={log.id} className="group relative ml-6">
                  <span
                    className={`absolute -left-[41px] top-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background ring-1 ${event.iconBgClass} ${event.iconTextClass} shadow-2xs transition-transform group-hover:scale-105`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>

                  <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-semibold text-foreground">
                        {event.title}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {event.description}
                      </p>
                      {event.changeDiff && (
                        <div className="mt-1.5 inline-flex items-center rounded-md border border-warning/30 bg-warning/10 px-2 py-0.5 font-mono text-[11px] text-warning">
                          <span className="mr-1.5 font-semibold">Change:</span>
                          {event.changeDiff}
                        </div>
                      )}
                    </div>

                    <div className="mt-1 shrink-0 whitespace-nowrap text-[11px] font-mono text-muted-foreground sm:mt-0">
                      <span>{formatAuditTimestamp(log.createdAt)}</span>
                      {event.actorText && (
                        <span className="ml-1.5 text-foreground/70 font-sans font-medium">
                          &bull; {event.actorText}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          {hasMore && (
            <div className="mt-6 border-t border-border/60 pt-3 text-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="gap-1.5 text-xs text-primary hover:text-primary/80"
              >
                {isExpanded ? (
                  <>
                    <span>Show less</span>
                    <ChevronUp className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    <span>View all events ({sortedLogs.length - initialLimit} more)</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
