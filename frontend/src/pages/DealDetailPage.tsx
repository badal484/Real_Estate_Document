import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { dealsApi, auditApi, notificationsApi } from '@/services/api';
import { useDeadlines } from '@/hooks/useDeadlines';
import { Timeline } from '@/components/Timeline';
import { ActivityHistory } from '@/components/ActivityHistory';
import {
  IconChevronRight,
  IconExclamationTriangle,
  IconSpinner,
  IconEnvelope,
  IconSparkles,
  IconCheckCircle,
} from '@/components/icons';
import type { Deal, AuditLog, NotificationSetting } from '@/types';
import { formatDate } from '@/utils/date';

export function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dealId = id!;
  const [deal, setDeal] = useState<Deal | null>(null);
  const [dealError, setDealError] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [notifSettings, setNotifSettings] = useState<NotificationSetting | null>(null);
  const [sendingSummary, setSendingSummary] = useState(false);
  const [summaryMessage, setSummaryMessage] = useState<string | null>(null);

  const { deadlines, loading, error } = useDeadlines(dealId);

  useEffect(() => {
    dealsApi
      .get(dealId)
      .then(setDeal)
      .catch((err: Error) => setDealError(err.message));

    notificationsApi
      .getSettings(dealId)
      .then(setNotifSettings)
      .catch(() => {});

    setAuditLoading(true);
    auditApi
      .list(dealId)
      .then((res) => setAuditLogs(res.data))
      .catch((err: Error) => setAuditError(err.message))
      .finally(() => setAuditLoading(false));
  }, [dealId]);

  const handleSendSummary = async () => {
    if (!notifSettings?.recipients || notifSettings.recipients.length === 0) {
      alert('Please configure at least one recipient email in Notification Settings.');
      return;
    }
    setSendingSummary(true);
    setSummaryMessage(null);
    try {
      await notificationsApi.sendSummaryEmail(dealId, notifSettings.recipients);
      setSummaryMessage('Executive summary dispatched to all configured recipients.');
      setTimeout(() => setSummaryMessage(null), 4000);
    } catch (err) {
      alert(`Failed to send summary email: ${(err as Error).message}`);
    } finally {
      setSendingSummary(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500">
        <Link to="/deals" className="hover:text-brand-700">Deals</Link>
        <IconChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <span className="font-medium text-slate-900">{deal?.propertyAddress ?? '…'}</span>
      </nav>

      {dealError && (
        <p className="banner-error mb-4">
          <IconExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {dealError}
        </p>
      )}

      {summaryMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-4 text-sm font-medium text-emerald-800 border border-emerald-200">
          <IconCheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{summaryMessage}</span>
        </div>
      )}

      {/* Deal header with action navigation */}
      {deal && (
        <div className="card flex flex-col md:flex-row md:items-center justify-between gap-4 p-5">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{deal.propertyAddress}</h1>
            <div className="mt-1 flex flex-wrap gap-4 text-sm text-slate-500">
              {deal.buyerName && <span>Buyer: <strong className="font-medium text-slate-700">{deal.buyerName}</strong></span>}
              {deal.sellerName && <span>Seller: <strong className="font-medium text-slate-700">{deal.sellerName}</strong></span>}
              {deal.acceptanceDate && <span>Accepted: <strong className="font-medium text-slate-700">{formatDate(deal.acceptanceDate)}</strong></span>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link to={`/deals/${dealId}/assistant`} className="btn-secondary flex items-center gap-1.5 text-xs py-2 px-3">
              <IconSparkles className="h-3.5 w-3.5 text-purple-600" />
              <span>Ask AI Copilot</span>
            </Link>

            <Link to={`/deals/${dealId}/notifications`} className="btn-secondary flex items-center gap-1.5 text-xs py-2 px-3">
              <IconEnvelope className="h-3.5 w-3.5 text-slate-600" />
              <span>Email Alerts</span>
            </Link>

            <Link to={`/deals/${dealId}/review`} className="btn-primary text-xs py-2 px-3">
              Review Deadlines
            </Link>
          </div>
        </div>
      )}

      {/* Email Alerts Summary Card */}
      <div className="card p-5 border-slate-200 bg-gradient-to-r from-slate-50 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-200">
            <IconEnvelope className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Automated Deadline Email Alerts</h3>
            <p className="text-xs text-slate-500">
              {notifSettings?.enabled
                ? `${notifSettings.recipients?.length ?? 0} recipient(s) active &bull; Dispatches at 3d, 1d, and day-of deadlines.`
                : 'Alerts are currently paused for this transaction.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSendSummary}
            disabled={sendingSummary}
            className="btn-secondary text-xs flex items-center gap-1"
          >
            {sendingSummary ? (
              <IconSpinner className="h-3.5 w-3.5 animate-spin text-brand-600" />
            ) : (
              <IconEnvelope className="h-3.5 w-3.5 text-slate-500" />
            )}
            <span>Send Summary</span>
          </button>

          <Link
            to={`/deals/${dealId}/notifications`}
            className="btn-secondary text-xs inline-flex items-center gap-1"
          >
            <span>Manage Settings</span>
            <IconChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Main Deadline Timeline */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Deadline Timeline</h2>
          <span className="text-xs text-slate-400">Current status &amp; scheduled dates</span>
        </div>
        {loading && (
          <div className="flex items-center gap-2 py-6 text-sm text-slate-400">
            <IconSpinner className="h-4 w-4 animate-spin text-brand-600" />
            Loading deadlines&hellip;
          </div>
        )}
        {error && (
          <p className="banner-error">
            <IconExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        )}
        {!loading && <Timeline deadlines={deadlines} />}
      </section>

      {/* Activity History / Audit Log */}
      <section className="pt-2">
        <ActivityHistory
          logs={auditLogs}
          loading={auditLoading}
          error={auditError}
          initialLimit={5}
        />
      </section>

      {/* Full Audit page link */}
      <div className="text-right">
        <Link
          to={`/audit?dealId=${dealId}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-brand-700"
        >
          <span>View complete audit history &amp; data log</span>
          <IconChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
