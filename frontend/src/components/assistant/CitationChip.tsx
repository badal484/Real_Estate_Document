import type { Citation } from '@/types';
import { IconCheckCircle, IconDocumentText, IconSparkles } from '../icons';

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
      className={`group text-left p-3 rounded-xl border transition-all text-xs w-full block cursor-pointer ${
        isActive
          ? 'border-brand-500 bg-brand-50/70 ring-2 ring-brand-400/30 shadow-xs'
          : 'border-slate-200 hover:border-brand-300 bg-white hover:bg-slate-50/90 shadow-2xs'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-semibold text-slate-900 min-w-0">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white font-mono text-[10px] font-bold shadow-2xs">
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
          <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700 border border-slate-200">
            Page {citation.pageNumber}
          </span>
        )}
      </div>

      {/* Section Header */}
      {citation.section && (
        <div className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-brand-700">
          <span>&sect;</span>
          <span className="truncate">{citation.section}</span>
        </div>
      )}

      {/* Quoted Text Callout */}
      {citation.quote && (
        <div className="mt-2 border-l-2 border-brand-500 bg-slate-50/90 py-1.5 px-2.5 rounded-r text-[11px] font-mono text-slate-700 italic line-clamp-3 leading-relaxed border border-l-brand-500 border-slate-200/60">
          &ldquo;{citation.quote}&rdquo;
        </div>
      )}

      {/* Bottom Status & Action */}
      <div className="mt-2.5 flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          {citation.isConfirmed && (
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              <IconCheckCircle className="h-3 w-3 text-emerald-600" />
              Verified Quote
            </span>
          )}
          {citation.isOcr && (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-800 text-[10px] font-medium border border-amber-200">
              OCR
            </span>
          )}
        </div>

        <span className="text-brand-600 font-semibold group-hover:text-brand-800 flex items-center gap-1 text-[11px]">
          <span>Jump to Page</span>
          <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
        </span>
      </div>
    </button>
  );
}

