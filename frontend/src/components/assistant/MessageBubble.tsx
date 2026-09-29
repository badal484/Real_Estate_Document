import { useState } from 'react';
import type { AssistantMessage, Citation } from '@/types';
import { CitationChip } from './CitationChip';
import {
  IconSparkles,
  IconCheck,
  IconClipboard,
  IconSpeakerWave,
  IconCheckCircle,
} from '../icons';

interface Props {
  message: AssistantMessage;
  onCitationClick?: (citation: Citation) => void;
  onFollowUpClick?: (question: string) => void;
  activeCitationId?: number | null;
}

/**
 * Parses markdown text safely and converts footnote references [^n] to clickable buttons.
 */
function FormattedContent({
  content,
  onFootnoteClick,
}: {
  content: string;
  onFootnoteClick?: (num: number) => void;
}) {
  // Split content by paragraphs or double newlines to render structured blocks
  const paragraphs = content.split(/\n\n+/);

  return (
    <div className="text-xs leading-relaxed text-slate-800 space-y-2.5">
      {paragraphs.map((paragraph, pIdx) => {
        // Handle list lines starting with - or * or numbers
        const lines = paragraph.split('\n');
        const isList = lines.length > 1 && lines.every((l) => /^\s*[-*•\d+.]\s+/.test(l));

        if (isList) {
          return (
            <ul key={pIdx} className="space-y-1.5 pl-2 list-none">
              {lines.map((line, lIdx) => {
                const cleanedLine = line.replace(/^\s*[-*•\d+.]\s+/, '');
                return (
                  <li key={lIdx} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-600 mt-1.5 shrink-0" />
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
  // Split text by footnote references [^1], [^2], etc.
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
              className="inline-flex items-center justify-center -translate-y-0.5 mx-0.5 h-4 min-w-[18px] px-1 rounded-full bg-brand-100 hover:bg-brand-200 text-brand-800 font-mono text-[10px] font-bold shadow-2xs transition-colors cursor-pointer"
              title={`View Reference [${num}]`}
            >
              {num}
            </button>
          );
        }

        // Bold **text** parser
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
        <div className="max-w-md rounded-2xl bg-brand-600 px-4 py-2.5 text-xs text-white shadow-xs">
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
    <div className="flex items-start gap-3">
      {/* AI Assistant Avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-2xs">
        <IconSparkles className="h-4 w-4" />
      </div>

      <div className="flex-1 space-y-3 min-w-0">
        {/* Main Response Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3.5 relative">
          {/* Top Metadata Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100">
                <IconCheckCircle className="h-3 w-3 text-brand-600" />
                Contract Grounded
              </span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleSpeak}
                className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ${
                  speaking ? 'text-brand-600 bg-brand-50 ring-1 ring-brand-200' : ''
                }`}
                title={speaking ? 'Stop speech' : 'Listen to answer (Text-to-Speech)'}
              >
                <IconSpeakerWave className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Copy response"
              >
                {copied ? (
                  <IconCheck className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <IconClipboard className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Formatted Answer Body */}
          <FormattedContent
            content={message.content}
            onFootnoteClick={handleFootnoteClick}
          />

          {/* Verified Citations List */}
          {citations.length > 0 && (
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                  Verified Contract References ({citations.length})
                </span>
                <span className="text-[10px] text-slate-400">Click to jump in PDF</span>
              </div>

              <div className="grid grid-cols-1 gap-2 pt-0.5">
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

          {/* Legal Advisory Footer */}
          <div className="border-t border-slate-100 pt-2 text-[10px] text-slate-400 italic">
            Informational assistance only. Contractual obligations should be verified with your broker or legal counsel.
          </div>
        </div>

        {/* Suggested Follow-Up Action Chips */}
        {followUps.length > 0 && (
          <div className="space-y-1.5 pl-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
              Suggested Follow-ups
            </span>
            <div className="flex flex-wrap gap-1.5">
              {followUps.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onFollowUpClick?.(q)}
                  className="rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-2xs hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800 transition-all flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <span>{q}</span>
                  <span className="text-brand-600 font-semibold">&rarr;</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

