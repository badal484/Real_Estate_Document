import { useState } from 'react';
import type { AssistantMessage, Citation } from '@/types';
import { CitationChip } from './CitationChip';
import {
  Sparkles,
  Check,
  Copy,
  Volume2,
  VolumeX,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '../ui/badge';

interface Props {
  message: AssistantMessage;
  onCitationClick?: (citation: Citation) => void;
  onFollowUpClick?: (question: string) => void;
  activeCitationId?: number | null;
}

function FormattedContent({
  content,
  onFootnoteClick,
}: {
  content: string;
  onFootnoteClick?: (num: number) => void;
}) {
  const paragraphs = content.split(/\n\n+/);

  return (
    <div className="text-xs leading-relaxed text-slate-800 space-y-2.5">
      {paragraphs.map((paragraph, pIdx) => {
        const lines = paragraph.split('\n');
        const isList = lines.length > 1 && lines.every((l) => /^\s*[-*•\d+.]\s+/.test(l));

        if (isList) {
          return (
            <ul key={pIdx} className="space-y-1.5 pl-2 list-none">
              {lines.map((line, lIdx) => {
                const cleanedLine = line.replace(/^\s*[-*•\d+.]\s+/, '');
                return (
                  <li key={lIdx} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-900 mt-1.5 shrink-0" />
                    <span>
                      <InlineFormattedText
                        text={cleanedLine}
                        onFootnoteClick={onFootnoteClick}
                      />
                    </span>
                  </li>
                );
              })}
            </ul>
          );
        }

        return (
          <p key={pIdx} className="leading-relaxed">
            <InlineFormattedText text={paragraph} onFootnoteClick={onFootnoteClick} />
          </p>
        );
      })}
    </div>
  );
}

function InlineFormattedText({
  text,
  onFootnoteClick,
}: {
  text: string;
  onFootnoteClick?: (num: number) => void;
}) {
  const parts = text.split(/(\[\^\d+\])/g);

  return (
    <>
      {parts.map((part, idx) => {
        const match = part.match(/^\[\^(\d+)\]$/);
        if (match) {
          const num = parseInt(match[1], 10);
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onFootnoteClick?.(num)}
              className="inline-flex items-center justify-center -translate-y-0.5 mx-0.5 h-4 min-w-[18px] px-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-900 font-mono text-[10px] font-bold transition-colors cursor-pointer"
              title={`View Citation [${num}]`}
            >
              {num}
            </button>
          );
        }

        const subParts = part.split(/(\*\*.*?\*\*)/g);
        return (
          <span key={idx}>
            {subParts.map((sub, sIdx) => {
              if (sub.startsWith('**') && sub.endsWith('**')) {
                return (
                  <strong key={sIdx} className="font-semibold text-slate-900">
                    {sub.slice(2, -2)}
                  </strong>
                );
              }
              return sub;
            })}
          </span>
        );
      })}
    </>
  );
}

export function MessageBubble({
  message,
  onCitationClick,
  onFollowUpClick,
  activeCitationId,
}: Props) {
  const isUser = message.role === 'user';
  const citations = (message.citations as Citation[]) || [];
  const followUps = (message.suggestedFollowUps as string[]) || [];

  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-md rounded-xl bg-slate-900 px-3.5 py-2 text-xs text-white shadow-xs">
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  const handleFootnoteClick = (citationId: number) => {
    const found = citations.find((c) => c.id === citationId);
    if (found && onCitationClick) {
      onCitationClick(found);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const plainText = message.content.replace(/\[\^\d+\]/g, '');
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.rate = 1.05;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex items-start gap-2.5">
      {/* Avatar */}
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white shadow-2xs">
        <Sparkles className="h-3.5 w-3.5" />
      </div>

      <div className="flex-1 space-y-2.5 min-w-0">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-3 relative">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5">
              <Badge variant="neutral" className="text-[10px] px-1.5 py-0">
                <ShieldCheck className="h-2.5 w-2.5 text-emerald-600 mr-0.5" />
                Contract Grounded
              </Badge>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleSpeak}
                className={`p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ${
                  speaking ? 'text-slate-900 bg-slate-100' : ''
                }`}
                title={speaking ? 'Stop speech' : 'Read aloud'}
              >
                {speaking ? <VolumeX className="h-3.5 w-3.5 text-rose-600" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Copy text"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Formatted Content */}
          <FormattedContent content={message.content} onFootnoteClick={handleFootnoteClick} />

          {/* Citations */}
          {citations.length > 0 && (
            <div className="border-t border-slate-100 pt-2.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  Contract Citations ({citations.length})
                </span>
                <span className="text-[10px] text-slate-400">Click to jump in PDF</span>
              </div>

              <div className="grid grid-cols-1 gap-1.5 pt-0.5">
                {citations.map((citation) => (
                  <CitationChip
                    key={citation.id}
                    citation={citation}
                    onClick={onCitationClick}
                    isActive={activeCitationId === citation.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Legal Footer */}
          <div className="border-t border-slate-100 pt-1.5 text-[10px] text-slate-400 italic">
            Automated legal AI assistance. Confirm terms with broker or transaction coordinator.
          </div>
        </div>

        {/* Suggested Follow-Ups */}
        {followUps.length > 0 && (
          <div className="space-y-1 pl-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Suggested Follow-ups
            </span>
            <div className="flex flex-wrap gap-1.5">
              {followUps.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onFollowUpClick?.(q)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 shadow-2xs hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <span>{q}</span>
                  <ArrowRight className="h-3 w-3 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
