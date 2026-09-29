import type { Citation } from '@/types';
import { IconDocumentText, IconCheckCircle, IconSparkles } from '../icons';

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
      className={`group text-left p-2.5 rounded-xl border transition-all text-xs w-full ${
        isActive
          ? 'border-brand-500 bg-brand-50/80 ring-2 ring-brand-400/30'
          : 'border-slate-200 hover:border-brand-300 bg-white hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-semibold text-slate-900">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-mono text-[11px]">
            {citation.id}
          </span>
          {isDoc ? (
            <span className="truncate max-w-[200px] text-slate-800">
              {citation.documentName || 'Contract Document'}
            </span>
          ) : isDeadline ? (
            <span className="text-slate-800">{citation.deadlineLabel || 'Contingency Deadline'}</span>
          ) : (
            <span className="text-slate-800">Deal Record</span>
          )}
        </div>

        {citation.pageNumber && (
          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-600">
            Page {citation.pageNumber}
          </span>
        )}
      </div>

      {citation.section && (
        <p className="mt-1 text-[11px] font-medium text-slate-600 truncate">
          &sect; {citation.section}
        </p>
      )}

      {citation.quote && (
        <p className="mt-1 font-mono text-[11px] text-slate-600 italic line-clamp-2 bg-slate-50/80 p-1.5 rounded border border-slate-100 group-hover:border-slate-200">
          &ldquo;{citation.quote}&rdquo;
        </p>
      )}

      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          {citation.isConfirmed && (
            <span className="inline-flex items-center gap-0.5 text-emerald-600 font-medium">
              <IconCheckCircle className="h-3 w-3" />
              Confirmed
            </span>
          )}
          {citation.isOcr && (
            <span className="rounded bg-amber-100 px-1 text-amber-800">OCR Scanned</span>
          )}
        </span>
        <span className="text-brand-600 font-medium group-hover:underline flex items-center gap-0.5">
          <span>Jump to Page</span> &rarr;
        </span>
      </div>
    </button>
  );
}
