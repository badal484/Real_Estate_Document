import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { dealsApi, auditApi, notificationsApi } from '@/services/api';
import { useDeadlines } from '@/hooks/useDeadlines';
import { Timeline } from '@/components/Timeline';
import { ActivityHistory } from '@/components/ActivityHistory';
import { DealHeader } from '@/components/deal/DealHeader';
import { DealChecklist } from '@/components/deal/DealChecklist';
import {
  ChevronRight,
  AlertTriangle,
  Loader2,
  Mail,
  CheckCircle2,
  Send,
  SlidersHorizontal,
  History,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
      setSummaryMessage('Executive summary report dispatched via Resend to all configured recipients.');
      setTimeout(() => setSummaryMessage(null), 4000);
    } catch (err) {
      alert(`Failed to send summary email: ${(err as Error).message}`);
    } finally {
      setSendingSummary(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Unified Command Center Header & Tab Navigation */}
      <DealHeader deal={deal} notifSettings={notifSettings} activeTab="milestones" />

      {dealError && (
        <div className="banner-error">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{dealError}</span>
        </div>
      )}

      {summaryMessage && (
        <div className="banner-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
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

      {/* Automated Email Alerts Dispatch Bar */}
      <div className="rounded-lg border border-border bg-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
            <Mail className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-primary-text tracking-tight">
                Automated Deadline Alerts (Resend Engine)
              </h3>
              <Badge variant={notifSettings?.enabled ? 'success' : 'neutral'} className="text-[10px]">
                {notifSettings?.enabled ? 'Armed' : 'Standby'}
              </Badge>
            </div>
            <p className="text-[11px] text-secondary-text mt-0.5">
              {notifSettings?.enabled && (notifSettings.recipients?.length ?? 0) > 0
                ? `${notifSettings.recipients.length} configured recipient(s) &bull; Alerts dispatch at T-3, T-1, and 9:00 AM day-of milestone.`
                : 'Alerts require at least one recipient email to trigger automated notifications.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSendSummary}
            disabled={sendingSummary}
            className="h-7.5 px-2.5 text-xs gap-1.5"
          >
            {sendingSummary ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            ) : (
              <Send className="h-3.5 w-3.5 text-secondary-text" />
            )}
            <span>Send Summary Now</span>
          </Button>

          <Button
            asChild
            variant="secondary"
            size="sm"
            className="h-7.5 px-2.5 text-xs gap-1"
          >
            <Link to={`/deals/${dealId}/notifications`}>
              <SlidersHorizontal className="h-3.5 w-3.5 text-secondary-text" />
              <span>Configure Alerts</span>
              <ChevronRight className="h-3 w-3 text-secondary-text" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Deadline Timeline */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-bold text-primary-text tracking-tight uppercase tracking-wider">
                Contingency Milestone Schedule
              </h2>
            </div>
            <p className="text-xs text-secondary-text mt-0.5">
              Deterministic deadlines calculated from contract mutual acceptance date and jurisdiction rules.
            </p>
          </div>
        </div>

        {loading && (
          <div className="rounded-lg border border-border bg-surface flex items-center justify-center gap-2 py-14 text-xs text-secondary-text shadow-2xs">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Computing contract timeline milestones...</span>
          </div>
        )}

        {error && (
          <div className="banner-error">
            <AlertTriangle className="h-4 w-4 shrink-0" />
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline transition-colors"
        >
          <History className="h-3.5 w-3.5" />
          <span>View complete tamper-evident audit history</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
