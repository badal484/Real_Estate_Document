import React from 'react';
import type { AssistantMessage, Citation } from '@/types';
import { CitationChip, CitationList } from './CitationChip';
import { IconSparkles, IconUser, IconShieldCheck, IconExclamationTriangle } from '../icons';

interface MessageBubbleProps {
  message: AssistantMessage;
  onSelectCitation?: (citation: Citation) => void;
  onSelectFollowUp?: (question: string) => void;
}

export function MessageBubble({ message, onSelectCitation, onSelectFollowUp }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="flex gap-3 max-w-xl">
          <div className="rounded-2xl bg-brand-600 px-4 py-3 text-xs text-white shadow-md">
            <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-300">
            <IconUser className="h-4 w-4" />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-6">
      <div className="flex gap-3 max-w-2xl w-full">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-600/20 text-brand-400 border border-brand-500/30">
          <IconSparkles className="h-4 w-4" />
        </span>

        <div className="flex-1 space-y-3">
          {/* Main Bubble */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-xs text-slate-200 shadow-xl space-y-3">
            {/* Status & Override Badges */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
              <span className="badge-emerald text-[10px]">
                <IconShieldCheck className="h-3 w-3" />
                Verified Context
              </span>

              {message.confidence && message.confidence < 0.8 && (
                <span className="badge-amber text-[10px]">
                  <IconExclamationTriangle className="h-3 w-3" />
                  Low Confidence
                </span>
              )}

              {message.overrides && message.overrides.length > 0 && (
                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                  Overridden by Addendum
                </span>
              )}
            </div>

            {/* Answer Content */}
            <div className="prose prose-invert text-xs leading-relaxed text-slate-200 whitespace-pre-wrap">
              {message.content}
            </div>

            {/* Citations List */}
            {message.citations && message.citations.length > 0 && (
              <CitationList citations={message.citations} onSelectCitation={onSelectCitation} />
            )}

            {/* Legal Advice Disclaimer */}
            <p className="text-[10px] text-slate-500 border-t border-slate-800/80 pt-2 italic">
              Informational date tracking support only — does not constitute legal advice.
            </p>
          </div>

          {/* Suggested Follow-Ups */}
          {message.suggestedFollowUps && message.suggestedFollowUps.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {message.suggestedFollowUps.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectFollowUp?.(q)}
                  className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-[11px] text-slate-400 hover:border-brand-500/50 hover:text-brand-300 transition-all text-left"
                >
                  &rarr; {q}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
