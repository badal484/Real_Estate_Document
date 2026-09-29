import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  IconChevronLeft,
  IconChevronRight,
  IconSpinner,
  IconExclamationTriangle,
  IconDocumentText,
  IconSparkles,
} from '../icons';
import { findQuoteInPage } from '@/utils/quoteMatcher';
import type { Document as Doc } from '@/types';

// Configure pdfjs worker to use local bundled Vite worker
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}



interface Props {
  fileUrl: string;
  filename?: string;
  initialPage?: number;
  highlightQuote?: string;
  documents?: Doc[];
  selectedDocId?: string;
  onSelectDoc?: (docId: string) => void;
  className?: string;
}

export function PdfViewer({
  fileUrl,
  filename = 'Document.pdf',
  initialPage = 1,
  highlightQuote,
  documents = [],
  selectedDocId,
  onSelectDoc,
  className = '',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quoteMatched, setQuoteMatched] = useState<boolean | null>(null);
  const [pageText, setPageText] = useState('');

  // Synchronize initialPage changes (e.g. when user clicks a citation badge)
  useEffect(() => {
    if (initialPage > 0 && initialPage !== currentPage) {
      setCurrentPage(initialPage);
    }
  }, [initialPage]);

  // Load PDF Document
  useEffect(() => {
    if (!fileUrl) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setPdfDoc(null);

    const loadingTask = pdfjsLib.getDocument({
      url: fileUrl,
      cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
      cMapPacked: true,
    });

    loadingTask.promise
      .then((pdf) => {
        if (!isMounted) return;
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setCurrentPage(Math.min(initialPage, pdf.numPages));
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('PDF loading error:', err);
        setError('Failed to load PDF document. Please verify your connection.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
      loadingTask.destroy().catch(() => {});
    };
  }, [fileUrl]);

  // Render current page to canvas & extract text layer
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let isCancelled = false;
    setRendering(true);

    pdfDoc
      .getPage(currentPage)
      .then(async (page) => {
        if (isCancelled) return;

        // Extract text content for quote matching
        const textContent = await page.getTextContent();
        const extracted = textContent.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ');
        setPageText(extracted);

        if (highlightQuote) {
          const matchResult = findQuoteInPage(highlightQuote, extracted);
          setQuoteMatched(matchResult.isMatched);
        } else {
          setQuoteMatched(null);
        }

        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        const pixelRatio = window.devicePixelRatio || 1;
        canvas.width = viewport.width * pixelRatio;
        canvas.height = viewport.height * pixelRatio;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const renderContext = {
          canvasContext: context,
          viewport,
        };

        const renderTask = page.render(renderContext);
        return renderTask.promise;
      })
      .then(() => {
        if (!isCancelled) setRendering(false);
      })
      .catch((err) => {
        if (!isCancelled) {
          console.warn('Page render error:', err);
          setRendering(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, currentPage, scale, highlightQuote]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < numPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className={`flex flex-col h-full bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800 ${className}`}>
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-950 border-b border-slate-800 text-xs text-slate-300">
        {/* Document Switcher */}
        <div className="flex items-center gap-2 max-w-xs truncate">
          <IconDocumentText className="h-4 w-4 text-brand-400 shrink-0" />
          {documents.length > 1 && onSelectDoc ? (
            <select
              value={selectedDocId}
              onChange={(e) => onSelectDoc(e.target.value)}
              className="bg-slate-900 text-slate-200 border border-slate-700 rounded-md px-2 py-1 text-xs focus:ring-brand-500 truncate"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.filename}
                </option>
              ))}
            </select>
          ) : (
            <span className="font-medium text-slate-200 truncate">{filename}</span>
          )}
        </div>

        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || loading}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 transition-colors"
            title="Previous Page"
          >
            <IconChevronLeft className="h-4 w-4" />
          </button>

          <span className="font-mono text-xs text-slate-300">
            Page <strong className="text-white font-semibold">{currentPage}</strong> of{' '}
            <strong className="text-white">{numPages || '…'}</strong>
          </span>

          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage >= numPages || loading}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 transition-colors"
            title="Next Page"
          >
            <IconChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(0.6, s - 0.2))}
            className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300"
            title="Zoom Out"
          >
            &minus;
          </button>
          <span className="font-mono text-slate-400 px-1">{Math.round(scale * 100)}%</span>
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(2.5, s + 0.2))}
            className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300"
            title="Zoom In"
          >
            &#43;
          </button>
        </div>
      </div>

      {/* Citation Highlight Indicator Banner */}
      {highlightQuote && (
        <div className="px-4 py-2 bg-brand-950 border-b border-brand-800 flex items-start gap-2.5 text-xs">
          <IconSparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-amber-200">Focused Citation Quote:</span>
            <p className="font-mono text-amber-100/90 mt-0.5 italic line-clamp-2">
              &ldquo;{highlightQuote}&rdquo;
            </p>
          </div>
          {quoteMatched === false && (
            <span className="shrink-0 rounded bg-amber-900/60 text-amber-300 px-2 py-0.5 font-medium text-[11px] border border-amber-700/50">
              Showing Page {currentPage} (Exact text position fuzzy)
            </span>
          )}
        </div>
      )}

      {/* Main Canvas Document Scroll Container */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center relative bg-slate-900/90">
        {loading && (
          <div className="flex flex-col items-center gap-2 text-slate-400 text-sm">
            <IconSpinner className="h-6 w-6 animate-spin text-brand-500" />
            <span>Loading document pages&hellip;</span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-2 text-rose-400 text-sm max-w-sm text-center">
            <IconExclamationTriangle className="h-6 w-6" />
            <span>{error}</span>
          </div>
        )}

        <div className="relative shadow-2xl rounded bg-white">
          <canvas ref={canvasRef} className="block rounded" />
          {rendering && (
            <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] flex items-center justify-center rounded">
              <IconSpinner className="h-5 w-5 animate-spin text-brand-500" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
