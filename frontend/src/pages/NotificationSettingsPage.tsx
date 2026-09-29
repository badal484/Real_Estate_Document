import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { dealsApi, notificationsApi } from '@/services/api';
import { useNotifications } from '@/hooks/useNotifications';
import { AlertPreferences } from '@/components/email/AlertPreferences';
import { EmailLogTable } from '@/components/email/EmailLogTable';
import { InboundEmailInfo } from '@/components/email/InboundEmailInfo';
import { SendTestEmailButton } from '@/components/email/SendTestEmailButton';
import { EmailPreviewModal } from '@/components/email/EmailPreviewModal';
import {
  IconChevronRight,
  IconExclamationTriangle,
  IconCheckCircle,
  IconSpinner,
  IconEye,
  IconEnvelope,
  IconPaperAirplane,
} from '@/components/icons';
import type { Deal } from '@/types';

export function NotificationSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const dealId = id!;

  const [deal, setDeal] = useState<Deal | null>(null);
  const [dealError, setDealError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sendingSummary, setSendingSummary] = useState(false);
  const [summaryStatus, setSummaryStatus] = useState<string | null>(null);

  const {
    settings,
    logs,
    inboundInfo,
    loading,
    saving,
    error,
    successMessage,
    updateSettings,
    refreshLogs,
  } = useNotifications(dealId);

  useEffect(() => {
    dealsApi
      .get(dealId)
      .then(setDeal)
      .catch((err: Error) => setDealError(err.message));
  }, [dealId]);

  const handleSendSummary = async () => {
    if (!settings?.recipients || settings.recipients.length === 0) {
      alert('Please add at least one alert recipient in settings before sending the summary.');
      return;
    }
    setSendingSummary(true);
    setSummaryStatus(null);
    try {
      await notificationsApi.sendSummaryEmail(dealId, settings.recipients);
      setSummaryStatus('Deal summary email dispatched to all recipients.');
      refreshLogs();
      setTimeout(() => setSummaryStatus(null), 4000);
    } catch (err) {
      alert(`Failed to send summary: ${(err as Error).message}`);
    } finally {
      setSendingSummary(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/deals" className="hover:text-brand-700">Deals</Link>
        <IconChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <Link to={`/deals/${dealId}`} className="hover:text-brand-700">
          {deal?.propertyAddress ?? 'Deal'}
        </Link>
        <IconChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <span className="font-medium text-slate-900">Email &amp; Alerts</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Email Alerts &amp; Inbound Intake
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Configure automated deadline reminders, preview email templates, and view delivery history.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="btn-secondary flex items-center gap-1.5 text-xs"
          >
            <IconEye className="h-3.5 w-3.5 text-slate-500" />
            <span>Preview Templates</span>
          </button>

          <button
            type="button"
            onClick={handleSendSummary}
            disabled={sendingSummary}
            className="btn-secondary flex items-center gap-1.5 text-xs"
          >
            {sendingSummary ? (
              <IconSpinner className="h-3.5 w-3.5 animate-spin text-brand-600" />
            ) : (
              <IconEnvelope className="h-3.5 w-3.5 text-slate-500" />
            )}
            <span>Send Summary Now</span>
          </button>

          <SendTestEmailButton
            dealId={dealId}
            defaultRecipient={settings?.recipients[0] ?? ''}
            onSent={refreshLogs}
          />
        </div>
      </div>

      {dealError && (
        <div className="banner-error">
          <IconExclamationTriangle className="h-4 w-4 shrink-0" />
          <span>{dealError}</span>
        </div>
      )}

      {error && (
        <div className="banner-error">
          <IconExclamationTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-4 text-sm font-medium text-emerald-800 border border-emerald-200">
          <IconCheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {summaryStatus && (
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-4 text-sm font-medium text-blue-800 border border-blue-200">
          <IconCheckCircle className="h-5 w-5 text-blue-600 shrink-0" />
          <span>{summaryStatus}</span>
        </div>
      )}

      {/* Inbound Email Forwarding Card */}
      <InboundEmailInfo dealId={dealId} inboundInfo={inboundInfo} />

      {/* Preferences Form */}
      {loading ? (
        <div className="card p-12 flex items-center justify-center gap-2 text-sm text-slate-400">
          <IconSpinner className="h-5 w-5 animate-spin text-brand-600" />
          <span>Loading alert preferences...</span>
        </div>
      ) : (
        <AlertPreferences
          settings={settings}
          saving={saving}
          onSave={updateSettings}
        />
      )}

      {/* Delivery Log Table */}
      <EmailLogTable logs={logs} loading={loading} onRefresh={refreshLogs} />

      {/* Preview Modal */}
      <EmailPreviewModal
        dealId={dealId}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
}
