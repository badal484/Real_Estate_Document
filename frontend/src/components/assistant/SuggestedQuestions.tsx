import { Sparkles, ArrowRight } from 'lucide-react';

interface Props {
  suggestions: string[];
  onSelect: (question: string) => void;
  loading?: boolean;
}

export function SuggestedQuestions({ suggestions, onSelect, loading = false }: Props) {
  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
        <Sparkles className="h-3.5 w-3.5 text-slate-600" />
        <span>Context-Aware Suggestions</span>
      </div>

      <div className="grid grid-cols-1 gap-1.5">
        {suggestions.map((question, idx) => (
          <button
            key={idx}
            type="button"
            disabled={loading}
            onClick={() => onSelect(question)}
            className="group flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-2.5 text-left text-xs font-medium text-slate-700 shadow-2xs hover:border-slate-300 hover:bg-slate-50 transition-all disabled:opacity-50 cursor-pointer"
          >
            <span className="flex-1 leading-snug">{question}</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
