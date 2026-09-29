import { useState, type ComponentType } from 'react';
import type { AuditLog } from '@/types';
import { formatAuditTimestamp, formatShortDate } from '@/utils/date';
import {
  IconBuilding,
  IconDocumentText,
  IconMagnifyingGlass,
  IconSparkles,
  IconCheckCircle,
  IconPencilSquare,
  IconBell,
  IconClipboardList,
  IconMapPin,
  IconChevronDown,
  IconChevronUp,
  IconSpinner,
  IconExclamationTriangle,
  type IconProps,
} from './icons';

interface Props {
  logs: AuditLog[];
  loading?: boolean;
  error?: string | null;
  initialLimit?: number;
  title?: string;
}

interface EventView {
  Icon: ComponentType<IconProps>;
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
    actorText = 'by System';
  }

  switch (log.action) {
    case 'DEAL_CREATED': {
      const address = (next['propertyAddress'] as string) || (prev['propertyAddress'] as string);
      return {
        Icon: IconBuilding,
        iconBgClass: 'bg-emerald-50 ring-emerald-200',
        iconTextClass: 'text-emerald-700',
        title: 'Deal Created',
        description: address ? `Deal created for ${address}` : 'Deal created',
        actorText,
      };
    }

    case 'DOCUMENT_UPLOADED': {
      const filename = (next['filename'] as string) || (next['originalname'] as string) || note || 'document.pdf';
      return {
        Icon: IconDocumentText,
        iconBgClass: 'bg-blue-50 ring-blue-200',
        iconTextClass: 'text-blue-700',
        title: 'Document Uploaded',
        description: filename,
        actorText,
      };
    }

    case 'EXTRACTION_STARTED': {
      return {
        Icon: IconMagnifyingGlass,
        iconBgClass: 'bg-amber-50 ring-amber-200',
        iconTextClass: 'text-amber-700',
        title: 'Extraction Started',
        description: 'AI scanning document for contingency clauses',
        actorText,
      };
    }

    case 'EXTRACTION_COMPLETED': {
      const clausesCount = (next['clauses'] as number) ?? (next['count'] as number) ?? 3;
      return {
        Icon: IconSparkles,
        iconBgClass: 'bg-purple-50 ring-purple-200',
        iconTextClass: 'text-purple-700',
        title: 'Extraction Completed',
        description: `AI extracted ${clausesCount} contingency clause${clausesCount === 1 ? '' : 's'}`,
        actorText,
      };
    }

    case 'DEADLINE_CONFIRMED': {
      const rawLabel = (next['label'] as string) || (prev['label'] as string);
      const label = formatDeadlineLabel(rawLabel);
      const targetDateIso = (next['confirmedDate'] as string) || (next['computedDate'] as string);
      const formattedTarget = targetDateIso ? formatShortDate(targetDateIso) : '';
      return {
        Icon: IconCheckCircle,
        iconBgClass: 'bg-emerald-50 ring-emerald-200',
        iconTextClass: 'text-emerald-700',
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
        Icon: IconPencilSquare,
        iconBgClass: 'bg-amber-50 ring-amber-200',
        iconTextClass: 'text-amber-700',
        title: 'Deadline Edited',
        description: `${label} changed`,
        changeDiff,
        actorText,
      };
    }

    case 'DEADLINE_ACTIVATED': {
      const rawLabel = (next['label'] as string) || (prev['label'] as string);
      const label = formatDeadlineLabel(rawLabel);
      return {
        Icon: IconCheckCircle,
        iconBgClass: 'bg-emerald-50 ring-emerald-200',
        iconTextClass: 'text-emerald-700',
        title: 'Deadline Activated',
        description: `${label} alerts activated`,
        actorText,
      };
    }

    case 'ALERT_SENT': {
      const rawLabel = (next['label'] as string) || (prev['label'] as string) || (next['deadlineLabel'] as string);
      const label = formatDeadlineLabel(rawLabel);
      return {
        Icon: IconBell,
        iconBgClass: 'bg-indigo-50 ring-indigo-200',
        iconTextClass: 'text-indigo-700',
        title: 'Alert Sent',
        description: `Reminder sent for ${label}`,
        actorText,
      };
    }

    case 'DEAL_UPDATED': {
      return {
        Icon: IconClipboardList,
        iconBgClass: 'bg-slate-100 ring-slate-200',
        iconTextClass: 'text-slate-700',
        title: 'Deal Updated',
        description: 'Deal details updated',
        actorText,
      };
    }

    default: {
      return {
        Icon: IconMapPin,
        iconBgClass: 'bg-slate-100 ring-slate-200',
        iconTextClass: 'text-slate-600',
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
    <div className="card p-6">
      <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
        <h3 className="flex items-center gap-2 text-base font-bold text-slate-100">
          <span>{title}</span>
          {sortedLogs.length > 0 && (
            <span className="rounded-full bg-brand-500/15 border border-brand-500/30 px-2.5 py-0.5 text-xs font-mono text-brand-300">
              {sortedLogs.length} Events
            </span>
          )}
        </h3>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-400">
          <IconSpinner className="h-4 w-4 animate-spin text-brand-500" />
          <span>Loading activity history&hellip;</span>
        </div>
      )}

      {error && (
        <div className="banner-error">
          <IconExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && sortedLogs.length === 0 && (
        <div className="empty-state py-8">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-400 shadow-sm">
            <IconClipboardList className="h-5 w-5" />
          </span>
          <h4 className="mt-3 text-sm font-semibold text-slate-200">No activity logged yet</h4>
          <p className="mx-auto mt-1 max-w-xs text-xs text-slate-400">
            Immutable document events and deadline changes will be recorded here.
          </p>
        </div>
      )}

      {!loading && !error && sortedLogs.length > 0 && (
        <div>
          <ol className="relative my-2 ml-4 space-y-6 border-l border-slate-800">
            {displayedLogs.map((log) => {
              const event = parseEventDetails(log);
              const { Icon } = event;
              return (
                <li key={log.id} className="group relative ml-6">
                  <span
                    className={`absolute -left-[41px] top-0 flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-brand-400 shadow-md transition-transform group-hover:scale-110`}
                  >
                    <Icon className="h-4 w-4 text-brand-400" />
                  </span>

                  <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
                    <div>
                      <h4 className="text-xs font-bold leading-snug text-slate-200 uppercase tracking-wider">
                        {event.title}
                      </h4>
                      <p className="mt-1 text-xs font-normal leading-relaxed text-slate-300">
                        {event.description}
                      </p>
                      {event.changeDiff && (
                        <div className="mt-2 inline-flex items-center rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-xs text-amber-300">
                          <span className="mr-1.5 font-bold text-amber-400">Changed:</span>
                          {event.changeDiff}
                        </div>
                      )}
                    </div>

                    <div className="mt-1 shrink-0 whitespace-nowrap text-[11px] font-mono text-slate-400 sm:mt-0">
                      <span>{formatAuditTimestamp(log.createdAt)}</span>
                      {event.actorText && (
                        <span className="ml-1.5 font-sans font-medium text-slate-400">
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
            <div className="mt-6 border-t border-slate-800 pt-4 text-center">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-950 px-3.5 py-1.5 text-xs font-semibold text-brand-300 transition-colors hover:border-brand-500/40 hover:bg-brand-500/10"
              >
                {isExpanded ? (
                  <>
                    <span>Show Less</span>
                    <IconChevronUp className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    <span>View All Activity Log ({sortedLogs.length - initialLimit} More)</span>
                    <IconChevronDown className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

