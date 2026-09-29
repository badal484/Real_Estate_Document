import { useState, useEffect } from 'react';
import type { NotificationSetting, UpdateNotificationSettingsInput } from '@/types';
import { IconPlus, IconSpinner, IconCheckCircle } from '../icons';

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
    await onSave({
      enabled,
      timezone,
      recipients,
      windows,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card divide-y divide-slate-100 p-6 space-y-6">
      {/* Header Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Automated Email Alerts</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Deliver deadline reminders to agents, transaction coordinators, and clients.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
        </label>
      </div>

      {/* Recipient Management */}
      <div className="pt-6 space-y-4">
        <label className="block text-sm font-medium text-slate-900">
          Alert Recipients
        </label>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="agent@brokerage.com"
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
            className="input-base flex-1"
          />
          <button
            type="button"
            onClick={() => handleAddRecipient()}
            className="btn-secondary flex items-center gap-1.5 shrink-0"
          >
            <IconPlus className="h-4 w-4" />
            <span>Add</span>
          </button>
        </div>
        {emailError && <p className="text-xs text-rose-600">{emailError}</p>}

        {recipients.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {recipients.map((email) => (
              <span
                key={email}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-brand-200"
              >
                <span>{email}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRecipient(email)}
                  className="text-brand-400 hover:text-brand-900 ml-1 font-bold text-sm"
                  aria-label={`Remove ${email}`}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No recipients configured yet. Add at least one email.</p>
        )}
      </div>

      {/* Notification Windows */}
      <div className="pt-6 space-y-3">
        <label className="block text-sm font-medium text-slate-900">
          Dispatch Windows (Confirmed Deadlines Only)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={windows.d3}
              onChange={(e) => setWindows({ ...windows, d3: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <div>
              <span className="text-sm font-medium text-slate-800">3 Days Before</span>
              <p className="text-xs text-slate-400">Early warning window</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={windows.d1}
              onChange={(e) => setWindows({ ...windows, d1: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <div>
              <span className="text-sm font-medium text-slate-800">1 Day Before</span>
              <p className="text-xs text-slate-400">Action critical notice</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={windows.dayOf}
              onChange={(e) => setWindows({ ...windows, dayOf: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <div>
              <span className="text-sm font-medium text-slate-800">Day-Of Deadline</span>
              <p className="text-xs text-slate-400">Final expiration reminder</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={windows.missed}
              onChange={(e) => setWindows({ ...windows, missed: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <div>
              <span className="text-sm font-medium text-slate-800">Past Due / Missed</span>
              <p className="text-xs text-slate-400">Escalation notice if uncompleted</p>
            </div>
          </label>
        </div>
      </div>

      {/* Timezone Selection */}
      <div className="pt-6 space-y-2">
        <label className="block text-sm font-medium text-slate-900">
          Deal Timezone
        </label>
        <p className="text-xs text-slate-400">
          Alert windows are computed relative to 9:00 AM local time on the target date.
        </p>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="input-base max-w-md"
        >
          {COMMON_TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label} ({tz.value})
            </option>
          ))}
        </select>
      </div>

      {/* Submit Button */}
      <div className="pt-6 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          {saving ? (
            <>
              <IconSpinner className="h-4 w-4 animate-spin text-white" />
              <span>Saving Preferences...</span>
            </>
          ) : (
            <>
              <IconCheckCircle className="h-4 w-4" />
              <span>Save Alert Preferences</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
