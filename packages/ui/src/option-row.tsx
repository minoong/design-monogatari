import { type ComponentProps, forwardRef, type ReactNode, useId } from 'react';

import { cn } from './lib/cn';

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
        'border-border bg-background text-foreground relative flex cursor-pointer items-start gap-3 rounded-lg border p-4 font-sans transition-[background-color] motion-reduce:transition-none',
        'hover:bg-secondary-hover has-checked:border-primary has-checked:ring-primary has-checked:ring-1',
        'has-focus-visible:outline-ring has-focus-visible:outline-2 has-focus-visible:outline-offset-2',
        'data-unavailable:bg-muted data-unavailable:text-muted-foreground has-disabled:bg-muted has-disabled:text-muted-foreground has-disabled:cursor-not-allowed',
        className,
      )}
    >
      <input
        ref={ref}
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
        className="border-border bg-background peer-checked:border-primary peer-checked:bg-primary motion-safe:peer-checked:animate-select-pop mt-0.5 size-5 shrink-0 rounded-full border peer-checked:shadow-[inset_0_0_0_4px_var(--color-background)]"
      />
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
  return (
    <fieldset className={cn('m-0 flex min-w-0 flex-col gap-2 border-0 p-0', className)} {...props}>
      <legend className="text-foreground mb-3 p-0 font-sans text-sm font-semibold">{legend}</legend>
      {children}
    </fieldset>
  );
}
