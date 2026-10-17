'use client';

import { Button } from '@repo/ui/button';
import { cn } from '@repo/ui/cn';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

const LABELS = ['다크', '라이트'] as const;

/**
 * 두 문구를 한 칸에 겹쳐 두고 지금 것만 보여 준다. 문구가 바뀌어도 버튼 폭이 변하지 않아서, 왼쪽의
 * 견적 요약 버튼과 가운데 맞춘 단계 막대가 밀리지 않는다(문구를 그대로 바꾸면 폭이 12px 달라진다).
 */
function Label({ current }: { current: (typeof LABELS)[number] }) {
  return (
    <span className="inline-grid">
      {LABELS.map((label) => (
        <span
          key={label}
          className={cn('col-start-1 row-start-1 text-center', label !== current && 'invisible')}
        >
          {label}
        </span>
      ))}
    </span>
  );
}

/** 라이트와 다크를 바꾸는 버튼. 옆의 다른 버튼과 같은 `Button`(작은 크기, 보조)이라 높이와 모서리가 같다. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (!mounted) {
    // 테마를 알기 전에도 자리를 같은 폭으로 잡아 둔다.
    return (
      <Button
        aria-hidden
        className="invisible"
        disabled
        size="small"
        tabIndex={-1}
        variant="secondary"
      >
        <Label current="다크" />
      </Button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      size="small"
      variant="secondary"
      onClick={() => {
        setTheme(isDark ? 'light' : 'dark');
      }}
    >
      <Label current={isDark ? '라이트' : '다크'} />
    </Button>
  );
}
