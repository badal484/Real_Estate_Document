import type { Deadline } from '@/types';
import { DeadlineCard } from './DeadlineCard';
import { FileText } from 'lucide-react';

interface Props {
  deadlines: Deadline[];
  onConfirm?: (deadline: Deadline) => void;
}

export function Timeline({ deadlines, onConfirm }: Props) {
  if (deadlines.length === 0) {
    return (
      <div className="empty-state">
        <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-md bg-secondary text-secondary-text mb-2.5">
          <FileText className="h-5 w-5" />
        </div>
        <h4 className="text-xs font-semibold text-primary-text">No Milestones Extracted Yet</h4>
        <p className="mt-1 text-[11px] text-secondary-text max-w-sm mx-auto">
          Upload a signed purchase agreement to automatically compute binding contingency milestones.
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
    <ol className="relative ml-3 border-l border-border space-y-4">
      {sorted.map((dl) => (
        <li key={dl.id} className="ml-5 relative">
          <span className="absolute -left-[25px] top-4.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
          <DeadlineCard deadline={dl} onConfirm={onConfirm} />
        </li>
      ))}
    </ol>
  );
}
