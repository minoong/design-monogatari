import type { CSSProperties, ReactNode } from 'react';

/**
 * 스크롤로 들어올 때 올라오는 한 겹. 순서(`step`)가 클수록 조금 늦게 시작한다.
 * 올라오는 규칙은 `globals.css`의 `.lp-rise`(CSS 스크롤 타임라인)에 있다. 지원하지 않는 브라우저와
 * 감소 모션에서는 클래스만 남고 아무 일도 하지 않으므로, 내용은 처음부터 제자리에 있다.
 */
export function Rise({
  step,
  enabled,
  className,
  children,
}: {
  step: number;
  enabled: boolean;
  className?: string;
  children: ReactNode;
}) {
  if (!enabled) return className ? <div className={className}>{children}</div> : <>{children}</>;
  return (
    <div className={`lp-rise ${className ?? ''}`} style={{ '--lp-i': step } as CSSProperties}>
      {children}
    </div>
  );
}

/** 랜딩의 한 구역. 제목과 설명을 위에 두고 내용을 아래에 둔다. */
export function Section({
  id,
  eyebrow,
  title,
  description,
  reveal = false,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  description?: string;
  /** 스크롤 진입 효과를 켠다(프로토타입) */
  reveal?: boolean;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-14 md:px-6 md:py-20">
      <Rise enabled={reveal} step={0}>
        <p className="text-primary mb-3 font-mono text-xs font-medium tracking-wide uppercase">
          {eyebrow}
        </p>
        <h2 className="m-0 max-w-2xl text-3xl font-medium tracking-tight text-balance md:text-4xl">
          {title}
        </h2>
      </Rise>
      {description ? (
        <Rise enabled={reveal} step={1}>
          <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-7 text-pretty md:text-lg">
            {description}
          </p>
        </Rise>
      ) : null}
      <Rise className="mt-10" enabled={reveal} step={2}>
        {children}
      </Rise>
    </section>
  );
}
