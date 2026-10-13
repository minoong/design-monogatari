import { type ComponentProps, forwardRef } from 'react';

import { cn } from './lib/cn';

export type NativeSelectProps = ComponentProps<'select'>;

/** 브라우저 기본 `<select>`를 그대로 쓴다. 모바일에서는 OS 선택 창이 열리고, 옵션 목록은 직접 꾸미지 않는다. */
export const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(function NativeSelect(
  { className, children, ...props },
  ref,
) {
  return (
    <div className="relative flex w-full">
      <select
        ref={ref}
        className={cn(
          'border-border bg-background text-foreground flex h-11 w-full cursor-pointer appearance-none rounded-md border py-2 pr-10 pl-3 font-sans text-sm',
          'focus-visible:border-primary focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
          'aria-invalid:border-destructive aria-invalid:ring-destructive aria-invalid:focus-visible:border-destructive aria-invalid:focus-visible:ring-destructive aria-invalid:ring-2',
          'disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
});
