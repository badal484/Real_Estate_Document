'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { auditApi } from '@/services/api';
import type { AuditLog } from '@/types';
import { formatDateTime } from '@/utils/date';

const ACTION_LABELS: Record<string, string> = {
  DOCUMENT_UPLOADED:     '📄 Document Uploaded',
  EXTRACTION_STARTED:    '🔍 Extraction Started',
  EXTRACTION_COMPLETED:  '✅ Extraction Completed',
  DEADLINE_CONFIRMED:    '✔ Deadline Confirmed',
  DEADLINE_EDITED:       '✏ Deadline Edited',
  DEADLINE_ACTIVATED:    '🔔 Deadline Activated',
  ALERT_SENT:            '📨 Alert Sent',
  DEAL_CREATED:          '🏠 Deal Created',
  DEAL_UPDATED:          '📝 Deal Updated',
};

function AuditPageInner() {
  const searchParams = useSearchParams();
  const dealId = searchParams.get('dealId') ?? '';
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dealId) return;
    setLoading(true);
    auditApi
      .list(dealId)
      .then((r) => setLogs(r.data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [dealId]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Audit Log</h1>
      <p className="text-gray-500 text-sm mb-8">
        Immutable record of every extraction, confirmation, edit, and alert for this deal.
      </p>

      {!dealId && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">Select a deal to view its audit log.</p>
        </div>
      )}

      {loading && <p className="text-gray-400 text-sm">Loading…</p>}
      {error && <p className="text-red-600 text-sm">⚠ {error}</p>}

      {logs.length > 0 && (
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actor</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-400 text-xs whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                  <td className="px-6 py-3 font-medium text-gray-800 whitespace-nowrap">
                    {ACTION_LABELS[log.action] ?? log.action}
                  </td>
                  <td className="px-6 py-3 text-gray-500 text-xs">{log.entityType ?? '—'}</td>
                  <td className="px-6 py-3 text-gray-500 text-xs">{log.actor ?? 'system'}</td>
                  <td className="px-6 py-3 text-gray-400 text-xs font-mono max-w-xs truncate">
                    {log.newValue ? JSON.stringify(log.newValue) : '—'}
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

export default function AuditPage() {
  return (
    <Suspense fallback={<p className="text-gray-400 text-sm">Loading…</p>}>
      <AuditPageInner />
    </Suspense>
  );
}
