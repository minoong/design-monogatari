'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { motion, useReducedMotion } from 'motion/react';

import { cn } from './lib/cn';

const loadingVariants = cva('text-foreground inline-flex flex-col items-center justify-center', {
  variants: {
    size: {
      small: 'gap-2',
      medium: 'gap-3',
      large: 'gap-3.5',
    },
  },
  defaultVariants: {
    size: 'medium',
  },
});

const FRAME = {
  small: 28,
  medium: 40,
  large: 56,
} as const;

function clampProgress(progress: number) {
  return Math.min(1, Math.max(0, progress));
}

function Spinner({ reduceMotion, size }: { reduceMotion: boolean; size: keyof typeof FRAME }) {
  const frame = FRAME[size];

  return (
    <span className="relative" style={{ width: frame, height: frame }}>
      <svg aria-hidden className="text-border absolute inset-0" fill="none" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="18.5" stroke="currentColor" strokeWidth="1.25" />
        <circle cx="24" cy="24" r="12" stroke="currentColor" strokeWidth="1" />
      </svg>
      <motion.span
        className="absolute inset-0"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 1.7, ease: 'linear', repeat: Infinity }}
      >
        <svg aria-hidden className="size-full" fill="none" viewBox="0 0 48 48">
          <circle
            cx="24"
            cy="24"
            r="18.5"
            stroke="currentColor"
            strokeDasharray="28 88"
            strokeLinecap="round"
            strokeWidth="1.5"
          />
        </svg>
      </motion.span>
      <motion.span
        className="text-muted-foreground absolute inset-0"
        animate={reduceMotion ? undefined : { rotate: -360 }}
        transition={{ duration: 2.8, ease: 'linear', repeat: Infinity }}
      >
        <svg aria-hidden className="size-full" fill="none" viewBox="0 0 48 48">
          <circle
            cx="24"
            cy="24"
            r="12"
            stroke="currentColor"
            strokeDasharray="16 60"
            strokeLinecap="round"
            strokeWidth="1.25"
          />
        </svg>
      </motion.span>
    </span>
  );
}

function ProgressRing({ progress, size }: { progress: number; size: keyof typeof FRAME }) {
  const frame = FRAME[size];
  const radius = 18.5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clampProgress(progress));

  return (
    <svg
      aria-hidden
      className="text-foreground"
      fill="none"
      height={frame}
      viewBox="0 0 48 48"
      width={frame}
    >
      <circle className="stroke-border" cx="24" cy="24" r={radius} strokeWidth="1.25" />
      <circle
        cx="24"
        cy="24"
        r={radius}
        stroke="currentColor"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        strokeWidth="1.5"
        transform="rotate(-90 24 24)"
      />
    </svg>
  );
}

export type LoadingProps = VariantProps<typeof loadingVariants> & {
  className?: string;
  label?: string;
  progress?: number;
};

export function Loading({
  className,
  label = '불러오는 중',
  progress,
  size = 'medium',
}: LoadingProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const determinate = typeof progress === 'number' && Number.isFinite(progress);
  const value = determinate ? clampProgress(progress) : undefined;
  const percent = value === undefined ? undefined : Math.round(value * 100);

  return (
    <div
      aria-label={label}
      aria-live="polite"
      aria-valuemax={determinate ? 100 : undefined}
      aria-valuemin={determinate ? 0 : undefined}
      aria-valuenow={percent}
      className={cn(loadingVariants({ size }), className)}
      role={determinate ? 'progressbar' : 'status'}
    >
      {determinate ? (
        <ProgressRing progress={value ?? 0} size={size ?? 'medium'} />
      ) : (
        <Spinner reduceMotion={reduceMotion} size={size ?? 'medium'} />
      )}
      <span className="text-muted-foreground text-caption text-center">
        {label}
        {percent === undefined ? null : ` ${percent}%`}
      </span>
    </div>
  );
}
