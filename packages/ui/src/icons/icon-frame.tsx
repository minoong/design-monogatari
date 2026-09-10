import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '../lib/cn';

export type IconFrameProps = {
  children: ReactNode;
} & HTMLAttributes<HTMLSpanElement>;

export function IconFrame({ className, children, ...props }: IconFrameProps) {
  return (
    <span
      aria-hidden
      className={cn('inline-flex shrink-0 items-center justify-center [&_svg]:block', className)}
      {...props}
    >
      {children}
    </span>
  );
}
