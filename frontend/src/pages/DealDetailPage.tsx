import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { dealsApi, auditApi, notificationsApi, deadlinesApi } from '@/services/api';
import { useDeadlines } from '@/hooks/useDeadlines';
import { Timeline } from '@/components/Timeline';
import { ActivityHistory } from '@/components/ActivityHistory';
import { DealHeader } from '@/components/deal/DealHeader';
import { DealChecklist } from '@/components/deal/DealChecklist';
import {
  IconChevronRight,
  IconExclamationTriangle,
  IconSpinner,
  IconEnvelope,
  IconCheckCircle,
} from '@/components/icons';
import type { Deal, AuditLog, NotificationSetting } from '@/types';

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

  const { deadlines, loading, error, confirmDeadline } = useDeadlines(dealId);

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

  const handleConfirmAll = async () => {
    const pendingDeadlines = deadlines.filter((d) => d.status === 'PENDING');
    for (const d of pendingDeadlines) {
      await confirmDeadline(d.id, {
        confirmedDate: d.computedDate,
        activate: true,
      });
    }
    // Refresh deal & notifications
    notificationsApi.getSettings(dealId).then(setNotifSettings).catch(() => {});
  };

  const handleSendSummary = async () => {
    if (!notifSettings?.recipients || notifSettings.recipients.length === 0) {
      alert('Please configure at least one recipient email in Notification Settings.');
      return;
    }
    setSendingSummary(true);
    setSummaryMessage(null);
    try {
      await notificationsApi.sendSummaryEmail(dealId, notifSettings.recipients);
      setSummaryMessage('Executive summary dispatched via Resend to all configured recipients.');
      setTimeout(() => setSummaryMessage(null), 4000);
    } catch (err) {
      alert(`Failed to send summary email: ${(err as Error).message}`);
    } finally {
      setSendingSummary(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto px-4 sm:px-6">
      {/* Unified Command Center Header & Tab Navigation */}
      <DealHeader deal={deal} notifSettings={notifSettings} activeTab="milestones" />

      {dealError && (
        <div className="banner-error">
          <IconExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{dealError}</span>
        </div>
      )}

      {summaryMessage && (
        <div className="banner-success">
          <IconCheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{summaryMessage}</span>
        </div>
      )}

      {/* 4-Step Transaction Compliance Checklist */}
      <DealChecklist
        dealId={dealId}
        deadlines={deadlines}
        notifSettings={notifSettings}
        onConfirmAll={handleConfirmAll}
      />

      {/* Automated Email Alerts Bar */}
      <div className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-slate-200/90 bg-white">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 border border-brand-100">
            <IconEnvelope className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">
              Automated Deadline Reminders (Resend Engine)
            </h3>
            <p className="text-[11px] text-slate-500">
              {notifSettings?.enabled && (notifSettings.recipients?.length ?? 0) > 0
                ? `${notifSettings.recipients.length} active recipient(s) &bull; Automated dispatches at 3d, 1d, and day-of deadlines.`
                : 'Alerts need recipient setup. Add agent & coordinator emails in settings.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSendSummary}
            disabled={sendingSummary}
            className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3"
          >
            {sendingSummary ? (
              <IconSpinner className="h-3.5 w-3.5 animate-spin text-brand-600" />
            ) : (
              <IconEnvelope className="h-3.5 w-3.5 text-slate-500" />
            )}
            <span>Send Summary Now</span>
          </button>

          <Link
            to={`/deals/${dealId}/notifications`}
            className="btn-secondary text-xs inline-flex items-center gap-1 py-1.5 px-3"
          >
            <span>Alert Settings</span>
            <IconChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Main Deadline Timeline */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Contingency Timeline Schedule
            </h2>
            <p className="text-xs text-slate-500">
              Deterministic deadlines calculated from contract acceptance date
            </p>
          </div>
        </div>

        {loading && (
          <div className="card flex items-center justify-center gap-2 py-12 text-xs text-slate-400">
            <IconSpinner className="h-4 w-4 animate-spin text-brand-600" />
            <span>Computing contract timeline milestones&hellip;</span>
          </div>
        )}

        {error && (
          <div className="banner-error">
            <IconExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!loading && <Timeline deadlines={deadlines} />}
      </section>

      {/* Activity History / Immutable Audit Trail */}
      <section className="pt-2">
        <ActivityHistory
          logs={auditLogs}
          loading={auditLoading}
          error={auditError}
          initialLimit={5}
        />
      </section>

      {/* Full Audit Link */}
      <div className="text-right pb-4">
        <Link
          to={`/audit?dealId=${dealId}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-900"
        >
          <span>View complete tamper-evident audit history</span>
          <IconChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}


