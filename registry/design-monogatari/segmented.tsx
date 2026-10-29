'use client';

import { animate, useMotionValue, useReducedMotion } from 'motion/react';
import * as motion from 'motion/react-client';
import {
  type ComponentProps,
  createContext,
  type HTMLAttributes,
  type ReactNode,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { cn } from '@/lib/utils';
import { SPRING } from '@/lib/motion';

export type SegmentedIndicator = 'pill' | 'underline' | 'ring';

type SegmentedContextValue = {
  name: string;
  value: string | undefined;
  indicator: SegmentedIndicator;
  setValue: (value: string) => void;
};

const SegmentedContext = createContext<SegmentedContextValue | null>(null);

function useSegmented() {
  const context = useContext(SegmentedContext);
  if (!context) throw new Error('SegmentedItem은 Segmented 안에서만 쓸 수 있습니다.');
  return context;
}

type SegmentedName =
  | { 'aria-label': string; 'aria-labelledby'?: never }
  | { 'aria-labelledby': string; 'aria-label'?: never };

export type SegmentedProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue' | 'role' | 'aria-label' | 'aria-labelledby'
> &
  SegmentedName & {
    /** 선택된 값(제어). 주지 않으면 `defaultValue`로 시작하는 비제어입니다. */
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    /** 라디오의 `name`. 폼으로 보낼 때 쓰고, 주지 않으면 알아서 만듭니다. */
    name?: string;
    /**
     * 선택 표시의 모양. `pill`은 선택된 항목 뒤에 배경이 채워진 알약, `underline`은 아래 막대, `ring`은 테두리 링입니다.
     * 어느 모양이든 선택이 바뀌면 이전 항목에서 새 항목으로 미끄러집니다.
     */
    indicator?: SegmentedIndicator;
    children: ReactNode;
  };

const GROUP_CLASSES: Record<SegmentedIndicator, string> = {
  pill: 'bg-muted rounded-pill p-1',
  underline: 'border-border border-b',
  ring: 'gap-1',
};

/**
 * 선택 표시는 그룹 안에 하나만 두고, 선택된 항목의 위치로 옮긴다. 위치는 그룹 상자 기준의 차이로 잰다. 표시를 항목마다 만들고 `layoutId`로
 * 잇는 방식은 조상이 움직이면 그것을 표시의 이동으로 오해했다(차량 영역이 줄어 세그먼트가 통째로 135px 밀리자 표시만 뒤늦게 따라왔다).
 * 그룹 기준의 차이는 조상이 어디로 가든 변하지 않는다.
 */
function targetOf(
  group: HTMLElement,
  item: HTMLElement,
  indicator: SegmentedIndicator,
): { x: number; y: number; w: number; h: number } {
  const box = group.getBoundingClientRect();
  const at = item.getBoundingClientRect();
  // `getBoundingClientRect`는 소수까지 주므로 `offsetLeft`처럼 정수로 반올림돼 어긋나지 않는다. 절대 위치의 기준은 그룹의 안쪽 상자(테두리 안)다.
  const x = at.left - box.left - group.clientLeft;
  const y = at.top - box.top - group.clientTop;
  // 막대는 항목 아래 가장자리에 걸친 2px 선이다(아래 -1px).
  if (indicator === 'underline') return { x, y: y + at.height - 1, w: at.width, h: 2 };
  return { x, y, w: at.width, h: at.height };
}

/**
 * 둘에서 넷쯤 되는 선택지 중 하나를 고르는 묶음입니다. 보이는 모양은 알약이지만 속은 네이티브 라디오라서 같은 `name`끼리 방향키
 * 이동, 폼 전송, 접근성 의미(`radiogroup`)를 브라우저가 처리합니다. `aria-label`(또는 `aria-labelledby`)로 이름을 주십시오.
 */
export function Segmented({
  value,
  defaultValue,
  onValueChange,
  name,
  indicator = 'pill',
  className,
  children,
  ...props
}: SegmentedProps) {
  const generatedName = useId();
  const [inner, setInner] = useState(defaultValue);
  const current = value ?? inner;
  const groupRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  // 표시 요소는 한 번 만든 뒤 계속 둔다(선택이 바뀌는 사이에 지우면 새 항목에서 "처음 배치"로 점프한다).
  const [mounted, setMounted] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const width = useMotionValue(0);
  const height = useMotionValue(0);
  const placed = useRef(false);

  useLayoutEffect(() => {
    const group = groupRef.current;
    const item = group?.querySelector<HTMLInputElement>('input:checked')?.closest('label');
    if (!group || !item) return;
    const target = () => targetOf(group, item, indicator);
    const next = target();
    if (!placed.current || reduceMotion) {
      x.set(next.x);
      y.set(next.y);
      width.set(next.w);
      height.set(next.h);
      placed.current = true;
      setMounted(true);
    } else {
      void animate(x, next.x, SPRING.settle);
      void animate(y, next.y, SPRING.settle);
      void animate(width, next.w, SPRING.settle);
      void animate(height, next.h, SPRING.settle);
    }
    // 항목이나 그룹의 크기가 바뀌면(창 크기, 글꼴, 글자) 애니메이션 없이 따라간다.
    const observer = new ResizeObserver(() => {
      const resized = target();
      x.set(resized.x);
      y.set(resized.y);
      width.set(resized.w);
      height.set(resized.h);
    });
    observer.observe(item);
    observer.observe(group);
    return () => {
      observer.disconnect();
    };
  }, [current, indicator, reduceMotion, x, y, width, height]);

  return (
    <SegmentedContext.Provider
      value={{
        name: name ?? generatedName,
        value: current,
        indicator,
        setValue: (next) => {
          if (value === undefined) setInner(next);
          onValueChange?.(next);
        },
      }}
    >
      <div
        {...props}
        ref={groupRef}
        role="radiogroup"
        className={cn('relative inline-flex items-stretch', GROUP_CLASSES[indicator], className)}
      >
        {mounted ? (
          // 선택된 항목 뒤를 따라 미끄러지는 표시. 항목보다 앞(DOM)에 있어서 항목의 글자와 포커스 링이 항상 위에 그려진다.
          // 감소 모션이면 미끄러지지 않고 바로 옮겨 간다.
          <motion.span
            aria-hidden
            className={cn(
              'pointer-events-none absolute top-0 left-0',
              INDICATOR_CLASSES[indicator],
            )}
            style={{ x, y, width, height }}
          />
        ) : null}
        {children}
      </div>
    </SegmentedContext.Provider>
  );
}

export type SegmentedItemProps = Omit<ComponentProps<'label'>, 'onChange'> & {
  value: string;
  disabled?: boolean;
};

const ITEM_CLASSES: Record<SegmentedIndicator, string> = {
  // 알약은 트랙 패딩(4px)이 포커스 아웃라인(2px)과 간격(2px)을 합친 것과 같아 링이 트랙 가장자리에 붙는다. 간격을 없앤다.
  // 호버: 고를 수 있는 선택 안 된 항목에만 배경을 깔아, 호버로 글자만 진해져 선택된 항목과 헷갈리는 것을 막는다. 알약은 트랙(`bg-muted`) 위라
  // 호버 배경(`secondary-hover`)이 보이지 않는다. 선택된 알약(`bg-background`)과 반대로 글자색(`foreground`)을 옅게 깐다: 라이트에서는 트랙보다 살짝 어둡고, 다크에서는 살짝 밝아서 선택된 알약(트랙보다 밝은 흰색/어두운 검정, 테두리 있음)과 갈린다.
  pill: 'rounded-pill has-[input:focus-visible]:outline-offset-0 has-[input:not(:checked):not(:disabled)]:hover:bg-foreground/8 h-9 px-4',
  underline:
    'has-[input:not(:checked):not(:disabled)]:hover:bg-secondary-hover rounded-md h-11 px-4',
  ring: 'rounded-md has-[input:not(:checked):not(:disabled)]:hover:bg-secondary-hover h-9 px-4',
};

const INDICATOR_CLASSES: Record<SegmentedIndicator, string> = {
  // 알약의 채움(`bg-background`)은 트랙과 거의 같은 밝기라 헤어라인 `border-border`로 윤곽을 낸다. 진한 테두리(`muted-foreground`)는 마음에
  // 들지 않아 연하게 두었다. 대비는 3:1에 못 미치므로(라이트 1.4:1, 다크 1.6:1) 선택은 글자색(4.66→16.83)이 함께 알린다.
  // 강제 색상 모드는 배경을 지우므로 막대는 `Highlight` 배경, 알약과 링은 `Highlight` 테두리로 남긴다.
  pill: 'bg-background border-border rounded-pill border forced-colors:border-[Highlight]',
  underline: 'bg-primary forced-colors:bg-[Highlight]',
  ring: 'border-primary ring-primary rounded-md border ring-1 forced-colors:border-[Highlight]',
};

export function SegmentedItem({
  value,
  disabled,
  className,
  children,
  ...props
}: SegmentedItemProps) {
  const { name, value: current, indicator, setValue } = useSegmented();
  const checked = current === value;

  return (
    <label
      className={cn(
        'text-muted-foreground hover:text-foreground relative flex min-w-0 cursor-pointer items-center justify-center text-sm font-medium whitespace-nowrap select-none',
        'has-[input:checked]:text-foreground',
        'has-[input:focus-visible]:outline-ring has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2',
        'has-[input:disabled]:hover:text-muted-foreground has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50',
        ITEM_CLASSES[indicator],
        className,
      )}
      {...props}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => setValue(value)}
        className="peer sr-only"
      />
      {/* 글자는 표시보다 위에 둔다: 표시가 옆 항목으로 미끄러져 지나갈 때 그 항목의 글자를 가리지 않게 한다. */}
      <span className="relative z-10">{children}</span>
    </label>
  );
}
