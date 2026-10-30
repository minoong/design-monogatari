'use client';

import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { AnimatedAmount } from '@/ui/animated-amount';
import { cn } from '@/lib/utils';

const KRW = new Intl.NumberFormat('ko-KR');

/** 금액 표기: `symbol`(기본)은 "₩1,000", `won`은 "1,000원"입니다. */
export type PriceCurrency = 'won' | 'symbol';

// 막대(`PriceBar`)와 목록(`PriceBreakdown`)이 정하고, 안의 총액과 행이 따른다. 한 화면의 표기가 섞이지 않게 한 곳에서 고른다.
const CurrencyContext = createContext<PriceCurrency>('symbol');

/** 총액이 멈춘 뒤 이만큼 기다렸다가 스크린 리더에 알립니다(ms). */
const ANNOUNCE_DELAY = 500;

/** 총액이 줄어들 수 있는 가장 작은 크기입니다(제목 글자 크기의 절반, 28px 기준 14px). */
const MIN_FIT_SCALE = 0.5;

/** 글자 크기가 바뀔 때 이전 크기에서 새 크기로 커지거나 작아지는 시간(ms)과 곡선입니다. */
const FIT_DURATION = 180;
const FIT_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';

/**
 * 금액이 자리(막대에서 버튼을 뺀 폭)보다 길면 글자를 그 폭에 맞게 줄입니다. 글자 폭은 크기에 비례하므로
 * 지금 폭과 자리의 비율로 한 번에 구하고(반복 측정 없음), 값이나 자리 폭이 바뀔 때만 다시 잽니다.
 * 가장 작은 크기로도 자리에 안 들어가는 폭이면 총액 칸의 최소 폭을 그 크기의 글자 폭으로 잡아, 막대가 줄바꿈될 때
 * 총액이 버튼과 겹치지 않고 자기 줄로 내려가게 합니다(막대가 `flex-wrap`일 때).
 * 크기는 바로 바뀌고, 눈에 보이는 변화만 이전 크기에서 `transform: scale`로 부드럽게 이어 붙입니다(`scaler`).
 * 폭 측정은 변형의 영향을 받지 않는 `text`에서 하므로 움직이는 동안에도 맞춤 계산이 어긋나지 않습니다.
 * 감소 모션이면 움직이지 않습니다. 줄어드는 순간 잠깐 커 보이는 글자가 버튼을 침범하지 않게 `box`가 가로로 잘라 냅니다.
 * 반환한 `box`는 자리를 재는 바깥, `text`는 `em`으로 줄어드는 안쪽, `scaler`는 그 안에서 변형으로 움직이는 겹,
 * `label`은 줄이지 않는 이름표에 붙입니다.
 */
function useFitText() {
  const box = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  const scaler = useRef<HTMLSpanElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const boxEl = box.current;
    const textEl = text.current;
    const scalerEl = scaler.current;
    const labelEl = label.current;
    // 최소 폭은 `min-w-0`인 총액 칸(`box`의 부모)에 걸어야 줄바꿈 판단에 쓰인다.
    const root = boxEl?.parentElement;
    if (!boxEl || !textEl || !scalerEl || !root) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    // 처음 맞출 때는 움직이지 않는다(첫 그리기에서 커졌다 작아지지 않게).
    let settled = false;
    // 방금 넘쳐서 줄인 크기. 글자 폭은 크기에 정확히 비례하지 않아(힌팅) 줄인 크기가 자리에 꼭 들어맞으면
    // 비례 계산이 도로 키우고 다시 넘쳐 줄이는 진동이 생기므로, 같은 자리와 같은 글자에서는 그 크기 이상으로 키우지 않는다.
    let overflowed: { size: number; available: number; perEm: number } | null = null;

    const fit = () => {
      // 소수 오차로 0.01 크기가 한 프레임마다 오르내리지 않게 1px 여유를 둔다(키우면 곧 넘쳐 다시 줄어드는 되먹임).
      const available = boxEl.clientWidth - 1;
      const natural = textEl.getBoundingClientRect().width;
      if (available <= 0 || natural === 0) return;
      const current = parseFloat(textEl.style.fontSize) || 1;
      const perEm = natural / current;
      let next = Math.min(
        1,
        Math.max(MIN_FIT_SCALE, Math.floor((current * available * 100) / natural) / 100),
      );
      if (next < current) {
        overflowed = { size: current, available, perEm };
      } else if (
        next > current &&
        overflowed &&
        next >= overflowed.size &&
        available <= overflowed.available &&
        Math.abs(perEm - overflowed.perEm) / overflowed.perEm < 0.005
      ) {
        next = current;
      }
      // 줄인 글자가 다시 폭을 바꿔 관찰자를 되부르므로, 반올림 오차 안의 변화는 무시한다.
      if (Math.abs(next - current) > 0.005) {
        textEl.style.fontSize = `${next}em`;
        if (settled && !reduceMotion.matches) {
          scalerEl.getAnimations().forEach((animation) => {
            animation.cancel();
          });
          scalerEl.animate([{ transform: `scale(${current / next})` }, { transform: 'scale(1)' }], {
            duration: FIT_DURATION,
            easing: FIT_EASING,
          });
        }
      }
      // 이름표는 줄이지 않으므로 최소 폭에 이름표의 폭도 담는다(이름표가 "예상 견적 금 / 액"으로 꺾이지 않게).
      const labelWidth = labelEl?.getBoundingClientRect().width ?? 0;
      root.style.minWidth = `${Math.ceil(Math.max(labelWidth, (natural / current) * MIN_FIT_SCALE)) + 1}px`;
    };

    fit();
    settled = true;
    const observer = new ResizeObserver(fit);
    observer.observe(boxEl);
    observer.observe(textEl);
    if (labelEl) observer.observe(labelEl);
    return () => {
      observer.disconnect();
    };
  }, []);

  return { box, text, scaler, label };
}

