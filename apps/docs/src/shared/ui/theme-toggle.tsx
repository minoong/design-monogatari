'use client';

import { useTheme } from '@fumadocs/base-ui/provider/base';

/**
 * 라이트/다크 전환 버튼. Spacious 레이아웃은 테마 전환을 "…" 메뉴 안에 두는데, 눈에 띄지 않아서
 * 헤더에 바로 보이는 버튼을 둔다 (메뉴의 System/Light/Dark 선택은 그대로 있다).
 * 아이콘은 html 클래스(dark)로 바꿔서 서버 렌더와 첫 페인트가 어긋나지 않는다.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="라이트/다크 모드 전환"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:ring-fd-ring inline-flex size-7.5 items-center justify-center rounded-md outline-none focus-visible:ring-2"
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4 dark:hidden"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="hidden size-4 dark:block"
      >
        <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
      </svg>
    </button>
  );
}
