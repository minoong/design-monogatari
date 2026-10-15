'use client';

import { useEffect, useRef, useState } from 'react';

import { Button, type ButtonProps } from './button';
import { cn } from './lib/cn';

type CopyState = 'idle' | 'copied' | 'failed';

export type CopyButtonProps = Omit<
  ButtonProps,
  'children' | 'asChild' | 'loading' | 'onClick' | 'aria-label'
> & {
  /** 클립보드에 복사할 글자 */
  value: string;
  label?: string;
  copiedLabel?: string;
  failedLabel?: string;
  /** 복사 결과 문구가 원래 문구로 돌아오기까지 걸리는 시간(ms) */
  resetDelay?: number;
  onCopy?: (value: string) => void;
  onCopyError?: (error: unknown) => void;
};

function CopyIcon() {
  return (
    <svg
      aria-hidden
      data-icon="inline-start"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h8" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden
      data-icon="inline-start"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/**
 * 글자를 클립보드에 복사하는 버튼. 누르면 문구가 "복사했습니다"로 바뀌었다가 돌아오고, 같은 문구를
 * 스크린 리더에 조용히 알립니다. 클립보드를 쓸 수 없으면 "복사하지 못했습니다"로 바뀝니다.
 * 문구가 바뀌어도 버튼 너비가 변하지 않습니다. 링크 복사 뒤 `Toast`를 띄우려면 `onCopy`를 쓰십시오.
 * 알림 줄이 버튼 옆 형제로 그려지므로 `space-x-*`, `divide-x`, `:last-child` 기준 묶음 스타일과는 함께 쓰지 마십시오.
 */
export function CopyButton({
  value,
  label = '복사',
  copiedLabel = '복사했습니다',
  failedLabel = '복사하지 못했습니다',
  resetDelay = 2000,
  onCopy,
  onCopyError,
  variant = 'secondary',
  size = 'medium',
  className,
  ...props
}: CopyButtonProps) {
  const [state, setState] = useState<CopyState>('idle');
  // 같은 결과가 연달아 나와도 알림이 다시 읽히도록 번호를 올려 알림 문구를 새로 그린다.
  const [announceId, setAnnounceId] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const labels: Record<CopyState, string> = {
    idle: label,
    copied: copiedLabel,
    failed: failedLabel,
  };

  async function copy() {
    let next: CopyState = 'copied';
    try {
      if (!navigator.clipboard) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(value);
    } catch (error) {
      next = 'failed';
      onCopyError?.(error);
    }
    setState(next);
    setAnnounceId((id) => id + 1);
    if (next === 'copied') onCopy?.(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setState('idle');
    }, resetDelay);
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={cn(className)}
        onClick={() => {
          void copy();
        }}
        {...props}
      >
        {state === 'copied' ? <CheckIcon /> : <CopyIcon />}
        {/* 모든 문구를 겹쳐 두고 현재 것만 보여서, 문구가 바뀌어도 너비가 변하지 않는다. */}
        <span className="inline-grid justify-items-center">
          {(Object.keys(labels) as CopyState[]).map((key) => (
            <span key={key} className={cn('col-start-1 row-start-1', key !== state && 'invisible')}>
              {labels[key]}
            </span>
          ))}
        </span>
      </Button>
      <span role="status" className="sr-only">
        {state === 'copied' ? <span key={announceId}>{labels.copied}</span> : null}
      </span>
      <span role="alert" className="sr-only">
        {state === 'failed' ? <span key={announceId}>{labels.failed}</span> : null}
      </span>
    </>
  );
}
