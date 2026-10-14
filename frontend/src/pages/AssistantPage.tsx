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
    }
  };

  const currentDoc = documents.find((d) => d.id === selectedDocId);

  return (
    <div className="flex flex-col min-h-[calc(100vh-10rem)] lg:h-[calc(100vh-10rem)] max-w-[1600px] mx-auto space-y-4 pb-6">
      {/* Universal Deal Header Command Bar */}
      <DealHeader deal={deal} notifSettings={notifSettings} activeTab="assistant" />

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive shrink-0">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Dual-Pane Responsive Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Left Pane: Interactive PDF Viewer (7 cols / 58% width) */}
        <div className="lg:col-span-7 h-full flex flex-col min-h-[460px] lg:min-h-0">
          {loadingDocs ? (
            <div className="rounded-3xl border border-[#E4E4E7] bg-white h-full flex flex-col items-center justify-center gap-3 text-[#71717A] text-xs shadow-clean-sm">
              <Loader2 className="h-6 w-6 animate-spin text-[#09090B]" />
              <span>Loading transaction contract documents...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="rounded-3xl border border-[#E4E4E7] bg-white h-full flex flex-col items-center justify-center p-8 text-center text-[#71717A] space-y-3.5 shadow-clean-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4F4F5] text-[#09090B] border border-[#E4E4E7]">
                <FileText className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-semibold text-[#09090B]">No Contract Documents Uploaded</h4>
              <p className="text-xs max-w-xs text-[#71717A]">
                Upload the purchase agreement or counter offer PDF to enable deep citation-grounded viewing.
              </p>
              <Button asChild size="sm" className="rounded-full text-xs font-medium gap-1.5 bg-[#09090B] hover:bg-black text-white">
                <Link to="/upload">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Upload Purchase Agreement</span>
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
              className="flex-1 shadow-clean-sm rounded-3xl"
            />
          )}
        </div>

        {/* Right Pane: AI Assistant Chat & Deal Intelligence (5 cols / 42% width) */}
        <div className="lg:col-span-5 h-full flex flex-col min-h-[460px] lg:min-h-0">
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
