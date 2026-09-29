import type { DeadlineStatus } from '@/types';

const CONFIG: Record<DeadlineStatus, { label: string; textClass: string; dotClass: string }> = {
  PENDING: {
    label: 'Pending Confirmation',
    textClass: 'text-amber-300 bg-amber-500/10 border-amber-500/30 ring-amber-500/20',
    dotClass: 'bg-amber-400 animate-pulse',
  },
  CONFIRMED: {
    label: 'Confirmed',
    textClass: 'text-brand-300 bg-brand-500/10 border-brand-500/30 ring-brand-500/20',
    dotClass: 'bg-brand-400',
  },
  ACTIVE: {
    label: 'Alerts Active',
    textClass: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30 ring-emerald-500/20',
    dotClass: 'bg-emerald-400 animate-pulse',
  },
  MISSED: {
    label: 'Deadline Overdue',
    textClass: 'text-rose-300 bg-rose-500/10 border-rose-500/30 ring-rose-500/20',
    dotClass: 'bg-rose-400 animate-ping',
  },
  COMPLETED: {
    label: 'Contingency Met',
    textClass: 'text-slate-400 bg-slate-800/60 border-slate-700/60 ring-slate-600/20',
    dotClass: 'bg-slate-500',
  },
};

interface Props {
  status: DeadlineStatus;
}

export function StatusBadge({ status }: Props) {
  const { label, textClass, dotClass } = CONFIG[status] || CONFIG['PENDING'];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm ${textClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      {label}
    </span>
  );
}

