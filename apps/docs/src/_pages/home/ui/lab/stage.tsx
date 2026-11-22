import type { ReactNode } from 'react';

/**
 * 섹션마다 하나씩 두는 "스테이지": 파일 이름이 붙은 제목 줄과 테두리가 있는 창이다.
 * 그 섹션이 말하는 것을 도트 장면과 직접 눌러 볼 수 있는 조작으로 보여 준다.
 * 제목 줄의 점 무늬와 가장자리 표시는 장식이라 낭독기에는 숨긴다.
 */
export function Stage({
  file,
  caption,
  children,
  className = '',
  grow = true,
}: {
  /** 제목 줄에 보이는 파일 이름(예: `color-swatch-group.tsx`) */
  file: string;
  /** 낭독기가 읽는 장면 설명. 없으면 제목 줄만 이름이 된다. */
  caption?: string;
  children: ReactNode;
  className?: string;
  /**
   * 화면에 들어올 때 커지는 효과(`lp-grow`). 안에 `getBoundingClientRect`로 위치를 재는 컴포넌트
   * (`ColorSwatchGroup`의 선택 링 등)가 있으면 끈다: 조상에 `scale`이 걸리면 잰 값이 줄어든 채로 굳는다.
   */
  grow?: boolean;
}) {
  return (
    <figure
      aria-label={caption}
      className={`${grow ? 'lp-grow' : ''}border-border bg-card relative m-0 overflow-clip rounded-xl border ${className}`}
    >
      <figcaption
        aria-hidden
        className="border-border text-muted-foreground flex items-center gap-2 border-b bg-[radial-gradient(circle_closest-side,currentColor_45%,transparent_55%)] bg-size-[8px_8px] bg-position-[0_0] px-4 py-2 font-mono text-xs"
      >
        <span className="bg-primary size-2 shrink-0 rounded-full" />
        <span className="bg-card px-1.5">{file}</span>
      </figcaption>
      {children}
      {['top-10 left-1.5', 'top-10 right-1.5', 'bottom-1.5 left-1.5', 'right-1.5 bottom-1.5'].map(
        (place) => (
          <span
            key={place}
            aria-hidden
            className={`border-foreground/30 pointer-events-none absolute size-1.5 rounded-full border ${place}`}
          />
        ),
      )}
    </figure>
  );
}
