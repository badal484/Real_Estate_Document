import { useState, useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { StatusStream } from './StatusStream';
import { SuggestedQuestions } from './SuggestedQuestions';
import { SummaryPanel } from './SummaryPanel';
import {
  IconSparkles,
  IconPaperAirplane,
  IconSpinner,
  IconArrowPath,
  IconExclamationTriangle,
  IconDocumentText,
} from '../icons';
import type {
  AssistantMessage,
  Citation,
  DealSummaryResponse,
  IndexStatusResponse,
} from '@/types';

interface Props {
  messages: AssistantMessage[];
  loading: boolean;
  streamingStage: 'retrieving' | 'reasoning' | 'verifying' | null;
  streamingMessage: string;
  error: string | null;
  suggestions: string[];
  summary: DealSummaryResponse | null;
  indexStatus: IndexStatusResponse | null;
  activeCitationId?: number | null;
  onAsk: (question: string) => void;
  onCitationClick: (citation: Citation) => void;
  onClear: () => void;
}

export function ChatWindow({
  messages,
  loading,
  streamingStage,
  streamingMessage,
  error,
  suggestions,
  summary,
  indexStatus,
  activeCitationId,
  onAsk,
  onCitationClick,
  onClear,
}: Props) {
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'summary'>('chat');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingStage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const q = input.trim();
    setInput('');
    onAsk(q);
  };

  const isIndexing = indexStatus?.status === 'INDEXING';

  return (
    <div className="flex flex-col h-full bg-slate-50/50 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600 text-white shadow-sm">
            <IconSparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>AI Knowledge Assistant</span>
              <span className="rounded-full bg-purple-100 text-purple-700 px-2 py-0.5 text-[10px] font-semibold">
                Grounded
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              {isIndexing ? (
                <span className="text-amber-600 flex items-center gap-1">
                  <IconSpinner className="h-3 w-3 animate-spin" /> Indexing document pages&hellip;
                </span>
              ) : (
                'Zero-hallucination verified contract copilot'
              )}
            </p>
          </div>
        </div>

        {/* Tab switch & actions */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                activeTab === 'chat'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chat Q&amp;A
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('summary')}
              className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                activeTab === 'summary'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Deal Summary
            </button>
          </div>

          {messages.length > 0 && activeTab === 'chat' && (
            <button
              type="button"
              onClick={onClear}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Reset conversation"
            >
              <IconArrowPath className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'summary' ? (
          <SummaryPanel summary={summary} loading={loading && !summary} />
        ) : (
          <>
            {/* Empty State with Suggested Questions */}
            {messages.length === 0 && (
              <div className="py-6 px-2 space-y-6">
                <div className="text-center space-y-2 max-w-sm mx-auto">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 mx-auto shadow-sm ring-1 ring-purple-100">
                    <IconSparkles className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Ask anything about this transaction
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Ask questions about contingency deadlines, inspection obligations, HOA bylaws,
                    earnest deposits, and addenda overrides with deep references.
                  </p>
                </div>

                <SuggestedQuestions
                  suggestions={suggestions}
                  onSelect={onAsk}
                  loading={loading}
                />
              </div>
            )}

            {/* Message History */}
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onCitationClick={onCitationClick}
                onFollowUpClick={onAsk}
                activeCitationId={activeCitationId}
              />
            ))}

            {/* Live Streaming Stage Indicator */}
            {loading && (
              <StatusStream
                stage={streamingStage}
                message={streamingMessage}
              />
            )}

            {/* Error Banner */}
            {error && (
              <div className="banner-error">
                <IconExclamationTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Box (Chat Tab only) */}
      {activeTab === 'chat' && (
        <form
          onSubmit={handleSubmit}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask about inspection period, earnest money, loan contingency..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="input-base text-xs flex-1 py-2.5"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary flex items-center justify-center p-2.5 h-10 w-10 shrink-0 disabled:opacity-40"
            title="Ask AI Copilot"
          >
            {loading ? (
              <IconSpinner className="h-4 w-4 animate-spin text-white" />
            ) : (
              <IconPaperAirplane className="h-4 w-4" />
            )}
          </button>
        </form>
      )}
    </div>
  );
}
