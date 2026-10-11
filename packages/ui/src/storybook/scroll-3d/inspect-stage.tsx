'use client';

import { type ReactNode } from 'react';

export function InspectStage({
  alt,
  overlay,
  credit,
  children,
}: {
  alt: string;
  overlay: ReactNode;
  credit?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="bg-background relative">
      <div className="relative h-svh w-full overflow-hidden">
        {children}
        <p className="sr-only">{alt}</p>
        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="bg-background/55 pointer-events-auto absolute top-4 left-4 max-w-72 rounded-lg p-3 backdrop-blur-sm">
            {overlay}
          </div>
          <p className="text-caption text-muted-foreground bg-background/55 absolute top-4 right-4 rounded-md px-2.5 py-1.5 whitespace-nowrap backdrop-blur-sm">
            드래그로 회전 · 스크롤로 줌
          </p>
        </div>
        {credit ? (
          <div className="pointer-events-none absolute inset-x-4 bottom-2 z-10">
            <div className="bg-background/55 text-caption pointer-events-auto w-fit max-w-full rounded-md px-2.5 py-1 backdrop-blur-sm">
              {credit}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
