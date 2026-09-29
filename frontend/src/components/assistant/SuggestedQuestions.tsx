import { IconSparkles, IconDocumentText } from '../icons';

interface Props {
  suggestions: string[];
  onSelect: (question: string) => void;
  loading?: boolean;
}

export function SuggestedQuestions({ suggestions, onSelect, loading = false }: Props) {
  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
        <IconSparkles className="h-3.5 w-3.5 text-brand-600" />
        <span>Frequently Asked Deal Questions</span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {suggestions.map((question, idx) => (
          <button
            key={idx}
            type="button"
            disabled={loading}
            onClick={() => onSelect(question)}
            className="group flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 text-left text-xs font-medium text-slate-700 shadow-2xs hover:border-brand-400 hover:bg-brand-50/50 hover:text-brand-900 transition-all disabled:opacity-50 cursor-pointer"
          >
            <span className="flex-1 leading-snug">{question}</span>
            <span className="text-slate-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all shrink-0">
              &rarr;
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

