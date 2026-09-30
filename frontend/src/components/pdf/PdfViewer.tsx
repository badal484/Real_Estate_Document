import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  FileText,
  Sparkles,
  Search,
  Plus,
  Minus,
  X,
} from 'lucide-react';
import { findQuoteInPage, findMatchingItemIndices } from '@/utils/quoteMatcher';
import type { Document as Doc } from '@/types';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

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
  onClearHighlight?: () => void;
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
  onClearHighlight,
  className = '',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setQuoteMatched] = useState<boolean | null>(null);
  const [, setPageText] = useState('');
  const [highlightBoxes, setHighlightBoxes] = useState<HighlightBox[]>([]);

  // In-document Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Synchronize initialPage changes
  useEffect(() => {
    if (initialPage > 0 && initialPage !== currentPage) {
      setCurrentPage(initialPage);
    }
  }, [initialPage]);

  // Smooth Auto-Scroll to highlighted clause
  useEffect(() => {
    if (highlightBoxes.length > 0 && scrollContainerRef.current) {
      const firstBox = highlightBoxes[0];
      const container = scrollContainerRef.current;
      const targetScrollTop = Math.max(0, firstBox.top - container.clientHeight / 3);
      container.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    }
  }, [highlightBoxes]);

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

        const targetSearch = searchQuery.trim()
          ? searchQuery.trim()
          : highlightQuote
          ? highlightQuote.trim()
          : '';

        const boxes: HighlightBox[] = [];

        if (targetSearch) {
          const matchedIndices = findMatchingItemIndices(textContent.items as any[], targetSearch);
          const matchedSet = new Set(matchedIndices);

          (textContent.items as any[]).forEach((item, itemIdx) => {
            if (!('str' in item) || !item.str) return;
            if (!matchedSet.has(itemIdx)) return;

            const tx = item.transform[4];
            const ty = item.transform[5];
            const tw = item.width || 30;
            const th = item.height || 12;

            const [vx1, vy1, vx2, vy2] = viewport.convertToViewportRectangle([
              tx,
              ty,
              tx + tw,
              ty + th,
            ]);

            const left = Math.min(vx1, vx2);
            const top = Math.min(vy1, vy2);
            const width = Math.max(Math.abs(vx2 - vx1), 8);
            const height = Math.max(Math.abs(vy2 - vy1), 12);

            boxes.push({ left, top, width, height, text: item.str });
          });
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
      className={`flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200/80 ${className}`}
    >
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 bg-slate-50 border-b border-slate-200 text-xs text-slate-700 select-none">
        {/* Document Switcher & Info */}
        <div className="flex items-center gap-2 max-w-xs truncate">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white border border-slate-200 text-slate-700 shadow-2xs shrink-0">
            <FileText className="h-3.5 w-3.5" />
          </div>
          {documents.length > 1 && onSelectDoc ? (
            <select
              value={selectedDocId}
              onChange={(e) => onSelectDoc(e.target.value)}
              className="bg-white text-slate-800 border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium focus:ring-1 focus:ring-slate-900 truncate cursor-pointer shadow-2xs"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.filename}
                </option>
              ))}
            </select>
          ) : (
            <span className="font-semibold text-slate-800 truncate" title={filename}>
              {filename}
            </span>
          )}
        </div>

        {/* Page Navigation Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || loading}
            className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-30 transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-medium text-slate-500">Page</span>
            <span className="text-[11px] font-bold font-mono text-slate-900 px-0.5">
              {currentPage}
            </span>
            <span className="text-[11px] text-slate-400">of {numPages || 1}</span>
          </div>

          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage >= numPages || loading}
            className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-30 transition-colors"
            title="Next Page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Search & Zoom Controls */}
        <div className="flex items-center gap-2">
          {/* Document Search Toggle */}
          <button
            type="button"
            onClick={() => setShowSearch(!showSearch)}
            className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
              showSearch || searchQuery
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200 shadow-2xs'
            }`}
            title="Search in document"
          >
            <Search className="h-3.5 w-3.5" />
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(0.6, s - 0.15))}
              className="p-1 rounded hover:bg-slate-100 text-slate-600"
              title="Zoom Out"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="font-mono text-[11px] font-medium text-slate-700 px-1">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(2.5, s + 0.15))}
              className="p-1 rounded hover:bg-slate-100 text-slate-600"
              title="Zoom In"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* In-Document Search Bar */}
      {showSearch && (
        <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search contract terms..."
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-2xs"
              autoFocus
            />
          </div>

          {searchResults.length > 0 && (
            <div className="flex items-center gap-2 text-slate-600">
              <span className="text-[11px] font-medium">
                Page {searchResults[currentMatchIndex]} ({currentMatchIndex + 1} of {searchResults.length} matches)
              </span>
              <button
                type="button"
                onClick={prevSearchMatch}
                className="p-1 rounded hover:bg-slate-200 text-slate-600"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={nextSearchMatch}
                className="p-1 rounded hover:bg-slate-200 text-slate-600"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Citation Highlight Focus Banner */}
      {highlightQuote && (
        <div className="px-3.5 py-2 bg-amber-50/90 border-b border-amber-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2 min-w-0">
            <Sparkles className="h-3.5 w-3.5 text-amber-700 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-900 text-[10px] uppercase tracking-wide">
                  Active Citation Reference
                </span>
                {highlightBoxes.length > 0 && (
                  <Badge variant="warning" className="text-[9px] px-1 py-0">
                    Highlighted
                  </Badge>
                )}
              </div>
              <p className="font-mono text-amber-950 text-[11px] mt-0.5 italic line-clamp-2">
                &ldquo;{highlightQuote}&rdquo;
              </p>
            </div>
          </div>

          {onClearHighlight && (
            <button
              type="button"
              onClick={onClearHighlight}
              className="text-amber-700 hover:text-amber-900 hover:bg-amber-100 p-1 rounded text-xs font-semibold shrink-0 transition-colors"
              title="Dismiss highlight"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Document Viewport */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-auto p-6 flex items-center justify-center relative bg-slate-100"
      >
        {loading && (
          <div className="flex flex-col items-center gap-2 text-slate-500 text-xs py-16">
            <Loader2 className="h-5 w-5 animate-spin text-slate-700" />
            <span className="font-medium">Loading document pages&hellip;</span>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center gap-2 text-rose-600 text-xs max-w-sm text-center py-16">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {!loading && !error && pdfDoc && (
          <div className="relative shadow-lg rounded bg-white border border-slate-200 transition-transform duration-150">
            <canvas ref={canvasRef} className="block rounded" />

            {/* In-Situ Highlighter Overlay */}
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
                    className="bg-amber-300/40 border-b-2 border-amber-500 rounded-xs ring-1 ring-amber-400/40 shadow-xs"
                    title={box.text}
                  />
                ))}
              </div>
            )}

            {rendering && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center rounded">
                <Loader2 className="h-5 w-5 animate-spin text-slate-700" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
