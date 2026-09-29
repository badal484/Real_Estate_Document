import React, { useState, useRef, useEffect } from 'react';
import type { AssistantMessage, Citation, ExecutiveSummary } from '@/types';
import { MessageBubble } from './MessageBubble';
import { StatusStream } from './StatusStream';
import { SuggestedQuestions } from './SuggestedQuestions';
import { SummaryPanel } from './SummaryPanel';
import { IconSparkles, IconSend, IconSpinner, IconShieldCheck } from '../icons';

interface ChatWindowProps {
  messages: AssistantMessage[];
  loading: boolean;
  statusStream?: string | null;
  error?: string | null;
  suggestions: string[];
  summary: ExecutiveSummary | null;
  indexStatus: string;
  onAsk: (question: string) => void;
  onSelectCitation?: (citation: Citation) => void;
}

export function ChatWindow({
  messages,
  loading,
  statusStream,
  error,
  suggestions,
  summary,
  indexStatus,
  onAsk,
  onSelectCitation,
}: ChatWindowProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, statusStream]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inputText.trim() || loading) return;
    onAsk(inputText.trim());
    setInputText('');
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600/20 text-brand-400 border border-brand-500/30">
            <IconSparkles className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Contract Intelligence Assistant
            </h3>
            <p className="text-[11px] text-slate-400">Verifiable source-backed answers &amp; risk matrix</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {indexStatus === 'INDEXING' ? (
            <span className="badge-amber text-[10px]">
              <IconSpinner className="h-3 w-3 animate-spin" />
              Indexing Documents...
            </span>
          ) : (
            <span className="badge-emerald text-[10px]">
              <IconShieldCheck className="h-3 w-3" />
              Zero Hallucination
            </span>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {summary && messages.length === 0 && (
          <div className="mb-6">
            <SummaryPanel summary={summary} />
          </div>
        )}

        {messages.length === 0 && (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <IconSparkles className="h-6 w-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="text-sm font-bold text-slate-200">Ask anything about your contract documents</h4>
              <p className="text-xs text-slate-400">Every answer includes clickable page &amp; clause citations that jump directly to the PDF source.</p>
            </div>

            <div className="max-w-xl mx-auto pt-2">
              <SuggestedQuestions questions={suggestions} onSelect={onAsk} />
            </div>
          </div>
        )}

        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            onSelectCitation={onSelectCitation}
            onSelectFollowUp={onAsk}
          />
        ))}

        <StatusStream statusMessage={statusStream} />

        {error && (
          <div className="banner-error text-xs">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="border-t border-slate-800 bg-slate-950 p-4">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about inspection terms, financing deadlines, earnest money..."
            disabled={loading}
            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 pr-12"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="absolute right-2 rounded-lg bg-brand-600 p-2 text-white hover:bg-brand-500 disabled:opacity-40 transition-all"
          >
            {loading ? <IconSpinner className="h-4 w-4 animate-spin" /> : <IconSend className="h-4 w-4" />}
          </button>
        </div>
      </form>
    </div>
  );
}
