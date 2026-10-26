import type { ReactNode } from 'react';

/** 랜딩의 한 구역. 제목과 설명을 위에 두고 내용을 아래에 둔다. */
export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-14 md:px-6 md:py-20">
      <p className="text-primary mb-3 font-mono text-xs font-medium tracking-wide uppercase">
        {eyebrow}
      </p>
      <h2 className="m-0 max-w-2xl text-3xl font-medium tracking-tight text-balance md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-7 text-pretty md:text-lg">
          {description}
        </p>
      ) : null}
      <div className="mt-10">{children}</div>
    </section>
  );
}
