import { useState } from 'react';
import { notificationsApi } from '@/services/api';
import { IconPaperAirplane, IconSpinner, IconCheckCircle, IconExclamationTriangle } from '../icons';

interface Props {
  dealId: string;
  defaultRecipient?: string;
  onSent?: () => void;
}

export function SendTestEmailButton({ dealId, defaultRecipient = '', onSent }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState(defaultRecipient);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus({ type: 'error', message: 'Please enter a valid recipient email.' });
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const res = await notificationsApi.sendTestEmail(dealId, email.trim());
      setStatus({ type: 'success', message: res.message || 'Test email dispatched successfully.' });
      onSent?.();
      setTimeout(() => {
        setIsOpen(false);
        setStatus(null);
      }, 3000);
    } catch (err) {
      setStatus({ type: 'error', message: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => {
            setEmail(defaultRecipient);
            setIsOpen(true);
          }}
          className="btn-secondary flex items-center gap-1.5 text-xs"
        >
          <IconPaperAirplane className="h-3.5 w-3.5 text-slate-500" />
          <span>Send Test Alert</span>
        </button>
      ) : (
        <div className="absolute right-0 top-0 z-20 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-xl ring-1 ring-black/5">
          <div className="flex items-center justify-between pb-2">
            <h4 className="text-xs font-semibold text-slate-900">Send Test Alert</h4>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 text-sm font-bold"
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleSend} className="space-y-3">
            <input
              type="email"
              placeholder="your-email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-base text-xs py-1.5"
              autoFocus
            />

            {status && (
              <div
                className={`flex items-center gap-1.5 rounded-md p-2 text-xs ${
                  status.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'bg-rose-50 text-rose-800'
                }`}
              >
                {status.type === 'success' ? (
                  <IconCheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                ) : (
                  <IconExclamationTriangle className="h-3.5 w-3.5 shrink-0 text-rose-600" />
                )}
                <span>{status.message}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn-secondary text-xs py-1 px-2.5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-1 text-xs py-1 px-3"
              >
                {loading ? (
                  <IconSpinner className="h-3 w-3 animate-spin text-white" />
                ) : (
                  <IconPaperAirplane className="h-3 w-3" />
                )}
                <span>Send</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
