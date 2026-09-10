'use client';

import { type ReactNode, useState } from 'react';

import { cn } from './lib/cn';

function RefreshIcon() {
  return (
    <svg
      aria-hidden
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M21 12a9 9 0 1 1-2.6-6.3" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

export function StoryReplay({
  children,
  className,
  label = '다시 보기',
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  const [generation, setGeneration] = useState(0);

  return (
    <div className={cn('flex w-full flex-col gap-3', className)}>
      <div className="flex justify-end">
        <button
          aria-label={label}
          className="border-border text-foreground hover:bg-secondary-hover focus-visible:ring-ring focus-visible:ring-offset-background inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border focus-visible:ring-2 focus-visible:ring-offset-2"
          onClick={() => setGeneration((current) => current + 1)}
          title={label}
          type="button"
        >
          <RefreshIcon />
        </button>
      </div>
      <div key={generation}>{children}</div>
    </div>
  );
}
