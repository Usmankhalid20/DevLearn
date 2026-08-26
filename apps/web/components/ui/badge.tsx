import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-white',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-white text-black font-semibold',
        secondary: 'border-border bg-surface-elevated text-foreground-secondary',
        outline: 'border-border text-foreground',
        destructive: 'border-transparent bg-state-error text-white',
        success: 'border-transparent bg-state-success text-black font-semibold',
        warning: 'border-transparent bg-state-warning text-black font-semibold',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
