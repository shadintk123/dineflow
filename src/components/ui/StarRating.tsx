import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  count?: number;
  className?: string;
}

export function StarRating({ rating, size = 'sm', showValue, count, className }: StarRatingProps) {
  const sizes = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-5 w-5' };
  const text = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      <Star className={cn(sizes[size], 'fill-accent-400 text-accent-400')} />
      {showValue && <span className={cn('font-bold text-ink', text[size])}>{rating.toFixed(1)}</span>}
      {count !== undefined && <span className={cn('text-muted', text[size])}>({count})</span>}
    </div>
  );
}
