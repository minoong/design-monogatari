import type { ReactNode, SVGProps } from 'react';

/**
 * 사이드바, 탭, 소개 카드에 쓰는 정적 아이콘. 새 의존성(lucide-react)을 들이지 않으려고 24px 격자의 선 아이콘을 직접 둔다.
 * 장식이라 `aria-hidden`이고, 이름은 옆의 글자가 가진다. 글자 크기를 따르도록 `1em`이며 색은 `currentColor`다.
 */
function Glyph({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      aria-hidden
      fill="none"
      height="1em"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {children}
    </svg>
  );
}

const ICONS = {
  /** 소개: 펼친 책 */
  Book: (
    <>
      <path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" />
      <path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" />
    </>
  ),
  /** 파운데이션: 겹친 층 */
  Layers: (
    <>
      <path d="M12 2 2 7l10 5 10-5z" />
      <path d="m2 17 10 5 10-5" />
      <path d="m2 12 10 5 10-5" />
    </>
  ),
  /** 컴포넌트: 네 칸 */
  Grid: (
    <>
      <rect height="7" rx="1" width="7" x="3" y="3" />
      <rect height="7" rx="1" width="7" x="14" y="3" />
      <rect height="7" rx="1" width="7" x="3" y="14" />
      <rect height="7" rx="1" width="7" x="14" y="14" />
    </>
  ),
  /** 유틸리티: 터미널 */
  Terminal: (
    <>
      <path d="m4 17 6-6-6-6" />
      <path d="M12 19h8" />
    </>
  ),
  /** AI 워크플로: 반짝임 */
  Sparkles: (
    <>
      <path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
      <path d="M19 3v4" />
      <path d="M21 5h-4" />
    </>
  ),
  /** AI & LLMs: 로봇 머리 */
  Bot: (
    <>
      <rect height="12" rx="2" width="16" x="4" y="8" />
      <path d="M12 8V4" />
      <path d="M9 14v2" />
      <path d="M15 14v2" />
    </>
  ),
} as const;

export type SectionIconName = keyof typeof ICONS;

export function SectionIcon({ name }: { name: SectionIconName }) {
  return <Glyph>{ICONS[name]}</Glyph>;
}

/** 문서 프런트매터와 `meta.json`의 `icon` 값(문자열)을 아이콘으로 바꾼다. 모르는 이름은 그리지 않는다. */
export function iconFor(name: string | undefined): ReactNode {
  return name && name in ICONS ? <SectionIcon name={name as SectionIconName} /> : undefined;
}
