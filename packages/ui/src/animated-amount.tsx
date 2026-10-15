'use client';

import NumberFlow, { type Format } from '@number-flow/react';
import { useInView, type UseInViewOptions } from 'motion/react';
import { useRef } from 'react';

import { cn } from './lib/cn';

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
  // 소수 자릿수는 format 을 따른다. 기본(정수)이면 반올림하고, 소수를 보이는 format 이면 그 자릿수까지 남긴다
  const fractionDigits = format.maximumFractionDigits ?? format.minimumFractionDigits ?? 0;
  const factor = 10 ** fractionDigits;
  const rounded = Math.round(value * factor) / factor;
  const waitingForView = inView && !isInView;
  const shown = waitingForView ? 0 : rounded;
  const digitText = new Intl.NumberFormat(locales, format).format(rounded);

  return (
    <span ref={ref} className={cn('inline-flex items-baseline tabular-nums', className)}>
      <span className={cn('inline-flex items-baseline', waitingForView && 'invisible')}>
        {reserveWidth && prefix ? prefix : null}
        {reserveWidth ? (
          // 숨은 글자와 숫자를 같은 칸에 겹쳐 둔다. 절대 위치로 띄우면 숫자가 칸 맨 위에 붙어 접미사와 기준선이 글자 크기마다
          // 달라지므로, 격자에서 기준선을 맞춘다. 폭은 숨은 글자가 잡고 숫자는 오른쪽에 붙는다.
          <span className="inline-grid items-baseline justify-items-end">
            <span aria-hidden className="invisible whitespace-nowrap [grid-area:1/1]">
              {digitText}
            </span>
            <NumberFlow
              animated={animate && !waitingForView}
              className="my-[-0.2857em] tabular-nums [--number-flow-mask-width:0em] [grid-area:1/1]"
              format={format}
              locales={locales}
              opacityTiming={SNAP_OPACITY_TIMING}
              spinTiming={SPIN_TIMING}
              transformTiming={SNAP_TRANSFORM_TIMING}
              value={shown}
            />
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