// 낭독용 글은 기본이 "원"으로 쓴 금액이다(낭독기마다 "₩"을 읽는 방식이 달라서).
function formatWon(amount: number, signed = false, currency: PriceCurrency = 'won') {
  const rounded = Math.round(amount);
  const sign = signed && rounded > 0 ? '+' : rounded < 0 ? '−' : '';
  const digits = KRW.format(Math.abs(rounded));
  return currency === 'symbol' ? `${sign}₩${digits}` : `${sign}${digits}원`;
}

export type PriceBarProps = ComponentProps<'div'> & {
  /** 화면 아래에 붙입니다. 기기의 하단 안전 영역을 비웁니다. */
  fixed?: boolean;
  /** 안의 `PriceBarTotal`이 쓰는 금액 표기. 기본 `symbol`은 "₩1,000", `won`은 "1,000원"입니다. */
  currency?: PriceCurrency;
};

/**
 * 견적 총액, 요약 열기 버튼, 이전·다음 버튼을 한 줄에 모은 막대입니다. 위치는 호출하는 쪽이 정하고,
 * `fixed`를 주면 화면 아래에 붙습니다. 총액은 `PriceBarTotal`, 버튼 묶음은 `PriceBarActions`로 넣습니다.
 */
export function PriceBar({
  fixed = false,
  currency = 'symbol',
  className,
  'aria-label': ariaLabel = '견적 요약',
  ...props
}: PriceBarProps) {
  return (
    <CurrencyContext value={currency}>
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
    </CurrencyContext>
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
  const { box, text, scaler, label: labelRef } = useFitText();
  const currency = useContext(CurrencyContext);
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
    <div className={cn('flex min-w-0 flex-1 basis-0 flex-col', className)} {...props}>
      <span
        ref={labelRef}
        aria-hidden
        className="text-muted-foreground text-caption self-start whitespace-nowrap"
      >
        {label}
      </span>
      <div
        ref={box}
        aria-hidden
        className="text-title min-w-0 overflow-x-clip font-semibold tracking-tight"
      >
        <span ref={text} className="inline-block whitespace-nowrap">
          <span ref={scaler} className="inline-block origin-left">
            <AnimatedAmount
              value={amount}
              prefix={currency === 'symbol' ? '₩' : ''}
              suffix={currency === 'symbol' ? '' : '원'}
            />
          </span>
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
  /** 안의 `PriceRow`가 쓰는 금액 표기. 기본 `symbol`은 "₩1,000", `won`은 "1,000원"입니다. */
  currency?: PriceCurrency;
};

/** 항목별 금액 목록입니다. 제목이 있으면 목록이 그 이름의 그룹으로 읽힙니다. */
export function PriceBreakdown({
  title,
  currency = 'symbol',
  className,
  children,
  ...props
}: PriceBreakdownProps) {
  const titleId = useId();

  return (
    <CurrencyContext value={currency}>
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
    </CurrencyContext>
  );
}

export type PriceRowProps = Omit<ComponentProps<'div'>, 'children'> & {
  label: ReactNode;
  /** 숫자면 원 단위로 서식을 맞춥니다(표기는 `PriceBreakdown`의 `currency`). 문자나 노드("기본 포함")는 그대로 보입니다. */
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
  const currency = useContext(CurrencyContext);

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
        {typeof amount !== 'number' ? (
          amount
        ) : currency === 'symbol' ? (
          // 낭독기마다 "₩"을 읽는 방식이 달라, 보이는 표기는 숨기고 "원"으로 쓴 같은 금액을 읽게 한다.
          <>
            <span aria-hidden>{formatWon(amount, signed, currency)}</span>
            <span className="sr-only">{formatWon(amount, signed)}</span>
          </>
        ) : (
          formatWon(amount, signed)
        )}
      </dd>
    </div>
  );
}
