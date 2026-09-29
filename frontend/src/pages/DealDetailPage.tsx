import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { dealsApi, auditApi, deadlinesApi } from '@/services/api';
import { useDeadlines } from '@/hooks/useDeadlines';
import { Timeline } from '@/components/Timeline';
import { ActivityHistory } from '@/components/ActivityHistory';
import { DocumentInspectorModal } from '@/components/DocumentInspectorModal';
import { EditDeadlineModal } from '@/components/EditDeadlineModal';
import {
  IconChevronRight,
  IconExclamationTriangle,
  IconSpinner,
  IconEye,
  IconDownload,
  IconClock,
  IconShieldCheck,
  IconDollar,
  IconUser,
  IconCheckCircle,
  IconPlus,
  IconSparkles,
} from '@/components/icons';
import type { Deal, AuditLog, Deadline } from '@/types';
import { formatDate } from '@/utils/date';

export function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dealId = id!;
  const [deal, setDeal] = useState<Deal | null>(null);
  const [dealError, setDealError] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [auditError, setAuditError] = useState<string | null>(null);
  const { deadlines, loading, error, refetch } = useDeadlines(dealId);

  // Modals state
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);

  useEffect(() => {
    dealsApi
      .get(dealId)
      .then(setDeal)
      .catch((err: Error) => setDealError(err.message));

    setAuditLoading(true);
    auditApi
      .list(dealId)
      .then((res) => setAuditLogs(res.data))
      .catch((err: Error) => setAuditError(err.message))
      .finally(() => setAuditLoading(false));
  }, [dealId]);

  // Quick Confirm handler
  async function handleConfirm(deadline: Deadline) {
    try {
      await deadlinesApi.confirm(dealId, deadline.id, {
        confirmedDate: deadline.computedDate,
        confirmedBy: 'Agent Reviewer',
        activate: true,
      });
      refetch();
    } catch (err) {
      alert((err as Error).message);
    }
  }

  // Generate .ics calendar download file
  function handleExportCalendar() {
    if (!deadlines.length) return;
    let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Contingency Copilot//EN\n';
    deadlines.forEach((d) => {
      const dt = new Date(d.confirmedDate || d.computedDate);
      const dtStr = dt.toISOString().replace(/-|:|\.\d\d\d/g, '');
      icsContent += `BEGIN:VEVENT\nSUMMARY:${d.label} - ${deal?.propertyAddress || 'Deal'}\nDESCRIPTION:${d.clause?.rawText || ''}\nDTSTART:${dtStr}\nDTEND:${dtStr}\nEND:VEVENT\n`;
    });
    icsContent += 'END:VCALENDAR';

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `deadlines-${dealId}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const unconfirmedCount = deadlines.filter((d) => d.status === 'PENDING').length;

  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/deals" className="hover:text-brand-300 transition-colors">Portfolio Deals</Link>
        <IconChevronRight className="h-3.5 w-3.5 text-slate-600" />
        <span className="font-semibold text-slate-100 truncate max-w-md">{deal?.propertyAddress ?? '…'}</span>
      </nav>

      {dealError && (
        <p className="banner-error">
          <IconExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {dealError}
        </p>
      )}

      {/* Hero Deal Card */}
      {deal && (
        <div className="card-glow space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="badge-emerald">Active Contract</span>
                {unconfirmedCount > 0 && (
                  <span className="badge-amber">
                    {unconfirmedCount} Needs Confirmation
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{deal.propertyAddress}</h1>

              <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-300">
                {deal.buyerName && (
                  <span className="flex items-center gap-1.5 rounded-lg bg-slate-950/80 px-3 py-1.5 border border-slate-800">
                    <IconUser className="h-3.5 w-3.5 text-brand-400" />
                    Buyer: <strong className="font-semibold text-white">{deal.buyerName}</strong>
                  </span>
                )}
                {deal.sellerName && (
                  <span className="flex items-center gap-1.5 rounded-lg bg-slate-950/80 px-3 py-1.5 border border-slate-800">
                    <IconUser className="h-3.5 w-3.5 text-emerald-400" />
                    Seller: <strong className="font-semibold text-white">{deal.sellerName}</strong>
                  </span>
                )}
                {deal.acceptanceDate && (
                  <span className="flex items-center gap-1.5 rounded-lg bg-slate-950/80 px-3 py-1.5 border border-slate-800">
                    <IconClock className="h-3.5 w-3.5 text-amber-400" />
                    Accepted: <strong className="font-mono text-white">{formatDate(deal.acceptanceDate)}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Interactive Action Toolbar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link to={`/deals/${dealId}/assistant`} className="btn-secondary text-xs py-2 px-3 border-brand-500/40 text-brand-300 hover:bg-brand-500/10">
                <IconSparkles className="h-4 w-4 text-brand-400" />
                <span>Ask AI Assistant</span>
              </Link>

              <button
                onClick={() => setInspectorOpen(true)}
                className="btn-secondary text-xs py-2 px-3"
              >
                <IconEye className="h-4 w-4 text-brand-400" />
                <span>Document Reader</span>
              </button>

              <button
                onClick={handleExportCalendar}
                className="btn-secondary text-xs py-2 px-3"
                title="Download iCal calendar file"
              >
                <IconDownload className="h-4 w-4 text-emerald-400" />
                <span>Export iCal</span>
              </button>

              <Link to={`/deals/${dealId}/review`} className="btn-primary text-xs py-2 px-4">
                <IconCheckCircle className="h-4 w-4" />
                <span>Review &amp; Confirm</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Contingency Timeline */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <IconClock className="h-5 w-5 text-brand-400" />
              Contingency Deadline Timeline
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Chronological countdown &amp; status for all extracted agreement clauses.</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {deadlines.length} Clauses Extracted
          </span>
        </div>

        {loading && (
          <div className="flex items-center gap-2 py-8 text-sm text-slate-400">
            <IconSpinner className="h-5 w-5 animate-spin text-brand-500" />
            <span>Calculating relative deadlines &amp; state holidays&hellip;</span>
          </div>
        )}

        {error && (
          <p className="banner-error">
            <IconExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        {!loading && (
          <Timeline
            deadlines={deadlines}
            onConfirm={(d) => void handleConfirm(d)}
            onEdit={(d) => setEditingDeadline(d)}
          />
        )}
      </section>

      {/* Activity History */}
      <section className="pt-4">
        <ActivityHistory
          logs={auditLogs}
          loading={auditLoading}
          error={auditError}
          initialLimit={5}
          title="Deal Compliance & Audit Activity"
        />
      </section>

      {/* Modals */}
      <DocumentInspectorModal
        isOpen={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
        propertyAddress={deal?.propertyAddress || ''}
        deadlines={deadlines}
      />

      <EditDeadlineModal
        isOpen={!!editingDeadline}
        deadline={editingDeadline}
        dealId={dealId}
        onClose={() => setEditingDeadline(null)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}

