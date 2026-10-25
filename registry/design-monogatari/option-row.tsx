'use client';

import { useReducedMotion } from 'motion/react';
import * as motion from 'motion/react-client';
import {
  type ComponentProps,
  createContext,
  forwardRef,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { useCheckPhase } from '@/lib/check-phase';
import { cn } from '@/lib/utils';
import { SPRING } from '@/lib/motion';

/** `OptionGroup` 안의 행들이 선택 표시(테두리)를 하나로 공유해 행 사이를 미끄러지게 하는 통로. 묶음 밖의 행은 CSS로 그린다. */
const OptionGroupContext = createContext<{ indicatorId: string } | null>(null);

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
  const reduceMotion = useReducedMotion();
  const isChecked = useIsChecked(props.checked, props.defaultChecked, innerRef);
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
      {group && isChecked ? (
        // 선택된 행의 테두리. 선택이 바뀌면 이전 행에서 새 행으로 미끄러진다(같은 `layoutId`). 행의 테두리(1px) 바깥에 겹친다.
        <motion.span
          aria-hidden
          layoutId={`${group.indicatorId}-indicator`}
          className="border-primary ring-primary pointer-events-none absolute -inset-px rounded-lg border ring-1 forced-colors:border-2 forced-colors:border-[Highlight]"
          transition={reduceMotion ? { duration: 0 } : SPRING.settle}
        />
      ) : null}
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
  const indicatorId = useId();
  return (
    <OptionGroupContext.Provider value={{ indicatorId }}>
      <fieldset
        className={cn('m-0 flex min-w-0 flex-col gap-2 border-0 p-0', className)}
        {...props}
      >
        <legend className="text-foreground mb-3 p-0 font-sans text-sm font-semibold">
          {legend}
        </legend>
        {children}
      </fieldset>
    </OptionGroupContext.Provider>
  );
}
