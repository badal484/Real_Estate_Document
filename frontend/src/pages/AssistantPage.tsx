import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { dealsApi, documentsApi } from '@/services/api';
import { authHeaders } from '@/services/session';
import { useAssistant } from '@/hooks/useAssistant';
import { PdfViewer } from '@/components/pdf/PdfViewer';
import { ChatWindow } from '@/components/assistant/ChatWindow';
import {
  IconChevronRight,
  IconDocumentText,
  IconExclamationTriangle,
  IconSpinner,
  IconBuilding,
  IconShieldCheck,
  IconEnvelope,
} from '@/components/icons';
import type { Deal, Document as Doc, Citation } from '@/types';
import { formatDate } from '@/utils/date';

export function AssistantPage() {
  const { id } = useParams<{ id: string }>();
  const dealId = id!;

  const [deal, setDeal] = useState<Deal | null>(null);
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [targetPage, setTargetPage] = useState<number>(1);
  const [highlightQuote, setHighlightQuote] = useState<string | undefined>();
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    messages,
    suggestions,
    summary,
    indexStatus,
    loading: assistantLoading,
    streamingStage,
    streamingMessage,
    error: assistantError,
    activeCitation,
    askQuestion,
    focusCitation,
    clearMessages,
  } = useAssistant(dealId);

  // 1. Fetch deal and documents list
  useEffect(() => {
    dealsApi
      .get(dealId)
      .then(setDeal)
      .catch((err) => setError((err as Error).message));

    setLoadingDocs(true);
    documentsApi
      .list(dealId)
      .then((docs) => {
        setDocuments(docs);
        if (docs.length > 0) {
          setSelectedDocId(docs[0].id);
        }
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoadingDocs(false));
  }, [dealId]);

  // 2. Fetch authenticated document blob when selected document changes
  useEffect(() => {
    if (!selectedDocId) return;

    const baseUrl = import.meta.env['VITE_API_URL'] ?? 'http://localhost:3001/api';

    let isMounted = true;
    let createdUrl: string | null = null;

    // Fetch the PDF binary stream securely with session headers
    fetch(`${baseUrl}/deals/${dealId}/documents/${selectedDocId}/file`, {
      headers: {
        ...authHeaders(),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (!isMounted) return;
        createdUrl = URL.createObjectURL(blob);
        setPdfUrl(createdUrl);
      })
      .catch(async (err) => {
        console.warn('Direct file streaming failed, attempting fallback URL:', err);
        try {
          const res = await fetch(`${baseUrl}/deals/${dealId}/documents/${selectedDocId}/url`, {
            headers: { ...authHeaders() },
          });
          const data = await res.json();
          if (isMounted && data.url) {
            setPdfUrl(data.url);
          }
        } catch (fallbackErr) {
          console.error('All document loading attempts failed:', fallbackErr);
        }
      });

    return () => {
      isMounted = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [dealId, selectedDocId]);

  // 3. Handle citation click -> switch document & jump to page & focus quote
  const handleCitationClick = (citation: Citation) => {
    focusCitation(citation);

    if (citation.sourceType === 'document') {
      if (citation.documentId && citation.documentId !== selectedDocId) {
        setSelectedDocId(citation.documentId);
      }
      if (citation.pageNumber) {
        setTargetPage(citation.pageNumber);
      }
      if (citation.quote) {
        setHighlightQuote(citation.quote);
      }
    }
  };

  const currentDoc = documents.find((d) => d.id === selectedDocId);

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] max-w-[1600px] mx-auto px-2 sm:px-4 pb-3 space-y-2.5">
      {/* Top Header Command Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-2xs shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs shrink-0">
            <IconBuilding className="h-5 w-5 text-brand-300" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Link to="/deals" className="hover:text-slate-800 transition-colors">
                  Deals
                </Link>
                <IconChevronRight className="h-3 w-3 text-slate-300" />
                <Link to={`/deals/${dealId}`} className="hover:text-slate-800 transition-colors truncate max-w-[160px]">
                  {deal?.propertyAddress ?? 'Deal'}
                </Link>
                <IconChevronRight className="h-3 w-3 text-slate-300" />
              </nav>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                <IconShieldCheck className="h-3 w-3 text-emerald-600" />
                Contract AI Verified
              </span>
            </div>

            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              <h1 className="text-sm font-bold text-slate-900 truncate">
                {deal?.propertyAddress || 'Transaction Workspace'}
              </h1>
              {deal?.acceptanceDate && (
                <span className="text-xs text-slate-500 font-mono">
                  Accepted: <strong className="text-slate-800">{formatDate(deal.acceptanceDate)}</strong>
                </span>
              )}
              {deal?.buyerName && (
                <span className="text-xs text-slate-500 hidden sm:inline">
                  Buyer: <strong className="text-slate-800">{deal.buyerName}</strong>
                </span>
              )}
              {deal?.sellerName && (
                <span className="text-xs text-slate-500 hidden md:inline">
                  Seller: <strong className="text-slate-800">{deal.sellerName}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Quick Nav Actions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link
            to={`/deals/${dealId}`}
            className="btn-secondary text-xs flex items-center gap-1.5 py-1 px-2.5"
            title="Milestones Timeline"
          >
            <span>&larr; Milestones</span>
          </Link>
          <Link
            to={`/deals/${dealId}/notifications`}
            className="btn-secondary text-xs flex items-center gap-1.5 py-1 px-2.5"
            title="Notification alerts"
          >
            <IconEnvelope className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Alerts</span>
          </Link>
          <Link
            to={`/deals/${dealId}/review`}
            className="btn-secondary text-xs flex items-center gap-1.5 py-1 px-2.5"
            title="Clause Verification"
          >
            <IconDocumentText className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Clauses</span>
          </Link>
          <Link
            to={`/audit?dealId=${dealId}`}
            className="btn-secondary text-xs flex items-center gap-1.5 py-1 px-2.5"
            title="Audit Trail"
          >
            <span>Audit</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="banner-error shrink-0 text-xs py-2 px-3">
          <IconExclamationTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Dual-Pane Responsive Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1 min-h-0">
        {/* Left Pane: Interactive PDF Viewer (7 cols / 58% width) */}
        <div className="lg:col-span-7 h-full flex flex-col min-h-[420px]">
          {loadingDocs ? (
            <div className="card h-full flex items-center justify-center gap-2 text-slate-400 text-sm">
              <IconSpinner className="h-5 w-5 animate-spin text-brand-600" />
              <span>Loading transaction documents...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="card h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <IconDocumentText className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-800">No Documents Uploaded</h4>
              <p className="text-xs max-w-xs text-slate-400">
                Upload the purchase agreement or contract PDF to enable page-by-page deep reference viewing.
              </p>
              <Link to="/upload" className="btn-primary text-xs">
                Upload Purchase Agreement
              </Link>
            </div>
          ) : (
            <PdfViewer
              fileUrl={pdfUrl}
              filename={currentDoc?.filename || 'Purchase_Agreement.pdf'}
              initialPage={targetPage}
              highlightQuote={highlightQuote}
              documents={documents}
              selectedDocId={selectedDocId}
              onSelectDoc={setSelectedDocId}
              onClearHighlight={() => setHighlightQuote(undefined)}
              className="flex-1 shadow-xs"
            />
          )}
        </div>

        {/* Right Pane: AI Assistant Chat & Deal Intelligence (5 cols / 42% width) */}
        <div className="lg:col-span-5 h-full flex flex-col min-h-[420px]">
          <ChatWindow
            messages={messages}
            loading={assistantLoading}
            streamingStage={streamingStage}
            streamingMessage={streamingMessage}
            error={assistantError}
            suggestions={suggestions}
            summary={summary}
            indexStatus={indexStatus}
            activeCitationId={activeCitation?.id}
            onAsk={askQuestion}
            onCitationClick={handleCitationClick}
            onClear={clearMessages}
          />
        </div>
      </div>
    </div>
  );
}

