'use client';

import { useTheme } from '@fumadocs/base-ui/provider/base';
import { MoonIcon, type MoonIconHandle } from '@repo/ui/icons/moon';
import { SunIcon, type SunIconHandle } from '@repo/ui/icons/sun';
import { useRef, useState } from 'react';

/**
 * 라이트/다크 전환 버튼. Spacious 레이아웃은 테마 전환을 "…" 메뉴 안에 두는데, 눈에 띄지 않아서
 * 헤더에 바로 보이는 버튼을 둔다 (메뉴의 System/Light/Dark 선택은 그대로 있다).
 * 아이콘은 html 클래스(dark)로 바꿔서 서버 렌더와 첫 페인트가 어긋나지 않는다. 버튼에 마우스를 올리거나
 * 포커스가 오면 보이는 아이콘이 움직이고, 누르면 새로 나타난 아이콘이 한 번 움직인다.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [active, setActive] = useState(false);
  const sunRef = useRef<SunIconHandle>(null);
  const moonRef = useRef<MoonIconHandle>(null);

  return (
    <button
      type="button"
      aria-label="라이트/다크 모드 전환"
      onClick={() => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
        // 해와 달 중 하나만 보이므로 둘 다 부르면 새로 나타난 쪽이 재생된다.
        sunRef.current?.startAnimation();
        moonRef.current?.startAnimation();
      }}
      onBlur={() => {
        setActive(false);
      }}
      onFocus={(event) => {
        setActive(event.currentTarget.matches(':focus-visible'));
      }}
      onMouseEnter={() => {
        setActive(true);
      }}
      onMouseLeave={() => {
        setActive(false);
      }}
      className="text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:ring-fd-ring inline-flex size-7.5 items-center justify-center rounded-md outline-none focus-visible:ring-2"
    >
      <SunIcon ref={sunRef} className="dark:hidden" isHovered={active} size={16} />
      <MoonIcon ref={moonRef} className="hidden dark:inline-flex" isHovered={active} size={16} />
    </button>
  );
}
