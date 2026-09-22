import type { DeadlineStatus } from '@/types';

const CONFIG: Record<DeadlineStatus, { label: string; textClass: string; dotClass: string }> = {
  PENDING: { label: 'Pending', textClass: 'text-amber-800 bg-amber-50 ring-amber-600/20', dotClass: 'bg-amber-500' },
  CONFIRMED: { label: 'Confirmed', textClass: 'text-blue-800 bg-blue-50 ring-blue-600/20', dotClass: 'bg-blue-500' },
  ACTIVE: { label: 'Active', textClass: 'text-emerald-800 bg-emerald-50 ring-emerald-600/20', dotClass: 'bg-emerald-500' },
  MISSED: { label: 'Missed', textClass: 'text-red-800 bg-red-50 ring-red-600/20', dotClass: 'bg-red-500' },
  COMPLETED: { label: 'Completed', textClass: 'text-slate-600 bg-slate-100 ring-slate-500/20', dotClass: 'bg-slate-400' },
};

interface Props {
  status: DeadlineStatus;
}

export function StatusBadge({ status }: Props) {
  const { label, textClass, dotClass } = CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${textClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      {label}
    </span>
  );
}
