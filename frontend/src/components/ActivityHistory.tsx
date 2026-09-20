'use client';

import { useState } from 'react';
import type { AuditLog } from '@/types';
import { formatAuditTimestamp, formatShortDate } from '@/utils/date';

interface Props {
  logs: AuditLog[];
  loading?: boolean;
  error?: string | null;
  initialLimit?: number;
  title?: string;
}

interface EventView {
  icon: string;
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

  // Format actor
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
        icon: '🏠',
        iconBgClass: 'bg-emerald-50 ring-emerald-200 border-emerald-100',
        iconTextClass: 'text-emerald-700',
        title: 'Deal Created',
        description: address ? `Deal created for ${address}` : 'Deal created',
        actorText,
      };
    }

    case 'DOCUMENT_UPLOADED': {
      const filename = (next['filename'] as string) || (next['originalname'] as string) || note || 'document.pdf';
      return {
        icon: '📄',
        iconBgClass: 'bg-blue-50 ring-blue-200 border-blue-100',
        iconTextClass: 'text-blue-700',
        title: 'Document Uploaded',
        description: filename,
        actorText,
      };
    }

    case 'EXTRACTION_STARTED': {
      return {
        icon: '🔍',
        iconBgClass: 'bg-amber-50 ring-amber-200 border-amber-100',
        iconTextClass: 'text-amber-700',
        title: 'Extraction Started',
        description: 'AI scanning document for contingency clauses',
        actorText,
      };
    }

    case 'EXTRACTION_COMPLETED': {
      const clausesCount = (next['clauses'] as number) ?? (next['count'] as number) ?? 3;
      return {
        icon: '🤖',
        iconBgClass: 'bg-purple-50 ring-purple-200 border-purple-100',
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
        icon: '✓',
        iconBgClass: 'bg-emerald-50 ring-emerald-200 border-emerald-100',
        iconTextClass: 'text-emerald-700 font-bold',
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
        icon: '✏',
        iconBgClass: 'bg-amber-50 ring-amber-200 border-amber-100',
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
        icon: '✓',
        iconBgClass: 'bg-emerald-50 ring-emerald-200 border-emerald-100',
        iconTextClass: 'text-emerald-700 font-bold',
        title: 'Deadline Activated',
        description: `${label} alerts activated`,
        actorText,
      };
    }

    case 'ALERT_SENT': {
      const rawLabel = (next['label'] as string) || (prev['label'] as string) || (next['deadlineLabel'] as string);
      const label = formatDeadlineLabel(rawLabel);
      return {
        icon: '📨',
        iconBgClass: 'bg-indigo-50 ring-indigo-200 border-indigo-100',
        iconTextClass: 'text-indigo-700',
        title: 'Alert Sent',
        description: `Reminder sent for ${label}`,
        actorText,
      };
    }

    case 'DEAL_UPDATED': {
      return {
        icon: '📝',
        iconBgClass: 'bg-gray-50 ring-gray-200 border-gray-100',
        iconTextClass: 'text-gray-700',
        title: 'Deal Updated',
        description: 'Deal details updated',
        actorText,
      };
    }

    default: {
      return {
        icon: '📌',
        iconBgClass: 'bg-gray-50 ring-gray-200 border-gray-100',
        iconTextClass: 'text-gray-600',
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

  // Ensure newest activity is shown first
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const displayedLogs = isExpanded ? sortedLogs : sortedLogs.slice(0, initialLimit);
  const hasMore = sortedLogs.length > initialLimit;

  return (
    <div className="card p-5 border border-gray-200 bg-white rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span>{title}</span>
          {sortedLogs.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
              {sortedLogs.length}
            </span>
          )}
        </h3>
      </div>

      {loading && (
        <div className="py-6 text-center text-sm text-gray-400 flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>Loading activity history…</span>
        </div>
      )}

      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
          ⚠ {error}
        </div>
      )}

      {!loading && !error && sortedLogs.length === 0 && (
        <div className="text-center py-8 px-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
          <div className="mx-auto w-10 h-10 rounded-full bg-white shadow-xs border border-gray-200 flex items-center justify-center text-gray-400 mb-2">
            📋
          </div>
          <h4 className="text-sm font-semibold text-gray-900">No activity yet</h4>
          <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
            Important deal activity will appear here.
          </p>
        </div>
      )}

      {!loading && !error && sortedLogs.length > 0 && (
        <div>
          <ol className="relative border-l border-gray-200 ml-4 space-y-6 my-2">
            {displayedLogs.map((log) => {
              const event = parseEventDetails(log);
              return (
                <li key={log.id} className="ml-6 relative group">
                  {/* Action Icon Badge */}
                  <span
                    className={`absolute -left-[41px] top-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white ring-1 ${event.iconBgClass} text-xs ${event.iconTextClass} shadow-xs transition-transform group-hover:scale-105`}
                  >
                    {event.icon}
                  </span>

                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <div>
                      {/* Action Title */}
                      <h4 className="text-sm font-semibold text-gray-900 leading-snug">
                        {event.title}
                      </h4>
                      {/* Short Description */}
                      <p className="text-sm text-gray-700 mt-0.5 font-normal leading-relaxed">
                        {event.description}
                      </p>
                      {/* Optional diff box for edits (old → new) */}
                      {event.changeDiff && (
                        <div className="mt-1.5 inline-flex items-center px-2.5 py-1 rounded-md bg-amber-50/70 text-xs font-mono text-amber-900 border border-amber-200/60 shadow-2xs">
                          <span className="font-semibold text-amber-800 mr-1.5">Changed:</span>
                          {event.changeDiff}
                        </div>
                      )}
                    </div>

                    {/* Date/time and optional actor */}
                    <div className="text-xs text-gray-400 whitespace-nowrap shrink-0 mt-1 sm:mt-0">
                      <span>{formatAuditTimestamp(log.createdAt)}</span>
                      {event.actorText && (
                        <span className="ml-1.5 text-gray-500 font-medium">
                          • {event.actorText}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Expansion toggle */}
          {hasMore && (
            <div className="mt-5 pt-3 border-t border-gray-100 text-center">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors py-1 px-3 rounded-md hover:bg-brand-50"
              >
                {isExpanded ? (
                  <>
                    <span>Show less</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    <span>View all activity ({sortedLogs.length - initialLimit} more)</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
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
