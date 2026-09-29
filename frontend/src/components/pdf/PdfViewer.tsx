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
  IconMagnifyingGlass,
} from '../icons';
import { findQuoteInPage, normalizeClientText } from '@/utils/quoteMatcher';
import type { Document as Doc } from '@/types';

// Configure pdfjs worker to use local bundled Vite worker
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

interface HighlightBox {
  left: number;
  top: number;
  width: number;
  height: number;
  text: string;
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.25);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quoteMatched, setQuoteMatched] = useState<boolean | null>(null);
  const [pageText, setPageText] = useState('');
  const [highlightBoxes, setHighlightBoxes] = useState<HighlightBox[]>([]);

  // In-document Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

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

  // Render current page to canvas & compute in-situ highlight bounding boxes
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let isCancelled = false;
    setRendering(true);
    setHighlightBoxes([]);

    pdfDoc
      .getPage(currentPage)
      .then(async (page) => {
        if (isCancelled) return;

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
        await renderTask.promise;

        if (isCancelled) return;

        // Extract text items with exact geometry
        const textContent = await page.getTextContent();
        const extracted = textContent.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ');
        setPageText(extracted);

        // Compute Bounding Boxes for Quote Highlighting or In-Page Search
        const targetSearch = searchQuery.trim()
          ? searchQuery.trim().toLowerCase()
          : highlightQuote
            ? normalizeClientText(highlightQuote).slice(0, 40)
            : '';

        const boxes: HighlightBox[] = [];

        if (targetSearch && targetSearch.length >= 3) {
          const normTargetWords = targetSearch.split(/\s+/).filter((w) => w.length > 2);

          for (const item of textContent.items as any[]) {
            if (!('str' in item) || !item.str) continue;
            const itemText = item.str.toLowerCase();

            const isMatch = normTargetWords.some((w) => itemText.includes(w));
            if (isMatch) {
              const tx = item.transform[4];
              const ty = item.transform[5];
              const tw = item.width || 30;
              const th = item.height || 12;

              // Convert PDF coordinates to Canvas Viewport coordinates
              const [vx1, vy1, vx2, vy2] = viewport.convertToViewportRectangle([
                tx,
                ty,
                tx + tw,
                ty + th,
              ]);

              const left = Math.min(vx1, vx2);
              const top = Math.min(vy1, vy2);
              const width = Math.max(Math.abs(vx2 - vx1), 10);
              const height = Math.max(Math.abs(vy2 - vy1), 12);

              boxes.push({ left, top, width, height, text: item.str });
            }
          }
        }

        setHighlightBoxes(boxes);

        if (highlightQuote) {
          const matchResult = findQuoteInPage(highlightQuote, extracted);
          setQuoteMatched(matchResult.isMatched);
        } else {
          setQuoteMatched(null);
        }

        setRendering(false);
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
  }, [pdfDoc, currentPage, scale, highlightQuote, searchQuery]);

  // Document-wide text search handler
  const handleSearch = async (term: string) => {
    setSearchQuery(term);
    if (!pdfDoc || !term.trim()) {
      setSearchResults([]);
      return;
    }

    const matches: number[] = [];
    const lowerTerm = term.toLowerCase().trim();

    for (let p = 1; p <= pdfDoc.numPages; p++) {
      const page = await pdfDoc.getPage(p);
      const text = await page.getTextContent();
      const str = text.items.map((it: any) => ('str' in it ? it.str : '')).join(' ');
      if (str.toLowerCase().includes(lowerTerm)) {
        matches.push(p);
      }
    }

    setSearchResults(matches);
    if (matches.length > 0) {
      setCurrentMatchIndex(0);
      setCurrentPage(matches[0]);
    }
  };

  const nextSearchMatch = () => {
    if (searchResults.length === 0) return;
    const nextIdx = (currentMatchIndex + 1) % searchResults.length;
    setCurrentMatchIndex(nextIdx);
    setCurrentPage(searchResults[nextIdx]);
  };

  const prevSearchMatch = () => {
    if (searchResults.length === 0) return;
    const prevIdx = (currentMatchIndex - 1 + searchResults.length) % searchResults.length;
    setCurrentMatchIndex(prevIdx);
    setCurrentPage(searchResults[prevIdx]);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < numPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col h-full bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800 ${className}`}
    >
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-3 bg-slate-950 border-b border-slate-800 text-xs text-slate-300 select-none">
        {/* Document Switcher & Info */}
        <div className="flex items-center gap-2 max-w-xs truncate">
          <IconDocumentText className="h-4 w-4 text-brand-400 shrink-0" />
          {documents.length > 1 && onSelectDoc ? (
            <select
              value={selectedDocId}
              onChange={(e) => onSelectDoc(e.target.value)}
              className="bg-slate-900 text-slate-200 border border-slate-700 rounded-md px-2 py-1 text-xs focus:ring-brand-500 truncate cursor-pointer"
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

        {/* Page Navigation & Thumbnails */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || loading}
            className="p-1 rounded-md hover:bg-slate-800 disabled:opacity-30 transition-colors"
            title="Previous Page (Arrow Left)"
          >
            <IconChevronLeft className="h-4 w-4" />
          </button>

          {/* Quick Page Pill Strip */}
          <div className="flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 rounded-lg border border-slate-800">
            {Array.from({ length: numPages || 1 }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-all ${
                  currentPage === pageNum
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage >= numPages || loading}
            className="p-1 rounded-md hover:bg-slate-800 disabled:opacity-30 transition-colors"
            title="Next Page (Arrow Right)"
          >
            <IconChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Search & Zoom Controls */}
        <div className="flex items-center gap-2">
          {/* Document Search Toggle */}
          <button
            type="button"
            onClick={() => setShowSearch(!showSearch)}
            className={`p-1.5 rounded-md transition-colors ${
              showSearch || searchQuery ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 text-slate-300'
            }`}
            title="Search text in document"
          >
            <IconMagnifyingGlass className="h-3.5 w-3.5" />
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(0.6, s - 0.2))}
              className="px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300"
              title="Zoom Out"
            >
              &minus;
            </button>
            <span className="font-mono text-[11px] text-slate-300 px-1">{Math.round(scale * 100)}%</span>
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(2.5, s + 0.2))}
              className="px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300"
              title="Zoom In"
            >
              &#43;
            </button>
          </div>
        </div>
      </div>

      {/* In-Document Search Input Bar */}
      {showSearch && (
        <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <IconMagnifyingGlass className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search contract terms (e.g. inspection, escrow, loan)..."
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 text-xs placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
              autoFocus
            />
          </div>

          {searchResults.length > 0 && (
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-[11px]">
                Page {searchResults[currentMatchIndex]} ({currentMatchIndex + 1} of {searchResults.length} pages)
              </span>
              <button
                type="button"
                onClick={prevSearchMatch}
                className="p-1 rounded hover:bg-slate-800 text-slate-300"
              >
                <IconChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={nextSearchMatch}
                className="p-1 rounded hover:bg-slate-800 text-slate-300"
              >
                <IconChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Citation Highlight Indicator Banner */}
      {highlightQuote && (
        <div className="px-4 py-2 bg-amber-950/80 border-b border-amber-800/60 flex items-start gap-2.5 text-xs animate-in fade-in duration-200">
          <IconSparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-amber-200">Focused Citation Clause:</span>
            <p className="font-mono text-amber-100/90 mt-0.5 italic line-clamp-2">
              &ldquo;{highlightQuote}&rdquo;
            </p>
          </div>
          {highlightBoxes.length > 0 ? (
            <span className="shrink-0 rounded-full bg-amber-400/20 text-amber-300 px-2 py-0.5 font-medium text-[11px] border border-amber-500/40">
              ✨ In-Situ Highlighted
            </span>
          ) : (
            <span className="shrink-0 rounded bg-amber-900/60 text-amber-300 px-2 py-0.5 font-medium text-[11px] border border-amber-700/50">
              Page {currentPage}
            </span>
          )}
        </div>
      )}

      {/* Main Canvas Document Scroll Container */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center relative bg-slate-900/90">
        {loading && (
          <div className="flex flex-col items-center gap-3 text-slate-400 text-sm py-16">
            <IconSpinner className="h-7 w-7 animate-spin text-brand-500" />
            <span>Loading document pages&hellip;</span>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center gap-2 text-rose-400 text-sm max-w-sm text-center py-16">
            <IconExclamationTriangle className="h-6 w-6" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && pdfDoc && (
          <div className="relative shadow-2xl rounded bg-white transition-transform duration-150">
            <canvas ref={canvasRef} className="block rounded" />

            {/* Glowing In-Situ Highlighting Overlay */}
            {highlightBoxes.length > 0 && (
              <div className="absolute inset-0 pointer-events-none">
                {highlightBoxes.map((box, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'absolute',
                      left: `${box.left}px`,
                      top: `${box.top}px`,
                      width: `${box.width}px`,
                      height: `${box.height}px`,
                    }}
                    className="bg-amber-300/35 border-b-2 border-amber-500 rounded-xs ring-2 ring-amber-400/50 shadow-xs animate-pulse"
                    title={box.text}
                  />
                ))}
              </div>
            )}

            {rendering && (
              <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] flex items-center justify-center rounded">
                <IconSpinner className="h-5 w-5 animate-spin text-brand-500" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
