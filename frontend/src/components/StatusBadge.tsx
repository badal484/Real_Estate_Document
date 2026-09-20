import type { DeadlineStatus } from '@/types';

const CONFIG: Record<DeadlineStatus, { label: string; className: string }> = {
  PENDING:   { label: 'Pending',   className: 'bg-amber-100 text-amber-800 ring-amber-400/30' },
  CONFIRMED: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800 ring-blue-400/30' },
  ACTIVE:    { label: 'Active',    className: 'bg-emerald-100 text-emerald-800 ring-emerald-400/30' },
  MISSED:    { label: 'Missed',    className: 'bg-red-100 text-red-800 ring-red-400/30' },
  COMPLETED: { label: 'Completed', className: 'bg-gray-100 text-gray-600 ring-gray-400/30' },
};

interface Props {
  status: DeadlineStatus;
}

export function StatusBadge({ status }: Props) {
  const { label, className } = CONFIG[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${className}`}
    >
      {label}
    </span>
  );
}
