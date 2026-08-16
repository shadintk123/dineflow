import { type ReactNode, useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type RevealVariant = 'fade-up' | 'fade-scale' | 'fade-left' | 'fade-right' | 'fade' | 'clip-up';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: RevealVariant;
  threshold?: number;
  as?: keyof JSX.IntrinsicElements;
}

const variantClasses: Record<RevealVariant, { hidden: string; visible: string }> = {
  'fade-up': { hidden: 'opacity-0 translate-y-8', visible: 'opacity-100 translate-y-0' },
  'fade-scale': { hidden: 'opacity-0 scale-[0.96]', visible: 'opacity-100 scale-100' },
  'fade-left': { hidden: 'opacity-0 translate-x-8', visible: 'opacity-100 translate-x-0' },
  'fade-right': { hidden: 'opacity-0 -translate-x-8', visible: 'opacity-100 translate-x-0' },
  'fade': { hidden: 'opacity-0', visible: 'opacity-100' },
  'clip-up': { hidden: 'opacity-0 [clip-path:inset(100%_0_0_0)]', visible: 'opacity-100 [clip-path:inset(0%_0_0_0)]' },
};

export function ScrollReveal({ children, className, delay = 0, variant = 'fade-up', threshold = 0.12, as = 'div' }: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const Tag = as as any;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const v = variantClasses[variant];

  return (
    <Tag
      ref={ref as any}
      className={cn(
        'transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform opacity-100',
        visible ? v.visible : v.hidden,
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

interface ParallaxProps {
  children: ReactNode;
  className?: string;
  speed?: number;
}

export function Parallax({ children, className, speed = 0.3 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    const isMobile = window.innerWidth < 768;
    const effectiveSpeed = isMobile ? speed * 0.4 : speed;
    let rafId = 0;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        if (rect.bottom > 0 && rect.top < windowHeight) {
          const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
          setOffset(progress * effectiveSpeed * 100);
        }
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [speed]);

  return (
    <div
      ref={ref}
      className={cn('will-change-transform', className)}
      style={{ transform: `translate3d(0, ${offset}px, 0)` }}
    >
      {children}
    </div>
  );
}
