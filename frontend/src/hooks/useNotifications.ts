import { useState, useEffect, useCallback } from 'react';
import { notificationsApi } from '@/services/api';
import type {
  NotificationSetting,
  UpdateNotificationSettingsInput,
  EmailLog,
  InboundAddressResponse,
} from '@/types';

export function useNotifications(dealId: string) {
  const [settings, setSettings] = useState<NotificationSetting | null>(null);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [inboundInfo, setInboundInfo] = useState<InboundAddressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [settingsRes, logsRes, inboundRes] = await Promise.allSettled([
        notificationsApi.getSettings(dealId),
        notificationsApi.getLogs(dealId),
        notificationsApi.getInboundAddress(dealId),
      ]);

      if (settingsRes.status === 'fulfilled') {
        setSettings(settingsRes.value);
      } else {
        // Default settings fallback
        setSettings({
          id: 'default',
          dealId,
          recipients: [],
          window3d: true,
          window1d: true,
          windowDayOf: true,
          windowMissed: true,
          enabled: true,
          timezone: 'America/New_York',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      if (logsRes.status === 'fulfilled') {
        setLogs(logsRes.value);
      }

      if (inboundRes.status === 'fulfilled') {
        setInboundInfo(inboundRes.value);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  useEffect(() => {
    if (dealId) {
      fetchAll();
    }
  }, [dealId, fetchAll]);

  const updateSettings = async (input: UpdateNotificationSettingsInput) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const updated = await notificationsApi.updateSettings(dealId, input);
      setSettings(updated);
      setSuccessMessage('Alert preferences saved successfully.');
      setTimeout(() => setSuccessMessage(null), 4000);
      return updated;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const refreshLogs = async () => {
    try {
      const updatedLogs = await notificationsApi.getLogs(dealId);
      setLogs(updatedLogs);
    } catch (err) {
      console.warn('Failed to refresh email logs:', err);
    }
  };

  return {
    settings,
    logs,
    inboundInfo,
    loading,
    saving,
    error,
    successMessage,
    updateSettings,
    refreshLogs,
    refetch: fetchAll,
  };
}
