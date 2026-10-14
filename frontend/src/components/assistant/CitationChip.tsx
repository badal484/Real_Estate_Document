import type { Citation } from '@/types';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Badge } from '../ui/badge';

interface Props {
  citation: Citation;
  onClick?: (citation: Citation) => void;
  isActive?: boolean;
}

export function CitationChip({ citation, onClick, isActive = false }: Props) {
  const isDoc = citation.sourceType === 'document';
  const isDeadline = citation.sourceType === 'deadline';

  return (
    <button
      type="button"
      onClick={() => onClick?.(citation)}
      className={`group text-left p-3 rounded-2xl border transition-all text-xs w-full block cursor-pointer active:scale-[0.99] ${
        isActive
          ? 'border-[#09090B] bg-[#F4F4F5] ring-2 ring-[#09090B]/10 shadow-clean-sm'
          : 'border-[#E4E4E7] hover:border-[#D4D4D8] bg-[#F9FAFB] hover:bg-white shadow-clean-xs'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium text-[#09090B] min-w-0">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#09090B] text-white font-mono text-[10px] font-semibold">
            {citation.id}
          </span>
          <span className="truncate text-xs font-semibold text-[#09090B]">
            {isDoc
              ? citation.documentName || 'Contract Document'
              : isDeadline
              ? citation.deadlineLabel || 'Contingency Deadline'
              : 'Deal Record'}
          </span>
        </div>

        {citation.pageNumber && (
          <Badge variant="neutral" className="font-mono text-[10px] px-2 py-0.5 rounded-full">
            Page {citation.pageNumber}
          </Badge>
        )}
      </div>

      {/* Section Header */}
      {citation.section && (
        <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-[#71717A]">
          <span>&sect;</span>
          <span className="truncate">{citation.section}</span>
        </div>
      )}

      {/* Quoted Text Callout */}
      {citation.quote && (
        <div className="mt-2 border-l-2 border-[#09090B] bg-white p-2.5 rounded-r-xl text-[11px] font-mono text-[#09090B] italic line-clamp-3 leading-relaxed border border-l-[#09090B] border-[#E4E4E7]">
          &ldquo;{citation.quote}&rdquo;
        </div>
      )}

      {/* Bottom Status & Action */}
      <div className="mt-2.5 flex items-center justify-between text-[11px] pt-2 border-t border-[#E4E4E7]">
        <div className="flex items-center gap-1.5">
          {citation.isConfirmed && (
            <Badge variant="success" className="text-[10px] px-2 py-0.5 rounded-full">
              <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
              Verified Quote
            </Badge>
          )}
          {citation.isOcr && (
            <Badge variant="warning" className="text-[10px] px-2 py-0.5 rounded-full">
              OCR
            </Badge>
          )}
        </div>

        <span className="text-[#09090B] font-medium group-hover:text-black flex items-center gap-1 text-xs">
          <span>Jump to Page</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </button>
  );
}
