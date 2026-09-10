'use client';

import { cn } from '../lib/cn';
import { useLiveCssVar } from './use-live-token';

export function ColorBar({
  label,
  tokenClass,
  cssVar,
  inkClass,
}: {
  label: string;
  tokenClass: string;
  cssVar: string;
  inkClass: string;
}) {
  const { ref, value } = useLiveCssVar(cssVar);

  return (
    <div
      ref={ref}
      className={cn(
        'ring-border flex min-h-16 flex-col justify-center rounded-md px-4 py-3 ring-1 ring-inset',
        tokenClass,
        inkClass,
      )}
    >
      <p className="text-sm font-semibold">{label}</p>
      <p className="font-mono text-xs">
        {tokenClass}
        {value ? ` · ${value}` : ''}
      </p>
    </div>
  );
}
