import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { auditApi } from '@/services/api';
import { ActivityHistory } from '@/components/ActivityHistory';
import {
  ChevronRight,
  ClipboardList,
  History,
  ShieldCheck,
  Building2,
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
        <nav className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/deals" className="hover:text-foreground transition-colors">
            Portfolio
          </Link>
          {dealId && (
            <>
              <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
              <Link to={`/deals/${dealId}`} className="hover:text-foreground transition-colors">
                Transaction Workspace
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
          <span className="font-semibold text-foreground">Immutable Audit Trail</span>
        </nav>

        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary font-mono">
            Cryptographic Audit
          </span>
          <Badge variant="neutral" className="text-[10px]">
            {logs.length} Events Logged
          </Badge>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Activity &amp; Compliance Trail
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Complete, tamper-evident log of all document uploads, AI extractions, date manual overrides, and Resend delivery dispatches.
        </p>
      </div>

      {!dealId && (
        <div className="rounded-xl border border-border/70 bg-card flex flex-col items-center justify-center p-12 text-center text-xs text-muted-foreground shadow-2xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground border border-border/60 mb-3">
            <ClipboardList className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Select a transaction</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-xs">
            Audit logs are scoped to individual deal workspaces. Choose a transaction to view its event trail.
          </p>
          <Button asChild size="sm" className="mt-4 text-xs">
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
