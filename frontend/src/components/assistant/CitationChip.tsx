import type { Citation } from '@/types';
import { FileText, CheckCircle2, ArrowRight } from 'lucide-react';
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
      className={`group text-left p-2.5 rounded-lg border transition-all text-xs w-full block cursor-pointer ${
        isActive
          ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900 shadow-xs'
          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50 shadow-2xs'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-semibold text-slate-900 min-w-0">
          <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded bg-slate-900 text-white font-mono text-[10px] font-bold">
            {citation.id}
          </span>
          <span className="truncate text-slate-800 text-xs font-semibold">
            {isDoc
              ? citation.documentName || 'Contract Document'
              : isDeadline
              ? citation.deadlineLabel || 'Contingency Deadline'
              : 'Deal Record'}
          </span>
        </div>

        {citation.pageNumber && (
          <Badge variant="neutral" className="font-mono text-[10px] px-1.5 py-0">
            Page {citation.pageNumber}
          </Badge>
        )}
      </div>

      {/* Section Header */}
      {citation.section && (
        <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-slate-700">
          <span>&sect;</span>
          <span className="truncate">{citation.section}</span>
        </div>
      )}

      {/* Quoted Text Callout */}
      {citation.quote && (
        <div className="mt-1.5 border-l-2 border-slate-400 bg-slate-50 p-2 rounded-r text-[11px] font-mono text-slate-700 italic line-clamp-3 leading-relaxed border border-l-slate-400 border-slate-200/60">
          &ldquo;{citation.quote}&rdquo;
        </div>
      )}

      {/* Bottom Status & Action */}
      <div className="mt-2 flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          {citation.isConfirmed && (
            <Badge variant="success" className="text-[10px] px-1 py-0">
              <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
              Verified Quote
            </Badge>
          )}
          {citation.isOcr && (
            <Badge variant="warning" className="text-[10px] px-1 py-0">
              OCR
            </Badge>
          )}
        </div>

        <span className="text-slate-900 font-semibold group-hover:text-slate-700 flex items-center gap-1 text-[11px]">
          <span>Jump to Page</span>
          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </button>
  );
}
