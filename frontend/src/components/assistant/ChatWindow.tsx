import { useState, useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { StatusStream } from './StatusStream';
import { SuggestedQuestions } from './SuggestedQuestions';
import { SummaryPanel } from './SummaryPanel';
import {
  Sparkles,
  Send,
  Loader2,
  RotateCcw,
  AlertTriangle,
  Mic,
  ShieldCheck,
  MessageSquare,
  BarChart3,
  Scale,
  Building,
  DollarSign,
} from 'lucide-react';
import type {
  AssistantMessage,
  Citation,
  DealSummaryResponse,
  IndexStatusResponse,
} from '@/types';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

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
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  const isIndexing = indexStatus && indexStatus.status !== 'READY';

  const categorizedStarters = [
    {
      category: 'Deadlines & Timing',
      icon: Sparkles,
      prompt: 'Summarize all binding contractual deadlines and notice cure periods.',
    },
    {
      category: 'Inspection & Access',
      icon: Building,
      prompt: 'What are the buyer inspection rights, access limitations, and repair notice obligations?',
    },
    {
      category: 'Financing & Deposit',
      icon: DollarSign,
      prompt: 'What happens to the earnest money deposit if loan approval fails?',
    },
    {
      category: 'Remedies & Default',
      icon: Scale,
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
    <div className="flex flex-col h-full bg-white border border-[#E4E4E7] rounded-3xl overflow-hidden shadow-clean-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E4E7] select-none bg-white">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#F4F4F5] text-[#09090B] border border-[#E4E4E7]">
            <Sparkles className="h-4.5 w-4.5 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#09090B]">
                AI Legal Copilot
              </h3>
              <Badge variant="success" className="text-[10px] px-2 py-0.5 rounded-full">
                <ShieldCheck className="h-3 w-3 text-emerald-600 mr-1" />
                Verified
              </Badge>
            </div>
            <p className="text-[11px] text-[#71717A]">
              {isIndexing ? (
                <span className="text-[#09090B] flex items-center gap-1 font-medium">
                  <Loader2 className="h-3 w-3 animate-spin text-[#09090B]" /> Indexing documents&hellip;
                </span>
              ) : (
                'Contract-verified Q&A with exact PDF source citations'
              )}
            </p>
          </div>
        </div>

        {/* Tab switch & actions */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-full bg-[#F4F4F5] border border-[#E4E4E7] p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 transition-all text-xs ${
                activeTab === 'chat'
                  ? 'bg-white text-[#09090B] font-semibold shadow-xs'
                  : 'text-[#71717A] hover:text-[#09090B]'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Q&amp;A Chat</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 transition-all text-xs ${
                activeTab === 'summary'
                  ? 'bg-white text-[#09090B] font-semibold shadow-xs'
                  : 'text-[#71717A] hover:text-[#09090B]'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Deal Brief</span>
            </button>
          </div>

          {messages.length > 0 && activeTab === 'chat' && (
            <button
              type="button"
              onClick={onClear}
              className="p-2 rounded-full border border-[#E4E4E7] bg-white text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
              title="Reset conversation"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F9FAFB]/50">
        {activeTab === 'summary' ? (
          <SummaryPanel summary={summary} loading={loading && !summary} />
        ) : (
          <>
            {/* Empty State */}
            {messages.length === 0 && (
              <div className="py-2 px-1 space-y-5">
                <div className="text-center space-y-1.5 max-w-sm mx-auto">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F4F4F5] text-[#09090B] border border-[#E4E4E7] mx-auto">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                  </div>
                  <h4 className="text-sm font-semibold text-[#09090B] tracking-tight">
                    Transaction Intelligence Assistant
                  </h4>
                  <p className="text-xs text-[#71717A] leading-relaxed">
                    Ask questions with full traceability to clauses, deadlines, remedies, and addenda.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categorizedStarters.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={loading}
                        onClick={() => onAsk(item.prompt)}
                        className="group p-3.5 rounded-2xl bg-white border border-[#E4E4E7] hover:border-[#A1A1AA] text-left transition-all cursor-pointer shadow-clean-xs active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#09090B] uppercase tracking-wide mb-1">
                          <Icon className="h-3.5 w-3.5 text-amber-500" />
                          <span>{item.category}</span>
                        </div>
                        <p className="text-xs text-[#71717A] font-medium group-hover:text-[#09090B] leading-snug">
                          {item.prompt}
                        </p>
                      </button>
                    );
                  })}
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
              <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Box (Chat Tab only) */}
      {activeTab === 'chat' && (
        <div className="border-t border-[#E4E4E7] p-4 space-y-2.5 bg-white">
          {/* Quick Prompt Pill Strip */}
          {messages.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onAsk(qp)}
                  disabled={loading}
                  className="shrink-0 rounded-full border border-[#E4E4E7] bg-[#F4F4F5] hover:bg-white hover:border-[#D4D4D8] px-3 py-1 text-xs text-[#71717A] hover:text-[#09090B] transition-all disabled:opacity-40 cursor-pointer shadow-clean-xs active:scale-95"
                >
                  {qp}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-2.5 rounded-full border transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-600 ring-2 ring-rose-400 animate-pulse'
                  : 'bg-[#F4F4F5] border-[#E4E4E7] text-[#71717A] hover:text-[#09090B] hover:bg-white'
              }`}
              title={isListening ? 'Listening... click to stop' : 'Voice dictation'}
            >
              <Mic className="h-4 w-4" />
            </button>

            <input
              type="text"
              placeholder="Ask about inspection period, earnest money, loan contingency, remedies..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-[#F4F4F5] border border-[#E4E4E7] rounded-full px-4 py-2.5 text-xs text-[#09090B] placeholder-[#71717A] focus:border-[#09090B] focus:bg-white focus:outline-none transition-all shadow-clean-xs"
            />

            <Button
              type="submit"
              disabled={loading || !input.trim()}
              size="sm"
              variant="default"
              className="shrink-0 h-9 px-4 rounded-full bg-[#09090B] hover:bg-black text-white font-medium"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
