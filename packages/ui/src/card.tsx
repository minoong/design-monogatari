import { type JSX, type ReactNode } from 'react';

import { cn } from './lib/cn';

export function Card({
  className,
  title,
  children,
  href,
}: {
  className?: string;
  title: string;
  children: ReactNode;
  href: string;
}): JSX.Element {
  return (
    <a
      className={cn(
        'group border-border hover:bg-secondary-hover block rounded-lg border p-6 font-sans transition-colors',
        className,
      )}
      href={`${href}?utm_source=create-turbo&utm_medium=basic&utm_campaign=create-turbo`}
      rel="noopener noreferrer"
      target="_blank"
    >
      <h2 className="mb-2 text-xl font-semibold">
        {title}{' '}
        <span className="inline-block transition-transform group-hover:translate-x-1">-&gt;</span>
      </h2>
      <p className="text-muted-foreground text-sm leading-6">{children}</p>
    </a>
  );
}
