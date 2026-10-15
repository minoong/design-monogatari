import { cva, type VariantProps } from 'class-variance-authority';
import { type ComponentProps } from 'react';

import { cn } from '@/lib/utils';

export const noticeVariants = cva(
  'group flex flex-col gap-1 rounded-lg border p-4 font-sans text-sm',
  {
    variants: {
      variant: {
        info: 'border-border bg-muted text-foreground',
        error: 'border-destructive bg-background text-foreground border-2',
      },
    },
    defaultVariants: { variant: 'info' },
  },
);

export type NoticeProps = ComponentProps<'div'> & VariantProps<typeof noticeVariants>;

/**
 * 화면 안에 머무는 안내·오류 문구. 정보는 `role="status"`(조용히 알림), 오류는 `role="alert"`(즉시 알림)로 읽힙니다.
 * 면책 문구나 선택을 바꾼 이유처럼 사라지면 안 되는 내용에 쓰고, 잠깐 보였다 사라지는 알림은 `Toast`를 쓰십시오.
 */
export function Notice({ variant = 'info', role, className, ...props }: NoticeProps) {
  return (
    <div
      role={role ?? (variant === 'error' ? 'alert' : 'status')}
      data-variant={variant}
      className={cn(noticeVariants({ variant }), className)}
      {...props}
    />
  );
}

export type NoticeTitleProps = ComponentProps<'p'> & {
  /** 오류 안내일 때만 스크린 리더가 제목 앞에서 읽는 말 */
  errorLabel?: string;
};

export function NoticeTitle({
  className,
  children,
  errorLabel = '오류: ',
  ...props
}: NoticeTitleProps) {
  return (
    <p
      className={cn('group-data-[variant=error]:text-destructive font-semibold', className)}
      {...props}
    >
      <span className="sr-only group-data-[variant=info]:hidden">{errorLabel}</span>
      {children}
    </p>
  );
}

export function NoticeDescription({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'text-muted-foreground text-caption group-data-[variant=error]:text-foreground',
        className,
      )}
      {...props}
    />
  );
}
