import { IconSparkles } from '../icons';

interface Props {
  suggestions: string[];
  onSelect: (question: string) => void;
  loading?: boolean;
}

export function SuggestedQuestions({ suggestions, onSelect, loading = false }: Props) {
  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
        <IconSparkles className="h-3.5 w-3.5 text-purple-600" />
        <span>Frequently Asked Deal Questions</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((question, idx) => (
          <button
            key={idx}
            type="button"
            disabled={loading}
            onClick={() => onSelect(question)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium text-slate-700 shadow-xs hover:border-brand-400 hover:bg-brand-50/70 hover:text-brand-900 transition-all disabled:opacity-50"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
