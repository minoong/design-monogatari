'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export const RAIL_ITEMS = [
  { id: 'hero', label: '시작' },
  { id: 'components', label: '컴포넌트' },
  { id: 'tokens', label: '토큰' },
  { id: 'motion', label: '모션' },
  { id: 'install', label: '설치' },
  { id: 'drive', label: '출발' },
] as const;

/**
 * 화면 맨 아래에 고정된 구역 막대. 지금 읽는 구역(화면 가운데를 지나는 구역)을 강조하고, 눌러서
 * 이동한다. 맨 위의 가는 선은 문서 스크롤 진행도다(CSS 스크롤 타임라인, 위치 표시라 감소 모션에서도 켠다).
 */
export function LandingRail() {
  const [active, setActive] = useState<string>(RAIL_ITEMS[0].id);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    for (const item of RAIL_ITEMS) {
      const el = document.getElementById(item.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  const current = RAIL_ITEMS.find((item) => item.id === active);

  return (
    <nav
      aria-label="구역 이동"
      className="border-border bg-background/90 fixed inset-x-0 bottom-0 z-40 flex h-9 items-stretch border-t font-mono text-xs backdrop-blur-sm"
    >
      <span
        aria-hidden
        className="lp-progress bg-primary pointer-events-none absolute inset-x-0 -top-px h-px"
      />
      <p className="text-muted-foreground m-0 hidden items-center gap-2 px-4 sm:flex">
        <span aria-hidden className="bg-primary size-1.5 rounded-full" />
        {current?.label}
      </p>
      <ul className="m-0 ml-auto flex min-w-0 list-none overflow-x-auto p-0">
        {RAIL_ITEMS.map((item) => {
          const isActive = item.id === active;
          return (
            <li key={item.id} className="m-0 flex">
              <Link
                aria-current={isActive ? 'location' : undefined}
                className={`border-border flex items-center border-l px-3 no-underline -outline-offset-2 focus-visible:outline-2 sm:px-4 ${
                  isActive
                    ? 'bg-primary text-primary-foreground focus-visible:outline-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground focus-visible:outline-fd-ring'
                }`}
                href={`#${item.id}`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
