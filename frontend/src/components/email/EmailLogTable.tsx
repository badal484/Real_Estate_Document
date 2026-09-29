import type { EmailLog } from '@/types';
import { formatAuditTimestamp } from '@/utils/date';
import { IconEnvelope, IconArrowPath } from '../icons';

interface Props {
  logs: EmailLog[];
  loading?: boolean;
  onRefresh?: () => void;
}

const TEMPLATE_NAMES: Record<string, string> = {
  '3d': '3-Day Reminder',
  '1d': '1-Day Urgent',
  'dayOf': 'Day-Of Expiration',
  'missed': 'Past Due / Missed',
  'summary': 'Executive Summary',
  'docs_received': 'Documents Received',
};

function StatusBadge({ status }: { status: EmailLog['status'] }) {
  switch (status) {
    case 'DELIVERED':
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
          Delivered
        </span>
      );
    case 'SENT':
      return (
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200">
          Dispatched
        </span>
      );
    case 'BOUNCED':
      return (
        <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-rose-200">
          Bounced
        </span>
      );
    case 'DROPPED':
      return (
        <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
          Dropped
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
          {status}
        </span>
      );
  }
}

export function EmailLogTable({ logs, loading, onRefresh }: Props) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Email Dispatch History</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Idempotent log of all automated deadline notices and summary reports sent for this deal.
          </p>
        </div>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="btn-secondary flex items-center gap-1.5 text-xs"
            disabled={loading}
          >
            <IconArrowPath className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="empty-state py-12">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm">
            <IconEnvelope className="h-5 w-5" />
          </span>
          <h4 className="mt-2 text-sm font-semibold text-slate-900">No email alerts sent yet</h4>
          <p className="mx-auto mt-1 max-w-xs text-xs text-slate-500">
            When contingency deadlines approach, scheduled alerts will be logged here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 font-semibold">Recipient</th>
                <th className="py-3 px-4 font-semibold">Alert Type</th>
                <th className="py-3 px-4 font-semibold">Associated Deadline</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Sent At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900">{log.recipient}</td>
                  <td className="py-3 px-4 text-slate-700">
                    {TEMPLATE_NAMES[log.template] ?? log.template}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {log.deadline?.label ?? 'General Deal Summary'}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={log.status} />
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap text-slate-400">
                    {formatAuditTimestamp(log.sentAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
