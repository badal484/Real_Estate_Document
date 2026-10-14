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
    <div className="text-xs leading-relaxed text-[#09090B] space-y-2.5">
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
                    <span className="h-1.5 w-1.5 rounded-full bg-[#09090B] mt-1.5 shrink-0" />
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
              className="inline-flex items-center justify-center -translate-y-0.5 mx-0.5 h-4.5 min-w-[20px] px-1.5 rounded-full bg-[#F4F4F5] hover:bg-white border border-[#E4E4E7] text-[#09090B] font-mono text-[10px] font-semibold transition-all shadow-clean-xs cursor-pointer active:scale-95"
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
                  <strong key={sIdx} className="font-semibold text-[#09090B]">
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
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const isUser = message.role === 'user';
  const citations = message.citations || [];
  const followUps = message.suggestedFollowUps || [];

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-md rounded-2xl rounded-tr-xs bg-[#09090B] px-4 py-2.5 text-xs text-white font-normal shadow-clean-xs">
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
      {/* Avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-[#F4F4F5] text-[#09090B] border border-[#E4E4E7]">
        <Sparkles className="h-4 w-4 text-amber-500" />
      </div>

      <div className="flex-1 space-y-2.5 min-w-0">
        <div className="rounded-2xl rounded-tl-xs border border-[#E4E4E7] bg-white p-4 shadow-clean-sm space-y-3 relative">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-2.5">
            <div className="flex items-center gap-2">
              <Badge variant="success" className="text-[10px] px-2 py-0.5 rounded-full">
                <ShieldCheck className="h-3 w-3 text-emerald-600 mr-1" />
                Contract Grounded
              </Badge>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSpeak}
                className={`p-1.5 rounded-full text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5] transition-colors cursor-pointer ${
                  speaking ? 'text-rose-600 bg-rose-50' : ''
                }`}
                title={speaking ? 'Stop speech' : 'Read aloud'}
              >
                {speaking ? <VolumeX className="h-3.5 w-3.5 text-rose-500" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-full text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
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
            <div className="border-t border-[#E4E4E7] pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wider">
                  Contract Citations ({citations.length})
                </span>
                <span className="text-[10px] text-[#A1A1AA]">Click to jump in PDF</span>
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

          {/* Legal Footer */}
          <div className="border-t border-[#E4E4E7] pt-2 text-[10px] text-[#A1A1AA] italic">
            Automated legal AI assistance. Confirm terms with broker or transaction coordinator.
          </div>
        </div>

        {/* Suggested Follow-Ups */}
        {followUps.length > 0 && (
          <div className="space-y-1.5 pl-1">
            <span className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wider">
              Suggested Follow-ups
            </span>
            <div className="flex flex-wrap gap-1.5">
              {followUps.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onFollowUpClick?.(q)}
                  className="rounded-full border border-[#E4E4E7] bg-white px-3 py-1 text-xs text-[#09090B] hover:bg-[#F4F4F5] hover:border-[#D4D4D8] transition-all flex items-center gap-1.5 cursor-pointer text-left shadow-clean-xs active:scale-95"
                >
                  <span>{q}</span>
                  <ArrowRight className="h-3 w-3 text-[#A1A1AA]" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
