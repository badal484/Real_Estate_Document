import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { auditApi } from '@/services/api';
import { ActivityHistory } from '@/components/ActivityHistory';
import {
  ChevronRight,
  ClipboardList,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { AuditLog } from '@/types';

export function AuditPage() {
  const [searchParams] = useSearchParams();
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
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Header & Navigation */}
      <div>
        <nav className="mb-3 flex items-center gap-2 text-xs text-[#71717A]">
          <Link to="/deals" className="hover:text-[#09090B] font-medium transition-colors">
            Portfolio
          </Link>
          {dealId && (
            <>
              <ChevronRight className="h-3 w-3 text-[#A1A1AA]" />
              <Link to={`/deals/${dealId}`} className="hover:text-[#09090B] font-medium transition-colors">
                Transaction Workspace
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3 text-[#A1A1AA]" />
          <span className="font-semibold text-[#09090B]">Immutable Audit Trail</span>
        </nav>

        <div className="flex items-center gap-2.5 mb-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#09090B]">
            Cryptographic Audit
          </span>
          <Badge variant="neutral" className="text-[10px] px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border-zinc-200">
            {logs.length} Events Logged
          </Badge>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-[#09090B] sm:text-3xl">
          Activity &amp; Compliance Trail
        </h1>
        <p className="mt-1 text-xs text-[#71717A]">
          Complete, tamper-evident log of all document uploads, AI extractions, date manual overrides, and Resend delivery dispatches.
        </p>
      </div>

      {!dealId && (
        <div className="rounded-3xl border border-[#E4E4E7] bg-white flex flex-col items-center justify-center p-12 text-center text-xs text-[#71717A] shadow-clean-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4F4F5] text-[#09090B] border border-[#E4E4E7] mb-3">
            <ClipboardList className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-[#09090B]">Select a transaction</h3>
          <p className="mt-1 text-xs text-[#71717A] max-w-xs">
            Audit logs are scoped to individual deal workspaces. Choose a transaction to view its event trail.
          </p>
          <Button asChild size="sm" className="mt-4 rounded-full text-xs font-medium px-4 bg-[#09090B] hover:bg-black text-white">
            <Link to="/deals">
              <span>View All Transactions</span>
            </Link>
          </Button>
        </div>
      )}

      {dealId && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button asChild variant="secondary" size="sm" className="gap-1.5 text-xs font-medium rounded-full bg-[#F4F4F5] hover:bg-white border border-[#E4E4E7]">
              <Link to={`/deals/${dealId}`}>
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Workspace</span>
              </Link>
            </Button>
          </div>

          <ActivityHistory
            logs={logs}
            loading={loading}
            error={error}
            initialLimit={50}
            title="Complete Immutable Audit Record"
          />
        </div>
      )}
    </div>
  );
}
