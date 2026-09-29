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
} from '@/components/icons';
import type { Deal, Document as Doc, Citation } from '@/types';

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
    <div className="space-y-4 max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
        <Link to="/deals" className="hover:text-brand-700">Deals</Link>
        <IconChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <Link to={`/deals/${dealId}`} className="hover:text-brand-700">
          {deal?.propertyAddress ?? 'Deal'}
        </Link>
        <IconChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <span className="font-semibold text-slate-900">AI Knowledge Copilot</span>
      </nav>

      {error && (
        <div className="banner-error shrink-0">
          <IconExclamationTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Dual-Pane Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
        {/* Left Pane: Interactive PDF Viewer (7 cols) */}
        <div className="lg:col-span-7 h-full flex flex-col min-h-[400px]">
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
              className="flex-1"
            />
          )}
        </div>

        {/* Right Pane: AI Assistant Chat & Deal Summary (5 cols) */}
        <div className="lg:col-span-5 h-full flex flex-col min-h-[400px]">
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
