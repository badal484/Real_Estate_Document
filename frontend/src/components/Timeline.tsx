import type { Deadline } from '@/types';
import { DeadlineCard } from './DeadlineCard';
import { IconDocumentText } from './icons';

interface Props {
  deadlines: Deadline[];
  onConfirm?: (deadline: Deadline) => void;
}

export function Timeline({ deadlines, onConfirm }: Props) {
  if (deadlines.length === 0) {
    return (
      <div className="empty-state">
        <IconDocumentText className="mx-auto h-8 w-8 text-slate-300" />
        <p className="mt-3 text-sm text-slate-500">
          No deadlines yet — upload a purchase agreement to get started.
        </p>
      </div>
    );
  }

  const sorted = [...deadlines].sort(
    (a, b) =>
      new Date(a.confirmedDate ?? a.computedDate).getTime() -
      new Date(b.confirmedDate ?? b.computedDate).getTime(),
  );

  return (
    <ol className="relative ml-4 border-l-2 border-slate-200">
      {sorted.map((dl) => (
        <li key={dl.id} className="mb-6 ml-6">
          <span className="absolute -left-[7px] mt-4 h-3 w-3 rounded-full bg-brand-600 ring-4 ring-white" />
          <DeadlineCard deadline={dl} onConfirm={onConfirm} />
        </li>
      ))}
    </ol>
  );
}
