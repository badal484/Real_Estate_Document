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
  FileCheck,
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
    } catch {
      setIsListening(false);
    }
  };

  const isIndexing = indexStatus?.status === 'INDEXING';

  const categorizedStarters = [
    {
      category: 'Timeline & Deadlines',
      icon: FileCheck,
      prompt: 'What are the exact calendar deadlines for inspection, appraisal, and loan commitment?',
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
    <div className="flex flex-col h-full bg-surface rounded-lg border border-border shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-surface border-b border-border select-none">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white shadow-2xs">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-primary-text">
                AI Contract Copilot
              </h3>
              <Badge variant="neutral" className="text-[10px] px-1 py-0">
                <ShieldCheck className="h-2.5 w-2.5 text-success mr-0.5" />
                Verified Grounding
              </Badge>
            </div>
            <p className="text-[10px] text-secondary-text">
              {isIndexing ? (
                <span className="text-warning flex items-center gap-1 font-medium">
                  <Loader2 className="h-2.5 w-2.5 animate-spin" /> Indexing contract documents&hellip;
                </span>
              ) : (
                'Contract-verified Q&A with exact PDF source citations'
              )}
            </p>
          </div>
        </div>

        {/* Tab switch & actions */}
        <div className="flex items-center gap-1.5">
          <div className="flex rounded-md bg-secondary p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1 rounded px-2 py-0.5 transition-all text-[11px] ${
                activeTab === 'chat'
                  ? 'bg-surface text-primary-text shadow-2xs font-semibold'
                  : 'text-secondary-text hover:text-primary-text'
              }`}
            >
              <MessageSquare className="h-3 w-3" />
              <span>Q&amp;A Chat</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-1 rounded px-2 py-0.5 transition-all text-[11px] ${
                activeTab === 'summary'
                  ? 'bg-surface text-primary-text shadow-2xs font-semibold'
                  : 'text-secondary-text hover:text-primary-text'
              }`}
            >
              <BarChart3 className="h-3 w-3" />
              <span>Deal Brief</span>
            </button>
          </div>

          {messages.length > 0 && activeTab === 'chat' && (
            <button
              type="button"
              onClick={onClear}
              className="p-1 rounded-md text-secondary-text hover:text-primary-text hover:bg-secondary transition-colors"
              title="Reset conversation"
            >
              <RotateCcw className="h-3.5 w-3.5" />
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
            {/* Empty State */}
            {messages.length === 0 && (
              <div className="py-2 px-1 space-y-4">
                <div className="text-center space-y-1 max-w-sm mx-auto">
                  <div className="flex h-8.5 w-8.5 items-center justify-center rounded-md bg-secondary text-primary mx-auto mb-1">
                    <Sparkles className="h-4 w-4 text-accent" />
                  </div>
                  <h4 className="text-xs font-semibold text-primary-text">
                    Transaction Intelligence Assistant
                  </h4>
                  <p className="text-[11px] text-secondary-text leading-relaxed">
                    Ask questions with full traceability to clauses, deadlines, remedies, and addenda.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {categorizedStarters.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={loading}
                        onClick={() => onAsk(item.prompt)}
                        className="group p-2.5 rounded-md border border-border bg-surface hover:border-accent/40 hover:bg-secondary/40 text-left transition-all shadow-2xs cursor-pointer"
                      >
                        <div className="flex items-center gap-1 text-[10px] font-bold text-secondary-text uppercase tracking-wide mb-1">
                          <Icon className="h-3 w-3 text-secondary-text" />
                          <span>{item.category}</span>
                        </div>
                        <p className="text-[11px] text-primary-text font-medium group-hover:text-primary leading-snug">
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
              <div className="banner-error text-xs">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Box (Chat Tab only) */}
      {activeTab === 'chat' && (
        <div className="bg-surface border-t border-border p-2.5 space-y-2">
          {/* Quick Prompt Pill Strip */}
          {messages.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onAsk(qp)}
                  disabled={loading}
                  className="shrink-0 rounded-full border border-border bg-secondary/50 px-2 py-0.5 text-[10px] text-secondary-text hover:border-secondary-text hover:bg-secondary hover:text-primary-text transition-colors disabled:opacity-40 cursor-pointer"
                >
                  {qp}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-1.5 rounded-md border transition-all ${
                isListening
                  ? 'bg-danger text-white border-danger animate-pulse'
                  : 'bg-secondary hover:bg-secondary text-secondary-text border-border'
              }`}
              title={isListening ? 'Listening... click to stop' : 'Voice dictation'}
            >
              <Mic className="h-3.5 w-3.5" />
            </button>

            <input
              type="text"
              placeholder="Ask about inspection period, earnest money, loan contingency, remedies..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-surface border border-border rounded-md px-3 py-1.5 text-xs text-primary-text placeholder:text-secondary-text/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-2xs"
            />

            <Button
              type="submit"
              disabled={loading || !input.trim()}
              size="sm"
              variant="default"
              className="shrink-0 h-7.5 px-3 font-semibold"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
