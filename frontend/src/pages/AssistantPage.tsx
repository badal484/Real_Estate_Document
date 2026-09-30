import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { dealsApi, documentsApi, notificationsApi } from '@/services/api';
import { authHeaders } from '@/services/session';
import { useAssistant } from '@/hooks/useAssistant';
import { PdfViewer } from '@/components/pdf/PdfViewer';
import { ChatWindow } from '@/components/assistant/ChatWindow';
import { DealHeader } from '@/components/deal/DealHeader';
import {
  FileText,
  AlertTriangle,
  Loader2,
  Sparkles,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Deal, Document as Doc, Citation, NotificationSetting } from '@/types';

export function AssistantPage() {
  const { id } = useParams<{ id: string }>();
  const dealId = id!;

  const [deal, setDeal] = useState<Deal | null>(null);
  const [notifSettings, setNotifSettings] = useState<NotificationSetting | null>(null);
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [targetPage, setTargetPage] = useState<number>(1);
  const [highlightQuote, setHighlightQuote] = useState<string | undefined>();
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileActivePane, setMobileActivePane] = useState<'pdf' | 'chat'>('chat');

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

  // 1. Fetch deal, settings, and documents list
  useEffect(() => {
    dealsApi
      .get(dealId)
      .then(setDeal)
      .catch((err) => setError((err as Error).message));

    notificationsApi
      .getSettings(dealId)
      .then(setNotifSettings)
      .catch(() => {});

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
        console.warn('Direct file streaming fallback:', err);
        try {
          const res = await fetch(`${baseUrl}/deals/${dealId}/documents/${selectedDocId}/url`, {
            headers: { ...authHeaders() },
          });
          const data = await res.json();
          if (isMounted && data.url) {
            setPdfUrl(data.url);
          }
        } catch (fallbackErr) {
          console.error('Document loading error:', fallbackErr);
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
      // On mobile, automatically switch tab to PDF to inspect the citation
      setMobileActivePane('pdf');
    }
  };

  const currentDoc = documents.find((d) => d.id === selectedDocId);

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] max-w-[1600px] mx-auto pb-3 space-y-3">
      {/* Universal Deal Header Command Bar */}
      <DealHeader deal={deal} notifSettings={notifSettings} activeTab="assistant" />

      {error && (
        <div className="banner-error text-xs shrink-0">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Mobile / Tablet Viewport Selector */}
      <div className="flex lg:hidden rounded-md bg-secondary p-0.5 text-xs font-medium shrink-0 border border-border">
        <button
          type="button"
          onClick={() => setMobileActivePane('chat')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded transition-all ${
            mobileActivePane === 'chat'
              ? 'bg-surface text-primary-text font-semibold shadow-2xs'
              : 'text-secondary-text hover:text-primary-text'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          <span>AI Contract Copilot</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileActivePane('pdf')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded transition-all ${
            mobileActivePane === 'pdf'
              ? 'bg-surface text-primary-text font-semibold shadow-2xs'
              : 'text-secondary-text hover:text-primary-text'
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Document Viewer</span>
        </button>
      </div>

      {/* Main Dual-Pane Responsive Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0">
        {/* Left Pane: Interactive PDF Viewer (7 cols / 58% width on desktop) */}
        <div
          className={`lg:col-span-7 h-full flex-col min-h-[420px] ${
            mobileActivePane === 'pdf' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {loadingDocs ? (
            <div className="rounded-md border border-border bg-surface h-full flex flex-col items-center justify-center gap-2 text-secondary-text text-xs shadow-2xs">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Loading transaction contract documents...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="rounded-md border border-border bg-surface h-full flex flex-col items-center justify-center p-8 text-center text-secondary-text space-y-3 shadow-2xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-secondary-text">
                <FileText className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-semibold text-primary-text">No Contract Documents Uploaded</h4>
              <p className="text-xs max-w-xs text-secondary-text">
                Upload the purchase agreement or counter offer PDF to enable deep citation-grounded viewing.
              </p>
              <Button asChild size="sm" className="text-xs gap-1.5">
                <Link to="/upload">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Upload Contract PDF</span>
                </Link>
              </Button>
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
              className="flex-1 shadow-2xs"
            />
          )}
        </div>

        {/* Right Pane: AI Assistant Chat & Deal Intelligence (5 cols / 42% width on desktop) */}
        <div
          className={`lg:col-span-5 h-full flex-col min-h-[420px] ${
            mobileActivePane === 'chat' ? 'flex' : 'hidden lg:flex'
          }`}
        >
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
