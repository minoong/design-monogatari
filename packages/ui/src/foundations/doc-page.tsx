import type { ReactNode } from 'react';

export function DocPage({
  kicker,
  title,
  lead,
  children,
}: {
  kicker: string;
  title: string;
  lead: string;
  children: ReactNode;
}) {
  return (
    <article className="flex w-full max-w-3xl flex-col gap-12 font-sans">
      <header className="flex flex-col gap-3">
        <p className="text-muted-foreground text-caption">{kicker}</p>
        <h1 className="text-foreground text-title font-semibold tracking-tight">{title}</h1>
        <p className="text-foreground text-body">{lead}</p>
      </header>
      {children}
    </article>
  );
}

export function DocSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-foreground text-xl font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

export function DocBody({ children }: { children: ReactNode }) {
  return <p className="text-foreground text-body">{children}</p>;
}

export function DocCode({ children }: { children: string }) {
  return (
    <pre className="border-border bg-muted overflow-x-auto rounded-md border p-4 font-mono text-sm leading-6">
      <code>{children}</code>
    </pre>
  );
}
