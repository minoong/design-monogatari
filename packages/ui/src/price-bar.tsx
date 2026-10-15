'use client';

import { type ComponentProps, type ReactNode, useEffect, useId, useState } from 'react';

import { AnimatedAmount } from './animated-amount';
import { cn } from './lib/cn';

const KRW = new Intl.NumberFormat('ko-KR');

/** 총액이 멈춘 뒤 이만큼 기다렸다가 스크린 리더에 알립니다(ms). */
const ANNOUNCE_DELAY = 500;

function formatWon(amount: number, signed = false) {
  const rounded = Math.round(amount);
  const sign = signed && rounded > 0 ? '+' : rounded < 0 ? '−' : '';
  return `${sign}${KRW.format(Math.abs(rounded))}원`;
}

export type PriceBarProps = ComponentProps<'div'> & {
  /** 화면 아래에 붙입니다. 기기의 하단 안전 영역을 비웁니다. */
  fixed?: boolean;
};

/**
 * 견적 총액, 요약 열기 버튼, 이전·다음 버튼을 한 줄에 모은 막대입니다. 위치는 호출하는 쪽이 정하고,
 * `fixed`를 주면 화면 아래에 붙습니다. 총액은 `PriceBarTotal`, 버튼 묶음은 `PriceBarActions`로 넣습니다.
 */
export function PriceBar({
  fixed = false,
  className,
  'aria-label': ariaLabel = '견적 요약',
  ...props
}: PriceBarProps) {
  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className={cn(
        'border-border bg-background text-foreground flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] font-sans',
        fixed && 'fixed inset-x-0 bottom-0 z-40',
        className,
      )}
      {...props}
    />
  );
}

export type PriceBarTotalProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** 총액 위에 보이는 이름 */
  label?: string;
  amount: number;
  /** 총액 아래 보조 문구 (예: "취득세와 부대비용 별도") */
  note?: ReactNode;
};

/**
 * 총액을 숫자가 굴러가며 바뀌는 모양으로 보여 줍니다. 눈에 보이는 숫자는 스크린 리더에서 숨기고, 바뀔 때마다
 * 조용한 알림(`role="status"`)으로 "이름 + 금액"을 읽어 줍니다. 금액이 연달아 바뀌면 멈춘 뒤 최종 금액만 알립니다.
 */
export function PriceBarTotal({
  label = '예상 견적 금액',
  amount,
  note,
  className,
  ...props
}: PriceBarTotalProps) {
  // 처음 값으로 시작해 첫 그리기는 알리지 않고, 바뀐 금액은 잠시 멈춘 뒤에 알린다.
  const [announced, setAnnounced] = useState(amount);
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnnounced(amount);
    }, ANNOUNCE_DELAY);
    return () => {
      clearTimeout(timer);
    };
  }, [amount]);

  return (
    <div className={cn('flex min-w-0 flex-col', className)} {...props}>
      <span aria-hidden className="text-muted-foreground text-caption">
        {label}
      </span>
      <span aria-hidden className="text-title font-semibold tracking-tight">
        <AnimatedAmount value={amount} />
      </span>
      <span role="status" className="sr-only">
        {label} {formatWon(announced)}
      </span>
      {note ? <span className="text-muted-foreground text-caption">{note}</span> : null}
    </div>
  );
}

export function PriceBarActions({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex flex-wrap items-center gap-2', className)} {...props} />;
}

export type PriceBreakdownProps = Omit<ComponentProps<'div'>, 'title'> & {
  /** 묶음의 이름 (예: "외장·내장") */
  title?: ReactNode;
};

/** 항목별 금액 목록입니다. 제목이 있으면 목록이 그 이름의 그룹으로 읽힙니다. */
export function PriceBreakdown({ title, className, children, ...props }: PriceBreakdownProps) {
  const titleId = useId();

  return (
    <div
      role={title ? 'group' : undefined}
      aria-labelledby={title ? titleId : undefined}
      className={cn('font-sans', className)}
      {...props}
    >
      {title ? (
        <p id={titleId} className="text-foreground mb-1 text-sm font-semibold">
          {title}
        </p>
      ) : null}
      <dl className="m-0 flex flex-col">{children}</dl>
    </div>
  );
}

export type PriceRowProps = Omit<ComponentProps<'div'>, 'children'> & {
  label: ReactNode;
  /** 숫자면 원 단위로 서식을 맞춥니다. 문자나 노드("기본 포함")는 그대로 보입니다. */
  amount: ReactNode;
  /** 숫자 금액 앞에 부호를 붙입니다 (옵션 가격 변동 등). */
  signed?: boolean;
  /** 라벨 옆에 놓는 동작 (예: "변경" 링크). 어떤 항목인지 `aria-label`로 알리십시오. */
  action?: ReactNode;
  /** 합계 줄. 굵게 보이고 위에 선이 그어집니다. */
  total?: boolean;
};

export function PriceRow({
  label,
  amount,
  signed = false,
  action,
  total = false,
  className,
  ...props
}: PriceRowProps) {
  return (
    <div
      className={cn(
        'flex items-baseline justify-between gap-4 py-2 text-sm',
        total && 'border-border mt-1 border-t pt-3 font-semibold',
        className,
      )}
      {...props}
    >
      <dt className={cn('flex min-w-0 items-baseline gap-2', !total && 'text-muted-foreground')}>
        <span className="wrap-break-word">{label}</span>
        {action}
      </dt>
      <dd className="m-0 shrink-0 text-right tabular-nums">
        {typeof amount === 'number' ? formatWon(amount, signed) : amount}
      </dd>
    </div>
  );
}
