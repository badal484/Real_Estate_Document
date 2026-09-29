import type { Deadline } from '@/types';
import { DeadlineCard } from './DeadlineCard';
import { IconDocumentText } from './icons';

interface Props {
  deadlines: Deadline[];
  onConfirm?: (deadline: Deadline) => void;
  onEdit?: (deadline: Deadline) => void;
}

export function Timeline({ deadlines, onConfirm, onEdit }: Props) {
  if (deadlines.length === 0) {
    return (
      <div className="empty-state">
        <IconDocumentText className="mx-auto h-8 w-8 text-slate-500" />
        <p className="mt-3 text-sm text-slate-400">
          No deadlines extracted yet — upload a purchase agreement PDF to analyze contingency clauses.
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
    <ol className="relative ml-4 space-y-6 border-l-2 border-brand-500/30">
      {sorted.map((dl) => (
        <li key={dl.id} className="relative ml-6 group">
          <span className="absolute -left-[31px] top-4 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 ring-4 ring-slate-950 shadow-lg shadow-brand-500/50" />
          <DeadlineCard deadline={dl} onConfirm={onConfirm} onEdit={onEdit} />
        </li>
      ))}
    </ol>
  );
}

