import type { CSSProperties, ReactNode } from 'react';

import { Rise } from '../rise';

/** 제목에서 강조할 말. 라이트는 `primary`, 다크는 읽히는 `primary-on-dark`. */
export function Accent({ children }: { children: ReactNode }) {
  return <em className="text-primary dark:text-primary-on-dark not-italic">{children}</em>;
}

function float(px: number): CSSProperties {
  return { '--lp-float': `${px}px` } as CSSProperties;
}

/**
 * 랜딩의 한 구역: 두 줄짜리 큰 제목(강조어 하나), 설명, 그리고 구역마다 다른 스테이지.
 * 제목·설명·스테이지가 화면에 들어올 때 차례로 올라오고(`Rise`), 지나가는 동안에는 겹마다 다른 속도로
 * 어긋난다(`lp-float`): 뒤의 점 바탕이 가장 느리고, 제목과 설명이 그다음이다. 바탕은 구역 바깥 가장자리까지
 * 펼쳐 보이도록 구역 전체 폭의 바깥 틀에 둔다. `side`는 바탕이 놓이는 쪽이다.
 */
export function LandingSection({
  id,
  title,
  description,
  side = 'right',
  children,
}: {
  id: string;
  title: ReactNode;
  description: string;
  side?: 'left' | 'right';
  children: ReactNode;
}) {
  return (
    <div className="relative isolate overflow-clip">
      <div
        aria-hidden
        className={`lp-float text-foreground/15 pointer-events-none absolute top-[12%] -z-10 h-3/5 w-[46%] bg-[radial-gradient(circle_closest-side,currentColor_55%,transparent_60%)] bg-size-[16px_16px] ${
          side === 'left'
            ? 'left-0 mask-[radial-gradient(70%_60%_at_0%_50%,black,transparent)]'
            : 'right-0 mask-[radial-gradient(70%_60%_at_100%_50%,black,transparent)]'
        }`}
        style={float(110)}
      />
      <section
        id={id}
        aria-labelledby={`${id}-title`}
        className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-14 md:px-6 md:py-24"
      >
        <Rise step={0}>
          <h2
            className="lp-float m-0 max-w-3xl text-4xl font-medium tracking-tight text-balance md:text-5xl"
            id={`${id}-title`}
            style={float(16)}
          >
            {title}
          </h2>
        </Rise>
        <Rise step={1}>
          <p
            className="lp-float text-muted-foreground mt-5 mb-0 max-w-2xl text-base leading-7 text-pretty md:text-lg"
            style={float(30)}
          >
            {description}
          </p>
        </Rise>
        <Rise className="mt-10 flex flex-col gap-6" step={2}>
          {children}
        </Rise>
      </section>
    </div>
  );
}
