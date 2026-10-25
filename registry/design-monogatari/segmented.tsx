'use client';

import { useReducedMotion } from 'motion/react';
import * as motion from 'motion/react-client';
import {
  type ComponentProps,
  createContext,
  type HTMLAttributes,
  type ReactNode,
  useContext,
  useId,
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
  indicatorId: string;
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
  const indicatorId = useId();
  const [inner, setInner] = useState(defaultValue);
  const current = value ?? inner;

  return (
    <SegmentedContext.Provider
      value={{
        name: name ?? generatedName,
        value: current,
        indicator,
        indicatorId,
        setValue: (next) => {
          if (value === undefined) setInner(next);
          onValueChange?.(next);
        },
      }}
    >
      <div
        {...props}
        role="radiogroup"
        className={cn('inline-flex items-stretch', GROUP_CLASSES[indicator], className)}
      >
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
  pill: 'rounded-pill has-[input:focus-visible]:outline-offset-0 h-9 px-4',
  underline: 'h-11 px-4',
  ring: 'rounded-md h-9 px-4',
};

const INDICATOR_CLASSES: Record<SegmentedIndicator, string> = {
  // 알약의 채움(`bg-background`)은 트랙과 거의 같은 밝기라 윤곽을 `border-muted-foreground`로 3:1 이상 낸다.
  // 강제 색상 모드는 배경을 지우므로 막대는 `Highlight` 배경, 알약과 링은 `Highlight` 테두리로 남긴다.
  pill: 'bg-background border-muted-foreground rounded-pill border forced-colors:border-[Highlight]',
  underline: 'bg-primary inset-x-0 -bottom-px top-auto h-0.5 forced-colors:bg-[Highlight]',
  ring: 'border-primary ring-primary rounded-md border ring-1 forced-colors:border-[Highlight]',
};

export function SegmentedItem({
  value,
  disabled,
  className,
  children,
  ...props
}: SegmentedItemProps) {
  const { name, value: current, indicator, indicatorId, setValue } = useSegmented();
  const reduceMotion = useReducedMotion();
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
      {checked ? (
        // 선택된 항목 뒤에서 항목 사이를 미끄러지는 표시. 감소 모션이면 미끄러지지 않고 바로 옮겨 간다.
        <motion.span
          aria-hidden
          layoutId={`${indicatorId}-indicator`}
          className={cn('pointer-events-none absolute inset-0', INDICATOR_CLASSES[indicator])}
          transition={reduceMotion ? { duration: 0 } : SPRING.settle}
        />
      ) : null}
      <span className="relative">{children}</span>
    </label>
  );
}
