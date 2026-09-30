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
  IconShieldCheck,
  IconChatBubbleLeftRight,
  IconChartBar,
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

  const categorizedStarters = [
    {
      category: 'Timeline & Deadlines',
      prompt: 'What are the exact calendar deadlines for inspection, appraisal, and loan commitment?',
    },
    {
      category: 'Inspection & Repairs',
      prompt: 'What are the buyer inspection terms, access rights, and remedy obligations?',
    },
    {
      category: 'Financing & Escrow',
      prompt: 'What happens to the earnest money deposit if loan approval fails?',
    },
    {
      category: 'Remedies & Default',
      prompt: 'What specific remedies apply to both parties in the event of contractual default?',
    },
  ];

  const quickPrompts = [
    'What is the acceptance date?',
    'What are the inspection terms?',
    'When is loan commitment due?',
    'What happens if appraisal is low?',
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50/50 rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 select-none">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-700 to-indigo-600 text-white shadow-2xs">
            <IconSparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>Contract Intelligence Copilot</span>
              <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 text-[10px] font-semibold flex items-center gap-0.5">
                <IconShieldCheck className="h-3 w-3 text-emerald-600" />
                Grounded
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              {isIndexing ? (
                <span className="text-amber-600 flex items-center gap-1 font-medium">
                  <IconSpinner className="h-3 w-3 animate-spin" /> Indexing contract documents&hellip;
                </span>
              ) : (
                'Zero-hallucination citation-verified contract intelligence'
              )}
            </p>
          </div>
        </div>

        {/* Tab switch & actions */}
        <div className="flex items-center gap-1.5">
          <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-all text-[11px] ${
                activeTab === 'chat'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <IconChatBubbleLeftRight className="h-3.5 w-3.5" />
              <span>Chat Q&amp;A</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-all text-[11px] ${
                activeTab === 'summary'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <IconChartBar className="h-3.5 w-3.5" />
              <span>Deal Brief</span>
            </button>
          </div>

          {messages.length > 0 && activeTab === 'chat' && (
            <button
              type="button"
              onClick={onClear}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Reset conversation"
            >
              <IconArrowPath className="h-3.5 w-3.5" />
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
            {/* Empty State with Structured Category Starters */}
            {messages.length === 0 && (
              <div className="py-4 px-1 space-y-5">
                <div className="text-center space-y-1.5 max-w-sm mx-auto">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 mx-auto shadow-2xs ring-1 ring-brand-100">
                    <IconSparkles className="h-5 w-5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Legal Contract Intelligence
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Ask questions with full traceability to clauses, deadlines, remedies, and addenda.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {categorizedStarters.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={loading}
                      onClick={() => onAsk(item.prompt)}
                      className="group p-3 rounded-xl border border-slate-200 bg-white hover:border-brand-400 hover:bg-brand-50/40 text-left transition-all shadow-2xs cursor-pointer"
                    >
                      <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wide block mb-1">
                        {item.category}
                      </span>
                      <p className="text-xs text-slate-700 font-medium group-hover:text-slate-900 leading-snug">
                        {item.prompt}
                      </p>
                    </button>
                  ))}
                </div>

                {suggestions.length > 0 && (
                  <SuggestedQuestions
                    suggestions={suggestions}
                    onSelect={onAsk}
                    loading={loading}
                  />
                )}
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
              <div className="banner-error text-xs">
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
        <div className="bg-white border-t border-slate-200/90 shadow-2xs">
          {/* Quick Prompt Pill Strip */}
          {messages.length > 0 && (
            <div className="px-3 pt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onAsk(qp)}
                  disabled={loading}
                  className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 transition-colors disabled:opacity-40 cursor-pointer"
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
              placeholder="Ask about inspection period, earnest money, loan contingency, remedies..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-brand-500 focus:bg-white transition-all shadow-2xs"
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-primary flex items-center justify-center p-2.5 h-9 w-9 shrink-0 disabled:opacity-40 rounded-xl"
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

