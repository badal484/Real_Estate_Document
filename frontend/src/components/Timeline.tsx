import type { Deadline } from '@/types';
import { DeadlineCard } from './DeadlineCard';

interface Props {
  deadlines: Deadline[];
  onConfirm?: (deadline: Deadline) => void;
}

export function Timeline({ deadlines, onConfirm }: Props) {
  if (deadlines.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
        <p className="text-gray-400 text-sm">No deadlines yet — upload a purchase agreement to get started.</p>
      </div>
    );
  }

  const sorted = [...deadlines].sort(
    (a, b) =>
      new Date(a.confirmedDate ?? a.computedDate).getTime() -
      new Date(b.confirmedDate ?? b.computedDate).getTime(),
  );

  return (
    <ol className="relative border-l-2 border-gray-200 ml-4">
      {sorted.map((dl) => (
        <li key={dl.id} className="mb-6 ml-6">
          {/* Timeline dot */}
          <span className="absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 ring-4 ring-white" />
          <DeadlineCard deadline={dl} onConfirm={onConfirm} />
        </li>
      ))}
    </ol>
  );
}
