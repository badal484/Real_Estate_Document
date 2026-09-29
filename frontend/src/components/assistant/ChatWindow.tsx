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
  IconMicrophone,
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
  const [isListening, setIsListening] = useState(false);
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

  // Voice Query (Speech to Text)
  const handleToggleVoice = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice dictation is not supported on this browser. Please use Chrome, Safari, or Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const isIndexing = indexStatus?.status === 'INDEXING';

  const quickPrompts = [
    'What is the contract acceptance date?',
    'What are the inspection contingency terms?',
    'When is the loan commitment due?',
    'What happens if appraisal is below price?',
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50/50 rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-slate-200 select-none">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600 text-white shadow-xs">
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
                  ? 'bg-white text-slate-900 shadow-2xs'
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
                  ? 'bg-white text-slate-900 shadow-2xs'
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 mx-auto shadow-xs ring-1 ring-purple-100">
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
        <div className="bg-white border-t border-slate-200">
          {/* Quick Prompt Pill Strip */}
          {messages.length > 0 && (
            <div className="px-3 pt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onAsk(qp)}
                  disabled={loading}
                  className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition-colors disabled:opacity-40"
                >
                  {qp}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="p-3 flex items-center gap-2"
          >
            {/* Microphone Voice Button */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-2.5 rounded-xl border transition-all ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-600 ring-2 ring-rose-300 animate-pulse'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200'
              }`}
              title={isListening ? 'Listening... click to stop' : 'Voice dictation'}
            >
              <IconMicrophone className="h-4 w-4" />
            </button>

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
        </div>
      )}
    </div>
  );
}
