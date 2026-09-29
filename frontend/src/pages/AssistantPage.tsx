import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAssistant } from '@/hooks/useAssistant';
import { PdfViewer } from '@/components/pdf/PdfViewer';
import { ChatWindow } from '@/components/assistant/ChatWindow';
import { dealsApi } from '@/services/api';
import type { Deal, Citation } from '@/types';
import { IconChevronRight, IconSparkles, IconDocumentText } from '@/components/icons';

export function AssistantPage() {
  const { id } = useParams<{ id: string }>();
  const dealId = id!;
  const [deal, setDeal] = useState<Deal | null>(null);

  const {
    messages,
    loading,
    statusStream,
    error,
    suggestions,
    summary,
    indexStatus,
    activeCitation,
    setActiveCitation,
    askQuestion,
  } = useAssistant(dealId);

  const [pdfPage, setPdfPage] = useState<number>(1);
  const [highlightQuote, setHighlightQuote] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (dealId) {
      dealsApi.get(dealId).then(setDeal).catch(() => {});
    }
  }, [dealId]);

  function handleSelectCitation(citation: Citation) {
    setActiveCitation(citation);
    if (citation.pageNumber) {
      setPdfPage(citation.pageNumber);
    }
    if (citation.quote) {
      setHighlightQuote(citation.quote);
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Header */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/deals" className="hover:text-brand-300 transition-colors">Portfolio Deals</Link>
        <IconChevronRight className="h-3.5 w-3.5 text-slate-600" />
        <Link to={`/deals/${dealId}`} className="hover:text-brand-300 transition-colors">
          {deal?.propertyAddress || 'Deal Detail'}
        </Link>
        <IconChevronRight className="h-3.5 w-3.5 text-slate-600" />
        <span className="font-semibold text-slate-100 flex items-center gap-1.5">
          <IconSparkles className="h-3.5 w-3.5 text-brand-400" />
          AI Knowledge Assistant
        </span>
      </nav>

      {/* Main Dual-Pane Container */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 h-[calc(100vh-180px)] min-h-[600px]">
        {/* Left Pane: PDF Viewer with Highlight Layer */}
        <div className="lg:col-span-6 flex flex-col h-full overflow-hidden">
          <PdfViewer
            page={pdfPage}
            highlightQuote={highlightQuote}
            className="h-full shadow-2xl"
          />
        </div>

        {/* Right Pane: AI Assistant Chat & Risk Matrix */}
        <div className="lg:col-span-6 flex flex-col h-full overflow-hidden">
          <ChatWindow
            messages={messages}
            loading={loading}
            statusStream={statusStream}
            error={error}
            suggestions={suggestions}
            summary={summary}
            indexStatus={indexStatus}
            onAsk={askQuestion}
            onSelectCitation={handleSelectCitation}
          />
        </div>
      </div>
    </div>
  );
}
