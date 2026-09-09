'use client';

import { type ReactNode } from 'react';
import * as motion from 'motion/react-client';
import { useReducedMotion } from 'motion/react';

import { cn } from '@/lib/utils';

interface ButtonProps {
  children: ReactNode;
  className?: string;
  appName: string;
  variant?: 'primary' | 'secondary';
}

const baseClasses =
  'inline-flex h-12 cursor-pointer appearance-none items-center justify-center rounded-pill border border-transparent px-5 font-sans text-base leading-5 font-medium max-[600px]:h-10 max-[600px]:px-4 max-[600px]:text-sm';

const variantClasses = {
  primary:
    'gap-2 bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:ring-ring focus-visible:ring-2 max-[600px]:gap-2',
  secondary:
    'min-w-45 border-primary text-primary bg-transparent hover:bg-secondary-hover focus-visible:ring-ring focus-visible:ring-2 max-[600px]:min-w-auto',
} as const;

export const Button = ({ children, className, appName, variant = 'secondary' }: ButtonProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.button
      className={cn(baseClasses, variantClasses[variant], className)}
      onClick={() => alert(`Hello from your ${appName} app!`)}
      type="button"
      whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
};
