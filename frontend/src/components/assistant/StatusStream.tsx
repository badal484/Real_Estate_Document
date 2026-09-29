import React from 'react';
import { IconSpinner, IconSparkles } from '../icons';

interface StatusStreamProps {
  statusMessage?: string | null;
}

export function StatusStream({ statusMessage }: StatusStreamProps) {
  if (!statusMessage) return null;

  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-brand-500/30 bg-brand-500/10 px-4 py-2.5 text-xs text-brand-300 animate-pulse">
      <IconSpinner className="h-4 w-4 animate-spin text-brand-400 shrink-0" />
      <span className="font-medium">{statusMessage}</span>
    </div>
  );
}
