import React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'info' | 'neutral' | 'gold';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const base =
    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-normal transition-colors select-none';

  const variants = {
    default: 'border border-neutral-200 bg-neutral-100 text-neutral-800',
    gold: 'border border-amber-200 bg-amber-50 text-amber-800',
    secondary: 'border border-neutral-200/60 bg-neutral-50 text-neutral-600',
    outline: 'border border-neutral-300 text-neutral-800 bg-white shadow-clean-xs',
    destructive: 'border border-rose-200 bg-rose-50 text-rose-700',
    success: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
    warning: 'border border-amber-200 bg-amber-50 text-amber-800',
    info: 'border border-sky-200 bg-sky-50 text-sky-700',
    neutral: 'border border-neutral-200 bg-neutral-100 text-neutral-600',
  };

  return (
    <div className={cn(base, variants[variant], className)} {...props}>
      {children}
    </div>
  );
}
