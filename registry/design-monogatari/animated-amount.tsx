'use client';

import NumberFlow, { type Format } from '@number-flow/react';
import { useInView, type UseInViewOptions } from 'motion/react';
import { useRef } from 'react';

import { cn } from '@/lib/utils';

const SPIN_TIMING = { duration: 900, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' } as const;
const TRANSFORM_TIMING = { duration: 600, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' } as const;
const SNAP_TRANSFORM_TIMING = { duration: 0 } as const;
const SNAP_OPACITY_TIMING = { duration: 0 } as const;

const KRW_FORMAT: Format = {
  notation: 'standard',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
};

export type AnimatedAmountProps = {
  value: number;
  animate?: boolean;
  className?: string;
  prefix?: string;
  suffix?: string;
  locales?: Intl.LocalesArgument;
  format?: Format;
  inView?: boolean;
  inViewOnce?: boolean;
  inViewAmount?: UseInViewOptions['amount'];
  inViewMargin?: UseInViewOptions['margin'];
  inViewRoot?: UseInViewOptions['root'];
  reserveWidth?: boolean;
};

export function AnimatedAmount({
  value,
  animate = true,
  className,
  prefix,
  suffix = '원',
  locales = 'ko-KR',
  format = KRW_FORMAT,
  inView = false,
  inViewOnce = true,
  inViewAmount = 'some',
  inViewMargin,
  inViewRoot,
  reserveWidth = true,
}: AnimatedAmountProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, {
    amount: inViewAmount,
    margin: inViewMargin,
    once: inViewOnce,
    root: inViewRoot,
  });
  const rounded = Math.round(value);
  const waitingForView = inView && !isInView;
  const shown = waitingForView ? 0 : rounded;
  const digitText = new Intl.NumberFormat(locales, format).format(rounded);

  return (
    <span ref={ref} className={cn('inline-flex items-baseline tabular-nums', className)}>
      <span className={cn('inline-flex items-baseline', waitingForView && 'invisible')}>
        {reserveWidth && prefix ? prefix : null}
        {reserveWidth ? (
          <span className="relative inline-block">
            <span aria-hidden className="invisible whitespace-nowrap">
              {digitText}
            </span>
            <span className="absolute inset-0 flex justify-end overflow-hidden">
              <NumberFlow
                animated={animate && !waitingForView}
                className="tabular-nums [--number-flow-mask-width:0em]"
                format={format}
                locales={locales}
                opacityTiming={SNAP_OPACITY_TIMING}
                spinTiming={SPIN_TIMING}
                transformTiming={SNAP_TRANSFORM_TIMING}
                value={shown}
              />
            </span>
          </span>
        ) : (
          <NumberFlow
            animated={animate && !waitingForView}
            className="inline tabular-nums"
            format={format}
            locales={locales}
            opacityTiming={SNAP_OPACITY_TIMING}
            prefix={prefix}
            spinTiming={SPIN_TIMING}
            suffix={suffix}
            transformTiming={TRANSFORM_TIMING}
            value={shown}
          />
        )}
        {reserveWidth && suffix ? suffix : null}
      </span>
    </span>
  );
}
