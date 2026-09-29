import React from 'react';
import type { Citation } from '@/types';
import { IconDocumentText, IconClock, IconSparkles } from '../icons';

interface CitationChipProps {
  citation: Citation;
  index?: number;
  onClick?: (citation: Citation) => void;
}

export function CitationChip({ citation, index, onClick }: CitationChipProps) {
  const isDoc = citation.sourceType === 'document';

  return (
    <button
      onClick={() => onClick?.(citation)}
      className={`inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
        isDoc
          ? 'bg-brand-500/10 text-brand-300 border-brand-500/30 hover:bg-brand-500/20 hover:border-brand-500/60'
          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/60'
      }`}
      title={citation.relevanceExplanation || citation.quote || 'Click to view citation source'}
    >
      {isDoc ? (
        <IconDocumentText className="h-3 w-3 text-brand-400" />
      ) : (
        <IconClock className="h-3 w-3 text-emerald-400" />
      )}
      <span>[{index ?? 1}]</span>
      {citation.pageNumber && <span className="opacity-75">Pg {citation.pageNumber}</span>}
    </button>
  );
}

export interface CitationListProps {
  citations?: Citation[];
  onSelectCitation?: (citation: Citation) => void;
}

export function CitationList({ citations, onSelectCitation }: CitationListProps) {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3 space-y-2">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
        <IconSparkles className="h-3.5 w-3.5 text-brand-400" />
        <span>Verifiable Contract Citations ({citations.length})</span>
      </div>

      <div className="space-y-2">
        {citations.map((c, idx) => (
          <div
            key={c.id || idx}
            onClick={() => onSelectCitation?.(c)}
            className="group rounded-lg border border-slate-800/80 bg-slate-900/80 p-2.5 hover:border-brand-500/50 transition-colors cursor-pointer text-xs space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-brand-300 flex items-center gap-1.5">
                <CitationChip citation={c} index={idx + 1} />
                <span className="text-slate-200">{c.documentName || c.section || 'Contract Clause'}</span>
              </span>
              {c.pageNumber && (
                <span className="text-[10px] text-slate-500 font-mono">Page {c.pageNumber}</span>
              )}
            </div>

            {c.quote && (
              <p className="text-slate-300 font-serif text-[11px] italic bg-slate-950/50 p-1.5 rounded border border-slate-800/50">
                &ldquo;{c.quote}&rdquo;
              </p>
            )}

            {c.relevanceExplanation && (
              <p className="text-[11px] text-slate-400">{c.relevanceExplanation}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
