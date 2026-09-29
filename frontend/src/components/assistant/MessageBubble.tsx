import type { AssistantMessage, Citation } from '@/types';
import { CitationChip } from './CitationChip';
import { IconSparkles, IconCheckCircle, IconExclamationTriangle } from '../icons';

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
  // Split content by footnote references [^1], [^2], etc.
  const parts = content.split(/(\[\^\d+\])/g);

  return (
    <div className="prose prose-slate prose-sm max-w-none text-xs leading-relaxed text-slate-800 space-y-2">
      {parts.map((part, idx) => {
        const match = part.match(/^\[\^(\d+)\]$/);
        if (match) {
          const num = parseInt(match[1], 10);
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onFootnoteClick?.(num)}
              className="inline-flex items-center justify-center -translate-y-1 mx-0.5 h-4 min-w-[16px] px-1 rounded-full bg-brand-100 hover:bg-brand-200 text-brand-800 font-mono text-[10px] font-bold shadow-xs transition-colors"
              title={`View Reference [${num}]`}
            >
              {num}
            </button>
          );
        }

        // Basic formatting: bold **text** and bullet points
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
    </div>
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

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-md rounded-2xl bg-brand-600 px-4 py-2.5 text-xs text-white shadow-sm">
          <p className="whitespace-pre-wrap">{message.content}</p>
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

  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-sm">
        <IconSparkles className="h-4 w-4" />
      </div>

      <div className="flex-1 space-y-4">
        {/* Main Answer Bubble */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-3">
          <FormattedContent
            content={message.content}
            onFootnoteClick={handleFootnoteClick}
          />

          {/* Citations Grid */}
          {citations.length > 0 && (
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-700">
                  Verified Contract References ({citations.length}):
                </span>
                <span className="text-[10px] text-slate-400">Click to jump in PDF</span>
              </div>

              <div className="grid grid-cols-1 gap-2 pt-1">
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

          {/* Legal Disclaimer Footer */}
          <div className="border-t border-slate-100 pt-2 text-[10px] text-slate-400 italic">
            Informational assistance only. Contractual obligations should be verified with your broker or legal counsel.
          </div>
        </div>

        {/* Suggested Follow-Up Questions */}
        {followUps.length > 0 && (
          <div className="space-y-1.5 pl-1">
            <span className="text-[11px] font-medium text-slate-500">Suggested Follow-ups:</span>
            <div className="flex flex-wrap gap-1.5">
              {followUps.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onFollowUpClick?.(q)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-700 shadow-xs hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800 transition-colors"
                >
                  {q} &rarr;
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
