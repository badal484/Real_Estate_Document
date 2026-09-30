import React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'needs-review';
}

export function badgeVariants({
  variant = 'default',
  className = '',
}: {
  variant?: BadgeProps['variant'];
  className?: string;
} = {}) {
  const baseStyles =
    'inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium transition-colors select-none';

  const variants = {
    default: 'bg-primary text-white',
    secondary: 'bg-secondary text-primary-text border border-border',
    outline: 'border border-border text-secondary-text bg-surface',
    destructive: 'bg-danger-light text-danger border border-danger-border',
    danger: 'bg-danger-light text-danger border border-danger-border',
    success: 'bg-success-light text-success border border-success-border',
    warning: 'bg-warning-light text-warning border border-warning-border',
    'needs-review': 'bg-warning-light text-warning border border-warning-border font-semibold',
    info: 'bg-info-light text-info border border-info-border',
    neutral: 'bg-secondary text-secondary-text border border-border',
  };

  return cn(baseStyles, variants[variant], className);
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return <div className={badgeVariants({ variant, className })} {...props} />;
}
