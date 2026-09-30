import React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'info' | 'neutral';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const base =
    'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium tracking-tight transition-colors select-none';

  const variants = {
    default: 'border border-transparent bg-slate-900 text-white',
    secondary: 'border border-transparent bg-slate-100 text-slate-800',
    outline: 'border border-slate-200 text-slate-700 bg-white',
    destructive: 'border border-rose-200 bg-rose-50 text-rose-800',
    success: 'border border-emerald-200 bg-emerald-50 text-emerald-800',
    warning: 'border border-amber-200 bg-amber-50 text-amber-800',
    info: 'border border-blue-200 bg-blue-50 text-blue-800',
    neutral: 'border border-slate-200 bg-slate-50 text-slate-600',
  };

  return <div className={cn(base, variants[variant], className)} {...props} />;
}
