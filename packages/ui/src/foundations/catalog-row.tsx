import type { ReactNode } from 'react';

export function TokenStack({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-2">{children}</div>;
}

export function CatalogRow({
  preview,
  title,
  meta,
}: {
  preview: ReactNode;
  title: string;
  meta: string;
}) {
  return (
    <div className="border-border flex items-center gap-4 rounded-md border p-4">
      <div className="shrink-0">{preview}</div>
      <div className="min-w-0 font-sans">
        <p className="text-foreground text-sm font-semibold">{title}</p>
        <p className="text-muted-foreground font-mono text-xs">{meta}</p>
      </div>
    </div>
  );
}
