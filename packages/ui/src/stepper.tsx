'use client';

import { Slot, Slottable } from '@radix-ui/react-slot';
import { motion, useReducedMotion } from 'motion/react';
import {
  type ComponentProps,
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import { CheckIcon } from './icons/check';
import { useCheckPhase } from './lib/check-phase';
import { cn } from './lib/cn';
import { SPRING } from './lib/motion';

export type StepperIndicator = 'pill' | 'underline' | 'ring';

const StepperContext = createContext<{
  value?: string;
  gliderId?: string;
  indicator: StepperIndicator;
}>({ indicator: 'pill' });

export type StepperProps = ComponentProps<'nav'> & {
  /** 현재 단계의 `StepperItem` value */
  value?: string;
  /**
   * 현재 단계 표시의 모양. `pill`은 항목 뒤에 채워진 알약(기본), `underline`은 아래 막대, `ring`은 테두리 링입니다.
   * 어느 모양이든 단계가 바뀌면 이전 단계에서 새 단계로 미끄러집니다.
   */
  indicator?: StepperIndicator;
};

/**
 * 여러 단계를 링크로 보여 주는 내비게이션. `nav` 안에 번호가 붙는 `ol`을 그린다.
 * 현재 단계가 바뀌면 가로로 스크롤되는 목록 안에서 그 단계를 가운데로 옮긴다.
 * `aria-label`로 "견적 단계" 같은 이름을 반드시 붙인다.
 */
export function Stepper({
  value,
  indicator = 'pill',
  className,
  children,
  ...props
}: StepperProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const reduceMotion = useReducedMotion();
  const gliderId = useId();
  // 목록이 넘칠 때 잘리는 쪽 가장자리를 흐리게 해서 더 있다는 것을 알린다.
  const [edge, setEdge] = useState<'none' | 'start' | 'middle' | 'end'>('none');

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const update = () => {
      const max = list.scrollWidth - list.clientWidth;
      if (max <= 1) setEdge('none');
      else if (list.scrollLeft <= 1) setEdge('start');
      else if (list.scrollLeft >= max - 1) setEdge('end');
      else setEdge('middle');
    };
    update();
    list.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(list);
    return () => {
      list.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const list = listRef.current;
    const current = list?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!list || !current) return;
    const left = current.offsetLeft - (list.clientWidth - current.offsetWidth) / 2;
    list.scrollTo({ left: Math.max(0, left), behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [value, reduceMotion]);

  return (
    <StepperContext.Provider value={{ value, gliderId, indicator }}>
      <nav className={cn('font-sans', className)} data-edge={edge} {...props}>
        {/* list-style: none 이면 Safari/VoiceOver 가 목록 역할을 버리므로 role 을 명시한다 */}
        {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
        <ol
          ref={listRef}
          role="list"
          className="relative m-0 flex scroll-px-2 scrollbar-none list-none gap-1 overflow-x-auto p-1 [counter-reset:step] in-data-[edge=end]:mask-[linear-gradient(to_right,transparent,black_2rem)] in-data-[edge=middle]:mask-[linear-gradient(to_right,transparent,black_2rem,black_calc(100%-2rem),transparent)] in-data-[edge=start]:mask-[linear-gradient(to_right,black_calc(100%-2rem),transparent)] [&::-webkit-scrollbar]:hidden"
        >
          {children}
        </ol>
      </nav>
    </StepperContext.Provider>
  );
}

const ITEM_RADIUS: Record<StepperIndicator, string> = {
  pill: 'rounded-pill',
  underline: 'rounded-md',
  ring: 'rounded-md',
};

// 알약은 `bg-muted`가 호버 배경(`secondary-hover`)과 라이트에서 같아서 헤어라인 `border-border` 테두리로 호버와 구분한다(Segmented의 알약과 같다). 진한 테두리는 마음에 들지 않아 연하게 두었고, 구분은 파란 번호 배지와 굵은 글자가 더 맡는다. 강제 색상 모드는 배경을 지우므로
// 알약과 링은 `Highlight` 테두리가 현재 단계를 남기고, 막대는 안쪽 요소가 `Highlight` 배경이 된다.
const INDICATOR_CLASSES: Record<StepperIndicator, string> = {
  pill: 'bg-muted border-border rounded-pill inset-0 -z-10 border forced-colors:border-[Highlight]',
  underline: 'inset-x-0 -bottom-px h-0.5 px-[inherit]',
  ring: 'border-primary ring-primary inset-0 -z-10 rounded-md border ring-1 forced-colors:border-[Highlight]',
};

export type StepperItemProps = ComponentProps<'a'> & {
  /** 이 단계의 값. `Stepper`의 `value`와 같으면 현재 단계가 된다. */
  value: string;
  /** 끝낸 단계. 번호 대신 체크 표시가 붙고 스크린 리더에 "완료"가 읽힌다. */
  completed?: boolean;
  /** 링크 대신 자식 요소(예: Next `Link`)에 스타일을 입힌다 (Radix Slot). */
  asChild?: boolean;
  /** `completed`일 때 스크린 리더에 읽힐 말 */
  completedLabel?: string;
};

/** 한 단계. 번호는 목록 순서대로 CSS 카운터가 붙이고, 현재 단계에는 `aria-current="step"`이 붙는다. */
export function StepperItem({
  value,
  completed = false,
  asChild = false,
  completedLabel = '완료',
  className,
  children,
  onFocus,
  ...props
}: StepperItemProps) {
  const { value: currentValue, gliderId, indicator } = useContext(StepperContext);
  const reduceMotion = useReducedMotion();
  const current = currentValue === value;
  const Comp = asChild ? Slot : 'a';
  // 단계를 끝낸 순간에만 체크가 그려진다. 처음부터 끝난 단계는 움직이지 않는다.
  const noInput = useRef<HTMLInputElement>(null);
  const checkPhase = useCheckPhase(completed, noInput);

  return (
    <li className="shrink-0">
      <Comp
        aria-current={current ? 'step' : undefined}
        onFocus={(event) => {
          onFocus?.(event);
          // 일부만 보이는 항목은 브라우저가 스크롤하지 않아 포커스 링이 잘린다. scroll-px 만큼 여유를 두고 맞춘다.
          event.currentTarget.scrollIntoView({
            inline: 'nearest',
            block: 'nearest',
            behavior: reduceMotion ? 'auto' : 'smooth',
          });
        }}
        data-completed={completed ? '' : undefined}
        className={cn(
          'text-muted-foreground hover:bg-secondary-hover hover:text-foreground relative isolate flex min-h-11 items-center gap-2 px-3 text-sm font-medium whitespace-nowrap no-underline transition-[background-color,color] motion-reduce:transition-none',
          ITEM_RADIUS[indicator],
          'focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2',
          'aria-[current=step]:text-foreground aria-[current=step]:font-semibold',
          'data-completed:text-foreground',
          className,
        )}
        {...props}
      >
        <span
          aria-hidden
          className={cn(
            'border-border bg-background flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold tabular-nums [counter-increment:step]',
            "before:content-[counter(step)] data-done:before:content-['']",
            'data-[state=completed]:bg-muted data-[state=completed]:text-foreground',
            'data-[state=current]:border-primary data-[state=current]:bg-primary data-[state=current]:text-primary-foreground',
          )}
          // 현재 단계이면서 끝낸 단계여도 색 조합이 섞이지 않게 상태를 하나로 정한다.
          data-state={current ? 'current' : completed ? 'completed' : 'idle'}
          data-done={completed ? '' : undefined}
        >
          {completed ? (
            <CheckIcon isHovered={checkPhase === 'in'} size={14} strokeWidth={3} />
          ) : null}
        </span>
        <Slottable>{children}</Slottable>
        {completed ? <span className="sr-only">({completedLabel})</span> : null}
        {current ? (
          // 현재 단계의 표시. 단계가 바뀌면 이전 항목에서 새 항목으로 미끄러진다. 항목이 `isolate`라 알약과 링의 `-z-10`이 항목
          // 안에 머물고, 항목의 호버 배경 위, 번호와 글자 아래에 그려진다.
          <motion.span
            aria-hidden
            layoutId={`${gliderId}-glider`}
            className={cn('pointer-events-none absolute', INDICATOR_CLASSES[indicator])}
            transition={reduceMotion ? { duration: 0 } : SPRING.settle}
          >
            {indicator === 'underline' ? (
              // 막대는 바깥 요소의 좌우 안쪽 여백(`padding-inline: inherit`)을 물려받아 글자와 번호 칸에 맞는다.
              <span className="bg-primary block size-full rounded-full forced-colors:bg-[Highlight]" />
            ) : null}
          </motion.span>
        ) : null}
      </Comp>
    </li>
  );
}
