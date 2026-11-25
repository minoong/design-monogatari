import type { CSSProperties, ReactNode } from 'react';

/**
 * 스크롤로 들어올 때 올라오는 한 겹. 순서(`step`)가 클수록 조금 늦게 시작한다.
 * 올라오는 규칙은 `globals.css`의 `.lp-rise`(CSS 스크롤 타임라인)에 있다. 지원하지 않는 브라우저와
 * 감소 모션에서는 클래스만 남고 아무 일도 하지 않으므로, 내용은 처음부터 제자리에 있다.
 */
export function Rise({
  step,
  className,
  children,
}: {
  step: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`lp-rise ${className ?? ''}`} style={{ '--lp-i': step } as CSSProperties}>
      {children}
    </div>
  );
}
