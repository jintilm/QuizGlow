import { cn } from '@/lib/utils';
import { forwardRef, type HTMLAttributes } from 'react';

type GlassCardVariant = 'default' | 'elevated' | 'subtle' | 'dark';
type GlassCardSize = 'sm' | 'md' | 'lg' | 'xl';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: GlassCardVariant;
  size?: GlassCardSize;
  hoverable?: boolean;
  glow?: boolean;
}

const variantStyles: Record<GlassCardVariant, string> = {
  default:
    'bg-white border border-border shadow-sm',
  elevated:
    'bg-white border border-border shadow-md',
  subtle:
    'bg-white/70 border border-border/60 shadow-xs',
  dark:
    'bg-[#2D2D2D] text-white border border-white/10 shadow-2xl',
};

const sizeStyles: Record<GlassCardSize, string> = {
  sm: 'p-4 rounded-[1.25rem]',
  md: 'p-6 rounded-[1.5rem]',
  lg: 'p-8 rounded-[1.75rem]',
  xl: 'p-9 rounded-[2rem]',
};

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      hoverable = false,
      glow = false,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden transition-all duration-300 ease-out',
          variantStyles[variant],
          sizeStyles[size],
          hoverable &&
            'hover:-translate-y-1 hover:shadow-md active:translate-y-0',
          glow &&
            'before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/10 before:via-transparent before:to-chart-3/5 before:pointer-events-none before:opacity-60',
          className,
        )}
        {...props}
      >
        {glow && (
          <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-primary/20 blur-[60px]" />
        )}
        <div className="relative z-10">{children}</div>
      </div>
    );
  },
);

GlassCard.displayName = 'GlassCard';

export default GlassCard;
