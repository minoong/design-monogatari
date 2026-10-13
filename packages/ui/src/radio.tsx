import { type ComponentProps, forwardRef } from 'react';

import { cn } from './lib/cn';

export type RadioProps = Omit<ComponentProps<'input'>, 'type'>;

/** 네이티브 라디오에 토큰 스타일만 입혔다. 같은 `name`끼리는 브라우저가 방향키 이동을 처리한다. */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type="radio"
      className={cn(
        'border-border bg-background size-5 shrink-0 cursor-pointer appearance-none rounded-full border align-middle',
        'checked:border-primary checked:bg-primary checked:shadow-[inset_0_0_0_4px_var(--color-background)]',
        'focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
        'aria-invalid:border-destructive aria-invalid:ring-destructive aria-invalid:focus-visible:ring-destructive aria-invalid:ring-2',
        'disabled:bg-muted disabled:checked:border-muted-foreground disabled:checked:bg-muted-foreground disabled:cursor-not-allowed',
        'forced-colors:appearance-auto',
        className,
      )}
      {...props}
    />
  );
});
