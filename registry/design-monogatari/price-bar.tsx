'use client';

import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { AnimatedAmount } from '@/ui/animated-amount';
import { cn } from '@/lib/utils';

const KRW = new Intl.NumberFormat('ko-KR');

/** 총액이 멈춘 뒤 이만큼 기다렸다가 스크린 리더에 알립니다(ms). */
const ANNOUNCE_DELAY = 500;

/** 총액이 줄어들 수 있는 가장 작은 크기입니다(제목 글자 크기의 절반, 28px 기준 14px). */
const MIN_FIT_SCALE = 0.5;

/**
 * 금액이 자리(막대에서 버튼을 뺀 폭)보다 길면 글자를 그 폭에 맞게 줄입니다. 글자 폭은 크기에 비례하므로
 * 지금 폭과 자리의 비율로 한 번에 구하고(반복 측정 없음), 값이나 자리 폭이 바뀔 때만 다시 잽니다.
 * 가장 작은 크기로도 자리에 안 들어가는 폭이면 총액 칸의 최소 폭을 그 크기의 글자 폭으로 잡아, 막대가 줄바꿈될 때
 * 총액이 버튼과 겹치지 않고 자기 줄로 내려가게 합니다(막대가 `flex-wrap`일 때).
 * 반환한 `box`는 자리를 재는 바깥, `text`는 `em`으로 줄어드는 안쪽, `label`은 줄이지 않는 이름표에 붙입니다.
 */
function useFitText() {
  const box = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const boxEl = box.current;
    const textEl = text.current;
    const labelEl = label.current;
    // 최소 폭은 `min-w-0`인 총액 칸(`box`의 부모)에 걸어야 줄바꿈 판단에 쓰인다.
    const root = boxEl?.parentElement;
    if (!boxEl || !textEl || !root) return;

    const fit = () => {
      // 소수 오차로 0.01 크기가 한 프레임마다 오르내리지 않게 1px 여유를 둔다(키우면 곧 넘쳐 다시 줄어드는 되먹임).
      const available = boxEl.clientWidth - 1;
      const natural = textEl.getBoundingClientRect().width;
      if (available <= 0 || natural === 0) return;
      const current = parseFloat(textEl.style.fontSize) || 1;
      const next = Math.min(
        1,
        Math.max(MIN_FIT_SCALE, Math.floor((current * available * 100) / natural) / 100),
      );
      // 줄인 글자가 다시 폭을 바꿔 관찰자를 되부르므로, 반올림 오차 안의 변화는 무시한다.
      if (Math.abs(next - current) > 0.005) textEl.style.fontSize = `${next}em`;
      // 이름표는 줄이지 않으므로 최소 폭에 이름표의 폭도 담는다(이름표가 "예상 견적 금 / 액"으로 꺾이지 않게).
      const labelWidth = labelEl?.getBoundingClientRect().width ?? 0;
      root.style.minWidth = `${Math.ceil(Math.max(labelWidth, (natural / current) * MIN_FIT_SCALE)) + 1}px`;
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(boxEl);
    observer.observe(textEl);
    if (labelEl) observer.observe(labelEl);
    return () => {
      observer.disconnect();
    };
  }, []);

  return { box, text, label };
}

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
  const { box, text, label: labelRef } = useFitText();
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
    <div className={cn('flex min-w-0 flex-1 basis-0 flex-col', className)} {...props}>
      <span
        ref={labelRef}
        aria-hidden
        className="text-muted-foreground text-caption self-start whitespace-nowrap"
      >
        {label}
      </span>
      <div ref={box} aria-hidden className="text-title min-w-0 font-semibold tracking-tight">
        <span ref={text} className="inline-block whitespace-nowrap">
          <AnimatedAmount value={amount} />
        </span>
      </div>
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
  /** 라벨과 금액 사이의 오른쪽 끝에 놓는 동작 (예: "변경" 링크). 어떤 항목인지 `aria-label`로 알리십시오. */
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
      <dt
        className={cn(
          'flex min-w-0 flex-1 items-baseline justify-between gap-2',
          !total && 'text-muted-foreground',
        )}
      >
        <span className="wrap-break-word">{label}</span>
        {action ? <span className="shrink-0">{action}</span> : null}
      </dt>
      <dd className="m-0 shrink-0 text-right tabular-nums">
        {typeof amount === 'number' ? formatWon(amount, signed) : amount}
      </dd>
    </div>
  );
}
