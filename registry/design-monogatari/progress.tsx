import { type ComponentProps, type ReactNode, useId } from 'react';

import { AnimatedAmount } from '@/ui/animated-amount';
import { cn } from '@/lib/utils';

export type ProgressProps = Omit<ComponentProps<'div'>, 'children' | 'role'> & {
  /** 현재 값. 0 이상 `max` 이하로 맞춰 그립니다. */
  value: number;
  max?: number;
  /** 진행 막대의 이름. 필수입니다. */
  label: ReactNode;
  /** 이름을 화면에서 숨기고 스크린 리더에만 읽힙니다. */
  labelHidden?: boolean;
  /** 읽어 주고 보여 줄 값 문구. 없으면 백분율입니다 (예: "4 / 13 부품"). */
  valueText?: string;
  /** 오른쪽에 값 문구를 보입니다. */
  showValue?: boolean;
};

/**
 * 끝이 정해진 작업의 진행률 막대(`role="progressbar"`)입니다. 모델 파일을 불러오는 과정처럼 진행 정도를 알 때
 * 쓰고, 언제 끝날지 모르면 `Skeleton`을 쓰십시오. 막대는 `transform`으로만 움직이며 감소 모션에서는 바로 바뀝니다.
 * 값 문구를 따로 주지 않으면 백분율 숫자가 막대와 함께 굴러가며 바뀝니다(감소 모션에서는 줄어듭니다). 값이 바뀔 때 스크린 리더가 따로 읽어 주지는 않습니다. `aria-describedby` 같은 속성은 막대가 아니라 바깥 `div`에 붙습니다.
 */
export function Progress({
  value,
  max = 100,
  label,
  labelHidden = false,
  valueText,
  showValue = true,
  className,
  ...props
}: ProgressProps) {
  const labelId = useId();
  const safeMax = max > 0 ? max : 100;
  const clamped = Math.min(Math.max(value, 0), safeMax);
  const percent = Math.round((clamped / safeMax) * 100);
  const text = valueText ?? `${percent}%`;

  return (
    <div className={cn('font-sans text-sm', className)} {...props}>
      <div
        className={cn(
          'mb-2 flex items-baseline justify-between gap-4',
          labelHidden && !showValue && 'sr-only',
        )}
      >
        <span id={labelId} className={cn('text-foreground font-medium', labelHidden && 'sr-only')}>
          {label}
        </span>
        {showValue ? (
          <span aria-hidden className="text-muted-foreground ml-auto tabular-nums">
            {/* 값 문구를 따로 주지 않으면 백분율 숫자가 굴러가며 바뀐다. 직접 준 문구는 그대로 보인다. 오른쪽 정렬이라 폭을 미리 잡지 않고 숫자와 %를 한 덩어리로 그려 세로 정렬을 맞춘다. */}
            {valueText === undefined ? (
              <AnimatedAmount value={percent} suffix="%" reserveWidth={false} />
            ) : (
              valueText
            )}
          </span>
        ) : null}
      </div>
      <div
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={clamped}
        aria-valuetext={text}
        className="bg-muted ring-border h-2 overflow-hidden rounded-full ring-1 ring-inset forced-colors:border forced-colors:border-[ButtonText]"
      >
        <div
          className="bg-primary dark:bg-primary-on-dark ease-out-expo size-full rounded-full transition-transform duration-450 motion-reduce:transition-none forced-colors:bg-[Highlight]"
          style={{ transform: `translateX(${percent - 100}%)` }}
        />
      </div>
    </div>
  );
}
