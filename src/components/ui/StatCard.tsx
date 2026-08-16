import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: string; positive: boolean };
  variant?: 'default' | 'primary' | 'accent';
  className?: string;
}

const variants = {
  default: 'bg-surface',
  primary: 'bg-primary-600 text-white',
  accent: 'bg-accent-400 text-white',
};

const iconVariants = {
  default: 'bg-primary-50 text-primary-600',
  primary: 'bg-white/15 text-white',
  accent: 'bg-white/15 text-white',
};

export function StatCard({ label, value, icon, trend, variant = 'default', className }: StatCardProps) {
  return (
    <div className={cn('rounded-2xl border border-line p-5 shadow-card', variants[variant], className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className={cn('text-xs font-semibold uppercase tracking-wide', variant === 'default' ? 'text-muted' : 'text-white/70')}>
            {label}
          </p>
          <p className={cn('mt-2 font-display text-2xl font-bold', variant === 'default' ? 'text-ink' : 'text-white')}>
            {value}
          </p>
        </div>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', iconVariants[variant])}>
          {icon}
        </div>
      </div>
      {trend && (
        <p className={cn('mt-3 text-xs font-semibold', variant === 'default' ? (trend.positive ? 'text-success' : 'text-error') : 'text-white/80')}>
          {trend.positive ? '↑' : '↓'} {trend.value}
        </p>
      )}
    </div>
  );
}
