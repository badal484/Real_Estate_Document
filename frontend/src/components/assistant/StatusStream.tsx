import { IconSpinner, IconMagnifyingGlass, IconSparkles, IconCheckCircle } from '../icons';

interface Props {
  stage: 'retrieving' | 'reasoning' | 'verifying' | null;
  message?: string;
}

export function StatusStream({ stage, message }: Props) {
  if (!stage) return null;

  return (
    <div className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card shadow-xs animate-pulse">
      {stage === 'retrieving' ? (
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-info/10 text-info border border-info/20">
          <IconMagnifyingGlass className="h-4 w-4 animate-bounce" />
        </div>
      ) : stage === 'reasoning' ? (
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
          <IconSparkles className="h-4 w-4 animate-spin" />
        </div>
      ) : (
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-success/10 text-success border border-success/20">
          <IconCheckCircle className="h-4 w-4" />
        </div>
      )}

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground capitalize">
            {stage === 'retrieving'
              ? '1. Retrieving Relevant Clauses & Addenda'
              : stage === 'reasoning'
              ? '2. Checking Precedence & Analyzing Deadlines'
              : '3. Verifying Verbatim Quotes Server-Side'}
          </span>
          <IconSpinner className="h-3 w-3 animate-spin text-primary" />
        </div>
        {message && <p className="text-[11px] text-muted-foreground mt-0.5">{message}</p>}
      </div>
    </div>
  );
}
