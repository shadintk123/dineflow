import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'outline';

interface BadgeProps {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  icon?: ReactNode;
}

const variants: Record<Variant, string> = {
  default: 'bg-ivory text-ink border border-line',
  primary: 'bg-primary-50 text-primary-700 border border-primary-100',
  accent: 'bg-accent-50 text-accent-600 border border-accent-100',
  success: 'bg-success/10 text-success border border-success/20',
  warning: 'bg-warning/10 text-warning border border-warning/20',
  error: 'bg-error/10 text-error border border-error/20',
  outline: 'bg-transparent text-ink border border-line',
};

export function Badge({ children, variant = 'default', className, icon }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        variants[variant],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}
