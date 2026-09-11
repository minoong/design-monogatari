import { type ComponentProps, forwardRef } from 'react';

import { cn } from './lib/cn';

export const Input = forwardRef<HTMLInputElement, ComponentProps<'input'>>(function Input(
  { className, type = 'text', ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        'border-border bg-background text-foreground placeholder:text-muted-foreground flex h-11 w-full rounded-md border px-3 py-2 font-sans text-sm',
        'focus-visible:border-primary focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        'aria-invalid:border-destructive aria-invalid:ring-destructive aria-invalid:focus-visible:border-destructive aria-invalid:focus-visible:ring-destructive aria-invalid:ring-2',
        'disabled:bg-muted disabled:text-muted-foreground disabled:placeholder:text-muted-foreground disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  );
});
