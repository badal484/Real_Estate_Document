import { useState } from 'react';
import type { Deadline, DayType } from '@/types';
import { IconX, IconCheckCircle, IconCalendar, IconClock, IconExclamationTriangle } from './icons';
import { deadlinesApi } from '@/services/api';

interface Props {
  isOpen: boolean;
  deadline: Deadline | null;
  dealId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditDeadlineModal({ isOpen, deadline, dealId, onClose, onSuccess }: Props) {
  if (!isOpen || !deadline) return null;

  const [date, setDate] = useState(
    (deadline.confirmedDate || deadline.computedDate).split('T')[0] || ''
  );
  const [dayType, setDayType] = useState<DayType>(deadline.dayType || 'calendar');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!deadline) return;
    try {
      await deadlinesApi.confirm(dealId, deadline.id, {
        confirmedDate: new Date(date).toISOString(),
        confirmedBy: 'Agent Reviewer',
        activate: true,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-3xl border border-[#E4E4E7] bg-white p-7 shadow-2xl space-y-6 text-[#09090B]">
        <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
              <IconCalendar className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-[#09090B]">Edit &amp; Confirm Deadline</h3>
              <p className="text-xs text-[#71717A]">{deadline.label}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[#71717A] hover:bg-zinc-100 hover:text-[#09090B] transition-colors"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
            <IconExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#09090B] block mb-1.5">Confirmed Target Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-full bg-[#F4F4F5] border border-[#E4E4E7] px-4 py-2.5 text-xs font-mono text-[#09090B] focus:bg-white focus:border-[#09090B] focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#09090B] block mb-1.5">Day Type Calculation</label>
            <div className="inline-flex w-full p-1 bg-[#F4F4F5] rounded-full border border-[#E4E4E7]">
              <button
                type="button"
                onClick={() => setDayType('calendar')}
                className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  dayType === 'calendar'
                    ? 'bg-white text-[#09090B] shadow-clean-xs'
                    : 'text-[#71717A] hover:text-[#09090B]'
                }`}
              >
                Calendar Days
              </button>
              <button
                type="button"
                onClick={() => setDayType('business')}
                className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  dayType === 'business'
                    ? 'bg-white text-[#09090B] shadow-clean-xs'
                    : 'text-[#71717A] hover:text-[#09090B]'
                }`}
              >
                Business Days
              </button>
            </div>
          </div>

          {deadline.clause?.rawText && (
            <div className="rounded-2xl border border-[#E4E4E7] bg-[#F9FAFB] p-4 text-xs text-[#71717A]">
              <span className="font-bold text-[#09090B] block mb-1">Contract Raw Text Quote:</span>
              <p className="italic leading-relaxed text-[#71717A]">&ldquo;{deadline.clause.rawText}&rdquo;</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-[#E4E4E7] bg-white hover:bg-zinc-100 text-[#09090B] font-semibold py-2.5 text-xs transition-colors shadow-clean-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-full bg-[#09090B] hover:bg-black text-white font-semibold py-2.5 text-xs transition-colors shadow-clean-xs disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Confirm & Activate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
