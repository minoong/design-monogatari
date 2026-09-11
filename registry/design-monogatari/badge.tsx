import { cva, type VariantProps } from 'class-variance-authority';
import { type HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 font-sans text-xs font-semibold',
  {
    variants: {
      variant: {
        default: 'bg-foreground text-background border-transparent',
        secondary: 'border-border bg-muted text-foreground',
        destructive: 'border-destructive text-destructive bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
