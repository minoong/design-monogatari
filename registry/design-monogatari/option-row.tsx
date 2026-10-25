'use client';

import { animate, useMotionValue, useReducedMotion } from 'motion/react';
import * as motion from 'motion/react-client';
import {
  type ComponentProps,
  createContext,
  forwardRef,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useCheckPhase } from '@/lib/check-phase';
import { cn } from '@/lib/utils';
import { SPRING } from '@/lib/motion';

/**
 * `OptionGroup` 안의 행들이 선택된 행을 묶음에 알리는 통로. 묶음이 선택 테두리 요소를 하나만 두고 선택된 행의 위치로 옮긴다.
 * 묶음 밖의 행은 CSS로 그린다. (행마다 테두리를 만들고 없애며 `layoutId`로 잇는 방식은 DOM에서 뒤에 있는 행에 가려지고, 마운트 순서에 따라
 * 이동이 생략되는 문제가 있어 버렸다.)
 */
const OptionGroupContext = createContext<{
  claim: (row: HTMLElement) => void;
  release: (row: HTMLElement) => void;
} | null>(null);

/** 체크 상태. 제어면 `checked`를 따르고, 비제어면 문서의 `change`를 들어 입력의 `checked`를 따라간다(라디오는 새로 선택되는 쪽에서만 이벤트가 난다). */
function useIsChecked(
  checked: boolean | undefined,
  defaultChecked: boolean | undefined,
  inputRef: React.RefObject<HTMLInputElement | null>,
) {
  const [value, setValue] = useState(defaultChecked ?? false);
  useEffect(() => {
    const input = inputRef.current;
    if (checked !== undefined || !input) return;
    const doc = input.ownerDocument;
    const onChange = () => {
      setValue(input.checked);
    };
    doc.addEventListener('change', onChange);
    return () => {
      doc.removeEventListener('change', onChange);
    };
  }, [checked, inputRef]);
  return checked ?? value;
}

export type OptionRowProps = Omit<ComponentProps<'input'>, 'type' | 'children'> & {
  label: ReactNode;
  /** 스펙 한 줄 같은 보조 설명 */
  description?: ReactNode;
  /** 화면에 보일 가격 문구. 포맷은 호출하는 쪽이 정한다. */
  price?: ReactNode;
  /** 썸네일이나 아이콘 */
  media?: ReactNode;
  /** 이름 옆에 붙는 작은 표식 (예: "추천") */
  badge?: ReactNode;
  /**
   * 지금 조합에서 고를 수 없는 이유. 주면 행이 muted 면으로 바뀌고 이유가 행 안에 항상 보인다.
   * 입력은 비활성화하지 않는다: 눌러 보면 `onChange`가 호출되니 호출하는 쪽이 변경 제안 같은 안내를 띄운다.
   * 아예 막으려면 `disabled`를 쓴다.
   */
  unavailableReason?: ReactNode;
};

/** 라디오 한 줄. 같은 `name`으로 `OptionGroup` 안에 여러 개를 놓는다. */
export const OptionRow = forwardRef<HTMLInputElement, OptionRowProps>(function OptionRow(
  {
    label,
    description,
    price,
    media,
    badge,
    unavailableReason,
    className,
    id,
    disabled,
    'aria-describedby': describedBy,
    ...props
  },
  ref,
) {
  const innerRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);
  const phase = useCheckPhase(props.checked, innerRef);
  const group = useContext(OptionGroupContext);
  const rowRef = useRef<HTMLLabelElement>(null);
  const isChecked = useIsChecked(props.checked, props.defaultChecked, innerRef);
  // 선택된 행이 묶음에 자기를 알린다. 묶음이 선택 테두리를 이 행 위치로 옮긴다.
  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!group || !row || !isChecked) return;
    group.claim(row);
    return () => {
      group.release(row);
    };
  }, [group, isChecked]);
  const autoId = useId();
  const inputId = id ?? autoId;
  const labelId = `${inputId}-label`;
  const descriptionId = `${inputId}-description`;
  const priceId = `${inputId}-price`;
  const reasonId = `${inputId}-reason`;
  const described =
    [
      describedBy,
      description ? descriptionId : null,
      price ? priceId : null,
      unavailableReason ? reasonId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <label
      ref={rowRef}
      htmlFor={inputId}
      data-unavailable={unavailableReason ? '' : undefined}
      className={cn(
        'border-border bg-background text-foreground relative flex cursor-pointer items-start gap-3 rounded-lg border p-4 font-sans',
        'hover:bg-secondary-hover',
        // 묶음 안에서는 선택 표시를 아래의 미끄러지는 요소가 그린다. 묶음 밖의 행만 CSS로 그린다.
        !group && 'has-checked:border-primary has-checked:ring-primary has-checked:ring-1',
        'has-focus-visible:outline-ring has-focus-visible:outline-2 has-focus-visible:outline-offset-2',
        'data-unavailable:bg-muted data-unavailable:text-muted-foreground has-disabled:bg-muted has-disabled:text-muted-foreground has-disabled:cursor-not-allowed',
        className,
      )}
    >
      <input
        ref={innerRef}
        id={inputId}
        type="radio"
        disabled={disabled}
        aria-labelledby={labelId}
        aria-describedby={described}
        aria-disabled={unavailableReason ? true : undefined}
        className="peer sr-only"
        {...props}
      />
      <span
        aria-hidden
        data-phase={phase}
        // 선택되면 튀어 오르고(in), 해제되면 바로 줄어들며 사라진다(out). 처음 그려질 때는 움직이지 않는다.
        className="border-border bg-background peer-checked:border-primary peer-checked:bg-primary motion-safe:data-[phase=in]:animate-select-pop relative mt-0.5 size-5 shrink-0 rounded-full border peer-checked:shadow-[inset_0_0_0_4px_var(--color-background)]"
      >
        {/* 해제될 때만 보이는 "선택된 모습". 커지지 않고 바로 줄어들며 사라진다(select-out). */}
        <span
          aria-hidden
          data-phase={phase}
          className="border-primary bg-primary motion-safe:data-[phase=out]:animate-select-out pointer-events-none absolute -inset-px rounded-full border opacity-0 shadow-[inset_0_0_0_4px_var(--color-background)]"
        />
      </span>
      {media ? <span className="shrink-0">{media}</span> : null}
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span id={labelId} className="flex flex-wrap items-center gap-2 text-sm font-medium">
          {label}
          {badge}
        </span>
        {description ? (
          <span id={descriptionId} className="text-caption text-muted-foreground">
            {description}
          </span>
        ) : null}
        {unavailableReason ? (
          <span id={reasonId} className="text-caption text-foreground">
            {unavailableReason}
          </span>
        ) : null}
      </span>
      {price ? (
        <span id={priceId} className="shrink-0 text-sm font-medium tabular-nums">
          {price}
        </span>
      ) : null}
    </label>
  );
});

