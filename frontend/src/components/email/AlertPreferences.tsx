import { useState, useEffect } from 'react';
import type { NotificationSetting, UpdateNotificationSettingsInput } from '@/types';
import { Plus, Check, Clock, Bell, Globe, Mail, X, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Props {
  settings: NotificationSetting | null;
  saving: boolean;
  onSave: (data: UpdateNotificationSettingsInput) => Promise<unknown>;
}

const COMMON_TIMEZONES = [
  { label: 'Eastern Time (US & Canada)', value: 'America/New_York' },
  { label: 'Central Time (US & Canada)', value: 'America/Chicago' },
  { label: 'Mountain Time (US & Canada)', value: 'America/Denver' },
  { label: 'Pacific Time (US & Canada)', value: 'America/Los_Angeles' },
  { label: 'Alaska Time', value: 'America/Anchorage' },
  { label: 'Hawaii-Aleutian Time', value: 'Pacific/Honolulu' },
  { label: 'UTC', value: 'UTC' },
];

export function AlertPreferences({ settings, saving, onSave }: Props) {
  const [enabled, setEnabled] = useState(settings?.enabled ?? true);
  const [timezone, setTimezone] = useState(settings?.timezone ?? 'America/New_York');
  const [recipients, setRecipients] = useState<string[]>(settings?.recipients ?? []);
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [windows, setWindows] = useState({
    d3: settings?.window3d ?? true,
    d1: settings?.window1d ?? true,
    dayOf: settings?.windowDayOf ?? true,
    missed: settings?.windowMissed ?? true,
  });

  useEffect(() => {
    if (settings) {
      setEnabled(settings.enabled);
      setTimezone(settings.timezone || 'America/New_York');
      setRecipients(settings.recipients || []);
      setWindows({
        d3: settings.window3d,
        d1: settings.window1d,
        dayOf: settings.windowDayOf,
        missed: settings.windowMissed,
      });
    }
  }, [settings]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const handleAddRecipient = (e?: React.FormEvent) => {
    e?.preventDefault();
    const clean = newEmail.trim().toLowerCase();
    if (!clean) return;
    if (!validateEmail(clean)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    if (recipients.includes(clean)) {
      setEmailError('Email is already in the recipient list.');
      return;
    }
    setRecipients([...recipients, clean]);
    setNewEmail('');
    setEmailError(null);
  };

  const handleRemoveRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(false);
    try {
      await onSave({
        enabled,
        timezone,
        recipients,
        windows,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch {
      // Handled by parent
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-md border border-border bg-surface p-6 shadow-2xs space-y-6">
      {/* Header Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-7.5 w-7.5 items-center justify-center rounded-md bg-secondary text-primary">
              <Bell className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-primary-text tracking-tight">Automated Milestone Reminders</h3>
            <Badge variant={enabled ? 'success' : 'neutral'} className="text-[10px]">
              {enabled ? 'Active Engine' : 'Paused'}
            </Badge>
          </div>
          <p className="text-xs text-secondary-text pl-9.5">
            Precision contingency notifications dispatched via Resend to agents, clients, and transaction coordinators.
          </p>
        </div>
        
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-xs"></div>
        </label>
      </div>

      {/* Recipient Management */}
      <div className="space-y-3 pb-6 border-b border-border">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-primary-text uppercase tracking-wider flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-secondary-text" />
            Alert Distribution List
          </label>
          <span className="text-[11px] text-secondary-text">
            {recipients.length} {recipients.length === 1 ? 'recipient' : 'recipients'} configured
          </span>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="email"
              placeholder="e.g. escrow@titlecompany.com, agent@brokerage.com"
              value={newEmail}
              onChange={(e) => {
                setNewEmail(e.target.value);
                setEmailError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddRecipient();
                }
              }}
              className="h-8.5 text-xs pl-3"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => handleAddRecipient()}
            className="h-8.5 px-3 text-xs gap-1.5 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Recipient</span>
          </Button>
        </div>
        {emailError && (
          <div className="flex items-center gap-1.5 text-xs text-danger">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{emailError}</span>
          </div>
        )}

        {recipients.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-2">
            {recipients.map((email) => (
              <span
                key={email}
                className="inline-flex items-center gap-1.5 rounded bg-secondary border border-border px-2.5 py-1 text-xs font-mono text-primary-text"
              >
                <Mail className="h-3 w-3 text-secondary-text" />
                <span>{email}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRecipient(email)}
                  className="text-secondary-text hover:text-danger transition-colors ml-1 cursor-pointer"
                  aria-label={`Remove ${email}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-secondary-text italic py-1">
            No recipients configured yet. Add at least one email address to receive automated notifications.
          </p>
        )}
      </div>

      {/* Notification Windows */}
      <div className="space-y-3 pb-6 border-b border-border">
        <label className="text-xs font-semibold text-primary-text uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-secondary-text" />
          Trigger Windows (Confirmed Milestones Only)
        </label>
        <p className="text-xs text-secondary-text">
          Alerts are automatically timed to give all parties sufficient runway before earnest money deposits or contingencies lapse.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <label className={`flex items-start gap-3 p-3 rounded border transition-all cursor-pointer ${windows.d3 ? 'border-primary/40 bg-accent-light/30' : 'border-border bg-secondary/30 opacity-70'}`}>
            <input
              type="checkbox"
              checked={windows.d3}
              onChange={(e) => setWindows({ ...windows, d3: e.target.checked })}
              className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-primary-text">3 Days Prior (T-3)</span>
              <p className="text-[11px] text-secondary-text">Early warning notice for document collection and scheduling.</p>
            </div>
          </label>

          <label className={`flex items-start gap-3 p-3 rounded border transition-all cursor-pointer ${windows.d1 ? 'border-primary/40 bg-accent-light/30' : 'border-border bg-secondary/30 opacity-70'}`}>
            <input
              type="checkbox"
              checked={windows.d1}
              onChange={(e) => setWindows({ ...windows, d1: e.target.checked })}
              className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-primary-text">1 Day Prior (T-1)</span>
              <p className="text-[11px] text-secondary-text">Critical high-priority reminder before midnight deadline cutoff.</p>
            </div>
          </label>

          <label className={`flex items-start gap-3 p-3 rounded border transition-all cursor-pointer ${windows.dayOf ? 'border-primary/40 bg-accent-light/30' : 'border-border bg-secondary/30 opacity-70'}`}>
            <input
              type="checkbox"
              checked={windows.dayOf}
              onChange={(e) => setWindows({ ...windows, dayOf: e.target.checked })}
              className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-primary-text">Day-of Expiration (T-0)</span>
              <p className="text-[11px] text-secondary-text">Morning execution notice sent at 9:00 AM local property time.</p>
            </div>
          </label>

          <label className={`flex items-start gap-3 p-3 rounded border transition-all cursor-pointer ${windows.missed ? 'border-danger-border bg-danger-light/50' : 'border-border bg-secondary/30 opacity-70'}`}>
            <input
              type="checkbox"
              checked={windows.missed}
              onChange={(e) => setWindows({ ...windows, missed: e.target.checked })}
              className="mt-0.5 h-4 w-4 rounded border-border text-danger focus:ring-danger/30"
            />
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-danger">Past Due / Lapse Escalation</span>
              <p className="text-[11px] text-secondary-text">Urgent breach notice if contingency remains unconfirmed after deadline.</p>
            </div>
          </label>
        </div>
      </div>

      {/* Timezone Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-primary-text uppercase tracking-wider flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 text-secondary-text" />
          Jurisdiction &amp; Deal Timezone
        </label>
        <p className="text-xs text-secondary-text">
          All deadline calculations and automated email dispatches are synced to this local timezone.
        </p>
        <div className="max-w-md">
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="flex h-8.5 w-full rounded-md border border-border bg-surface px-3 py-1 text-xs text-primary-text focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary shadow-2xs"
          >
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label} ({tz.value})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submit Button & Confirmation */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-secondary-text">
          <ShieldCheck className="h-4 w-4 text-success" />
          <span>Encrypted webhook delivery via Resend Enterprise</span>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-xs font-medium text-success flex items-center gap-1">
              <Check className="h-3.5 w-3.5" />
              Settings saved
            </span>
          )}
          <Button
            type="submit"
            disabled={saving}
            className="gap-2 h-8.5 px-4 text-xs font-semibold"
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Saving Preferences...</span>
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Save Alert Preferences</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
