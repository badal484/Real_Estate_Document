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
      <div className="rounded-3xl border border-dashed border-[#E4E4E7] bg-white p-12 text-center shadow-clean-sm">
        <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-[#F4F4F5] text-[#71717A] mb-3 border border-[#E4E4E7]">
          <FileText className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-semibold text-[#09090B]">No Milestones Extracted Yet</h4>
        <p className="mt-1 text-xs text-[#71717A]">
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
    <ol className="relative ml-4 border-l border-[#E4E4E7] space-y-4">
      {sorted.map((dl) => (
        <li key={dl.id} className="ml-6 relative">
          <span className="absolute -left-[31px] top-5 h-3 w-3 rounded-full bg-[#09090B] ring-4 ring-white border border-[#E4E4E7]" />
          <DeadlineCard deadline={dl} onConfirm={onConfirm} />
        </li>
      ))}
    </ol>
  );
}