export type OptionGroupProps = Omit<ComponentProps<'fieldset'>, 'children'> & {
  legend: ReactNode;
  children: ReactNode;
};

/** 라디오 묶음. `fieldset`과 `legend`라서 스크린 리더가 그룹 이름을 읽는다. */
export function OptionGroup({ legend, children, className, ...props }: OptionGroupProps) {
  // 선택 테두리와 행들의 기준 상자. `fieldset` 자체를 기준으로 하면 안 된다: 절대 위치의 기준이 `legend` 아래부터라서, 행의 `offsetTop`
  // (fieldset 위쪽부터 잰 값)과 `legend` 높이만큼 어긋난다. 행들을 이 `relative` 상자에 담고 테두리도 같은 상자 안에 둔다.
  const rowsRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  // 선택된 행. 없으면(선택이 바뀌는 사이에 잠깐 비는 경우 포함) 테두리를 숨기기만 하고 요소는 그대로 둔다.
  const [active, setActive] = useState<HTMLElement | null>(null);
  // 테두리 요소는 한 번 만든 뒤 계속 둔다. 비제어 행은 이전 행의 해제와 새 행의 선택이 서로 다른 렌더로 처리될 수 있는데(브라우저가
  // `change` 리스너마다 React 갱신을 먼저 처리한다), 그때마다 요소를 지우면 새 행에서 "처음 배치"로 점프한다.
  const [mounted, setMounted] = useState(false);
  const top = useMotionValue(0);
  const height = useMotionValue(0);
  const placed = useRef(false);
  const claim = useCallback((row: HTMLElement) => {
    setMounted(true);
    setActive(row);
  }, []);
  // 이미 다른 행이 선택됐다면 지우지 않는다.
  const release = useCallback((row: HTMLElement) => {
    setActive((current) => (current === row ? null : current));
  }, []);
  const context = useMemo(() => ({ claim, release }), [claim, release]);

  useLayoutEffect(() => {
    const row = active;
    const rows = rowsRef.current;
    if (!row || !rows) return;
    // 테두리는 행 상자보다 1px씩 바깥이다. `offsetTop`은 정수로 반올림돼 소수 배치에서 어긋나므로 `rows`(relative) 기준의 실제 위치 차이를 쓴다.
    const target = () => {
      const box = rows.getBoundingClientRect();
      const at = row.getBoundingClientRect();
      return { y: at.top - box.top - 1, h: at.height + 2 };
    };
    const { y, h } = target();
    if (!placed.current || reduceMotion) {
      top.set(y);
      height.set(h);
      placed.current = true;
    } else {
      void animate(top, y, SPRING.settle);
      void animate(height, h, SPRING.settle);
    }
    // 행이나 묶음의 크기가 바뀌면(창 크기, 글꼴, 안내 문구) 애니메이션 없이 따라간다.
    const observer = new ResizeObserver(() => {
      const next = target();
      top.set(next.y);
      height.set(next.h);
    });
    observer.observe(row);
    observer.observe(rows);
    return () => {
      observer.disconnect();
    };
  }, [active, reduceMotion, top, height]);

  return (
    <OptionGroupContext.Provider value={context}>
      <fieldset className={cn('m-0 min-w-0 border-0 p-0', className)} {...props}>
        <legend className="text-foreground mb-3 p-0 font-sans text-sm font-semibold">
          {legend}
        </legend>
        <div ref={rowsRef} className="relative flex flex-col gap-2">
          {children}
          {mounted ? (
            // 선택된 행의 테두리. 요소는 하나이고 마지막 자식이라 항상 행들 위에 그려진다. 속이 비어 있어 행 안의 내용을 가리지 않는다.
            // 선택이 바뀌면 `top`과 `height`가 새 행으로 `SPRING.settle`로 움직인다(절대 위치라 다른 요소의 배치는 움직이지 않는다).
            <motion.span
              aria-hidden
              className="border-primary ring-primary pointer-events-none absolute -inset-x-px top-0 rounded-lg border ring-1 forced-colors:border-2 forced-colors:border-[Highlight]"
              style={{ y: top, height, opacity: active ? 1 : 0 }}
            />
          ) : null}
        </div>
      </fieldset>
    </OptionGroupContext.Provider>
  );
}
