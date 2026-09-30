import type { Deadline } from '@/types';
import { DeadlineCard } from './DeadlineCard';
import { FileText, Calendar } from 'lucide-react';

interface Props {
  deadlines: Deadline[];
  onConfirm?: (deadline: Deadline) => void;
}

export function Timeline({ deadlines, onConfirm }: Props) {
  if (deadlines.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
        <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-lg bg-slate-100 text-slate-400 mb-2.5">
          <FileText className="h-5 w-5" />
        </div>
        <h4 className="text-xs font-semibold text-slate-800">No Milestones Extracted Yet</h4>
        <p className="mt-1 text-[11px] text-slate-400">
          Upload a signed purchase agreement to automatically calculate contingency milestones.
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
    <ol className="relative ml-3 border-l border-slate-200 space-y-4">
      {sorted.map((dl) => (
        <li key={dl.id} className="ml-5 relative">
          <span className="absolute -left-[25px] top-4.5 h-2.5 w-2.5 rounded-full bg-slate-900 ring-4 ring-slate-100" />
          <DeadlineCard deadline={dl} onConfirm={onConfirm} />
        </li>
      ))}
    </ol>
  );
}
