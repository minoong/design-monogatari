'use client';

import { Button } from '@repo/ui/button';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

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
        라이트
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
      {isDark ? '라이트' : '다크'}
    </Button>
  );
}
