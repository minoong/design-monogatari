'use client';

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

const toggleClasses =
  'border-border text-foreground hover:bg-secondary-hover focus-visible:ring-ring inline-flex h-12 cursor-pointer appearance-none items-center justify-center rounded-pill border bg-transparent px-5 font-sans text-base leading-5 font-medium focus-visible:ring-2 max-[600px]:h-10 max-[600px]:px-4 max-[600px]:text-sm';

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <span className={`${toggleClasses} invisible`} aria-hidden>
        테마
      </span>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      className={toggleClasses}
      aria-pressed={isDark}
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? '라이트' : '다크'}
    </button>
  );
}
