import React from 'react';
import { IconSparkles } from '../icons';

interface SuggestedQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
}

export function SuggestedQuestions({ questions, onSelect }: SuggestedQuestionsProps) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
        <IconSparkles className="h-3.5 w-3.5 text-brand-400" />
        <span>Suggested Contract Inquiries</span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {questions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(q)}
            className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-left text-xs text-slate-300 hover:border-brand-500/60 hover:bg-slate-800/60 transition-all shadow-sm"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
