'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { auditApi } from '@/services/api';
import { ActivityHistory } from '@/components/ActivityHistory';
import type { AuditLog } from '@/types';

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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header & Navigation */}
      <div>
        <nav className="text-sm text-gray-500 mb-2 flex items-center gap-2">
          <Link href="/deals" className="hover:text-brand-700">Deals</Link>
          {dealId && (
            <>
              <span>/</span>
              <Link href={`/deals/${dealId}`} className="hover:text-brand-700">Deal Dashboard</Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 font-medium">Audit History</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Activity History</h1>
        <p className="text-gray-500 text-sm mt-1">
          Complete, immutable activity log of all document uploads, AI extractions, deadline edits, and notifications.
        </p>
      </div>

      {!dealId && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center bg-white">
          <p className="text-gray-500 text-sm">Select a deal to view its activity history.</p>
          <Link href="/deals" className="btn-primary mt-4">
            View All Deals
          </Link>
        </div>
      )}

      {dealId && (
        <ActivityHistory
          logs={logs}
          loading={loading}
          error={error}
          initialLimit={20}
          title="Deal Activity Log"
        />
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
