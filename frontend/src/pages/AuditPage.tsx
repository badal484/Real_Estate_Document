import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { auditApi } from '@/services/api';
import { ActivityHistory } from '@/components/ActivityHistory';
import {
  ChevronRight,
  ClipboardList,
  History,
  ShieldCheck,
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
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header & Navigation */}
      <div>
        <nav className="mb-2 flex items-center gap-1.5 text-xs text-secondary-text">
          <Link to="/deals" className="hover:text-primary-text transition-colors">
            Transactions
          </Link>
          {dealId && (
            <>
              <ChevronRight className="h-3 w-3 text-secondary-text/50" />
              <Link to={`/deals/${dealId}`} className="hover:text-primary-text transition-colors">
                Transaction Workspace
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3 text-secondary-text/50" />
          <span className="font-semibold text-primary-text">Immutable Audit Trail</span>
        </nav>

        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary font-mono">
            Cryptographic Audit
          </span>
          <Badge variant="neutral" className="text-[10px]">
            {logs.length} Events Logged
          </Badge>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-primary-text sm:text-3xl">
          Activity &amp; Compliance Trail
        </h1>
        <p className="mt-1 text-xs text-secondary-text">
          Complete, tamper-evident log of all document uploads, AI extractions, date manual overrides, and Resend delivery dispatches.
        </p>
      </div>

      {!dealId && (
        <div className="empty-state">
          <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-md bg-secondary text-secondary-text mb-3">
            <ClipboardList className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-primary-text">Select a transaction</h3>
          <p className="mt-1 text-xs text-secondary-text max-w-xs mx-auto">
            Audit logs are scoped to individual deal workspaces. Choose a transaction to view its event trail.
          </p>
          <Button asChild size="sm" className="mt-4 text-xs font-semibold">
            <Link to="/deals">
              <span>View All Transactions</span>
            </Link>
          </Button>
        </div>
      )}

      {dealId && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button asChild variant="secondary" size="xs" className="gap-1 text-xs">
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
