'use client';

import { Button } from '@repo/ui/button';
import { cn } from '@repo/ui/cn';
import { MoonIcon, type MoonIconHandle } from '@repo/ui/icons/moon';
import { SunIcon, type SunIconHandle } from '@repo/ui/icons/sun';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useSyncExternalStore } from 'react';

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
  const sunRef = useRef<SunIconHandle>(null);
  const moonRef = useRef<MoonIconHandle>(null);
  const isDark = resolvedTheme === 'dark';

  // 테마가 바뀌면 새로 나타난 아이콘이 한 번 움직인다(처음 그릴 때는 가만히 있다).
  const previous = useRef<boolean | null>(null);
  useEffect(() => {
    if (!mounted) return;
    if (previous.current !== null && previous.current !== isDark) {
      (isDark ? sunRef : moonRef).current?.startAnimation();
    }
    previous.current = isDark;
  }, [isDark, mounted]);

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
        <MoonIcon data-icon="inline-start" />
        <Label current="다크" />
      </Button>
    );
  }

  return (
    <Button
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      size="small"
      variant="secondary"
      onClick={() => {
        setTheme(isDark ? 'light' : 'dark');
      }}
    >
      {/* 다크 모드일 때는 누르면 해(라이트)가 되고, 라이트일 때는 누르면 달(다크)이 된다. 아이콘은 가는 쪽을 보여 준다. */}
      {isDark ? (
        <SunIcon ref={sunRef} data-icon="inline-start" />
      ) : (
        <MoonIcon ref={moonRef} data-icon="inline-start" />
      )}
      <Label current={isDark ? '라이트' : '다크'} />
    </Button>
  );
}
