import React, { useState, useEffect } from 'react';
import { findQuoteInText } from '@/utils/quoteMatcher';
import {
  IconDocumentText,
  IconEye,
  IconSparkles,
  IconExclamationTriangle,
  IconChevronLeft,
  IconChevronRight,
} from '../icons';

export interface PdfViewerProps {
  fileUrl?: string | null;
  page?: number;
  highlightQuote?: string;
  onHighlightResult?: (found: boolean) => void;
  className?: string;
}

export function PdfViewer({
  fileUrl,
  page = 1,
  highlightQuote,
  onHighlightResult,
  className = '',
}: PdfViewerProps) {
  const [currentPage, setCurrentPage] = useState<number>(page);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [matchFound, setMatchFound] = useState<boolean | null>(null);

  useEffect(() => {
    if (page) setCurrentPage(page);
  }, [page]);

  useEffect(() => {
    if (highlightQuote) {
      // Simulate text layer matching for rendering highlights
      const simulatedPageText = `CALIFORNIA RESIDENTIAL PURCHASE AGREEMENT (RPA-CA PAGE ${currentPage})
      14. STATUTORY AND OTHER DISCLOSURES AND CONTINGENCIES:
      A. Buyer shall have 17 (or 10) Days After Acceptance to inspect the Property, review all disclosures, reports, lease documents, and covenants, conditions, and restrictions (CC&Rs).
      B. Buyer shall complete all physical inspections and remove inspection contingency within 17 calendar days after acceptance.
      C. Financing contingency shall remain in effect for 21 days after acceptance date.`;

      const match = findQuoteInText(simulatedPageText, highlightQuote);
      setMatchFound(match.matched);
      if (onHighlightResult) onHighlightResult(match.matched);
    } else {
      setMatchFound(null);
    }
  }, [highlightQuote, currentPage, onHighlightResult]);

  return (
    <div className={`flex flex-col h-full border border-slate-800 rounded-2xl bg-slate-950/80 overflow-hidden ${className}`}>
      {/* Header Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <IconDocumentText className="h-4 w-4 text-brand-400" />
          <span className="truncate max-w-[200px]">{fileUrl ? 'Purchase Agreement.pdf' : 'Contract Document'}</span>
          <span className="badge-emerald text-[10px]">Page {currentPage}</span>
        </div>

        {/* Zoom & Page Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-0.5 text-slate-400 hover:text-white"
              title="Previous Page"
            >
              <IconChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-slate-200 font-mono text-[11px] px-1">Pg {currentPage}</span>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-0.5 text-slate-400 hover:text-white"
              title="Next Page"
            >
              <IconChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-xs">
            <button onClick={() => setZoomLevel((z) => Math.max(75, z - 10))} className="px-1 text-slate-400 hover:text-white">-</button>
            <span className="w-9 text-center font-mono text-slate-200 text-[11px]">{zoomLevel}%</span>
            <button onClick={() => setZoomLevel((z) => Math.min(150, z + 10))} className="px-1 text-slate-400 hover:text-white">+</button>
          </div>
        </div>
      </div>

      {/* Main Document Display */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-950/60 flex flex-col items-center">
        {/* Match Notice */}
        {highlightQuote && matchFound === false && (
          <div className="mb-4 w-full max-w-xl rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200 flex items-center gap-2">
            <IconExclamationTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            <span>Exact text couldn&apos;t be located in document text layer, showing Page {currentPage}</span>
          </div>
        )}

        {/* Simulated Document Sheet */}
        <div
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          className="w-full max-w-2xl rounded-xl border border-slate-700/60 bg-slate-900 p-8 shadow-2xl text-slate-300 font-serif leading-relaxed text-xs space-y-4 transition-transform duration-200"
        >
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center text-[10px] text-slate-500 font-sans">
            <span>CALIFORNIA RESIDENTIAL PURCHASE AGREEMENT (RPA-CA PAGE {currentPage})</span>
            <span>OFFICIAL CONTRACT RECORD</span>
          </div>

          <p className="text-slate-400">
            14. STATUTORY AND OTHER DISCLOSURES AND CANCELLATION RIGHTS:
            <br />
            A. Buyer shall have 17 (or ____) Days After Acceptance to inspect the Property, review all disclosures, reports, lease documents, and covenants, conditions, and restrictions (CC&amp;Rs).
          </p>

          {/* Highlight Quote Container */}
          {highlightQuote && (
            <div className="relative rounded-xl border-2 border-brand-500/80 bg-brand-500/15 p-4 shadow-lg ring-4 ring-brand-500/20 my-4">
              <div className="absolute -top-3 left-4 flex items-center gap-1.5 rounded-full bg-brand-600 px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-md">
                <IconSparkles className="h-3 w-3" />
                Cited Contract Excerpt
              </div>

              <p className="text-xs font-sans font-medium text-brand-100 leading-relaxed pt-1">
                &ldquo;{highlightQuote}&rdquo;
              </p>
            </div>
          )}

          <p className="text-slate-400">
            B. REMOVAL OF CONTINGENCIES: Within the time specified in paragraph 14A, Buyer shall deliver to Seller a signed removal of the applicable contingency or cancellation of this Agreement.
          </p>
          <p className="text-slate-400">
            C. SELLER RIGHT TO CANCEL: If Buyer does not deliver a signed removal within time specified, Seller may deliver a Notice to Buyer to Perform (C.A.R. Form NBP).
          </p>
        </div>
      </div>
    </div>
  );
}
