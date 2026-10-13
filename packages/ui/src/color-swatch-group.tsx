'use client';

import { type ReactNode, useId, useState } from 'react';

import { cn } from './lib/cn';

export type ColorSwatchOption = {
  value: string;
  /** 접근성 이름이자 캡션 */
  label: string;
  /** CSS 색 값. 이 패키지는 색을 정하지 않고 호출하는 쪽이 넘긴다 (차량 도장 색 등). */
  color: string;
  price?: ReactNode;
  /** 같은 값끼리 소제목 아래로 묶는다 (예: 글로시 / 메탈릭 / 무광) */
  group?: string;
  /** 주면 사선이 그어지고, 캡션에 이 이유가 보인다. 입력은 비활성화하지 않는다. */
  unavailableReason?: ReactNode;
};

export type ColorSwatchGroupProps = {
  legend: ReactNode;
  name: string;
  value: string;
  onValueChange: (value: string) => void;
  options: readonly ColorSwatchOption[];
  /** 선택 불가 칩이 하나라도 있을 때 캡션 아래에 항상 보이는 안내. 터치에서는 호버가 없어서 둔다. */
  unavailableHint?: ReactNode;
  className?: string;
};

function groupOptions(options: readonly ColorSwatchOption[]) {
  const groups = new Map<string, ColorSwatchOption[]>();
  for (const option of options) {
    const key = option.group ?? '';
    groups.set(key, [...(groups.get(key) ?? []), option]);
  }
  return [...groups.entries()];
}

/** 색 칩 라디오 묶음. 선택·호버·포커스 중인 칩의 이름과 가격(또는 선택 불가 이유)을 아래 캡션에 보여 준다. */
export function ColorSwatchGroup({
  legend,
  name,
  value,
  onValueChange,
  options,
  unavailableHint = '사선이 그어진 색은 지금 고를 수 없어요.',
  className,
}: ColorSwatchGroupProps) {
  const captionId = useId();
  const [previewValue, setPreviewValue] = useState<string | null>(null);
  const hasUnavailable = options.some((option) => option.unavailableReason);
  const shown =
    options.find((option) => option.value === (previewValue ?? value)) ??
    options.find((option) => option.value === value);

  return (
    <fieldset className={cn('m-0 min-w-0 border-0 p-0 font-sans', className)}>
      <legend className="text-foreground mb-3 p-0 text-sm font-semibold">{legend}</legend>
      <div className="flex flex-col gap-4">
        {groupOptions(options).map(([group, items], groupIndex) => (
          <div
            key={group}
            role={group ? 'group' : undefined}
            aria-labelledby={group ? `${captionId}-group-${groupIndex}` : undefined}
            className="flex flex-col gap-2"
          >
            {group ? (
              <p
                id={`${captionId}-group-${groupIndex}`}
                className="text-caption text-muted-foreground"
              >
                {group}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-3">
              {items.map((option) => {
                const descriptionId = `${captionId}-${option.value}-description`;
                const hasDescription = Boolean(option.price || option.unavailableReason);
                return (
                  <label
                    key={option.value}
                    className="relative inline-flex size-9 cursor-pointer"
                    onPointerEnter={() => setPreviewValue(option.value)}
                    onPointerLeave={(event) => {
                      // 터치는 손을 떼도 마지막으로 누른 칩의 캡션을 남긴다.
                      if (event.pointerType === 'mouse') setPreviewValue(null);
                    }}
                  >
                    <input
                      type="radio"
                      name={name}
                      value={option.value}
                      checked={value === option.value}
                      onChange={() => onValueChange(option.value)}
                      onFocus={() => setPreviewValue(option.value)}
                      onBlur={() => setPreviewValue(null)}
                      aria-label={option.label}
                      aria-describedby={hasDescription ? descriptionId : undefined}
                      aria-disabled={option.unavailableReason ? true : undefined}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden
                      style={{ backgroundColor: option.color }}
                      className="border-border peer-checked:ring-primary peer-checked:ring-offset-background peer-focus-visible:outline-ring size-9 rounded-full border peer-checked:ring-2 peer-checked:ring-offset-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4"
                    />
                    {option.unavailableReason ? (
                      <span
                        aria-hidden
                        className="bg-foreground ring-background pointer-events-none absolute top-1/2 left-1/2 h-0.5 w-11 -translate-1/2 rotate-45 rounded-full ring-1"
                      />
                    ) : null}
                    {hasDescription ? (
                      <span id={descriptionId} className="sr-only">
                        {option.price}
                        {option.price && option.unavailableReason ? ' · ' : null}
                        {option.unavailableReason}
                      </span>
                    ) : null}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="text-caption mt-3 flex min-h-6 flex-wrap items-center gap-x-2">
        {shown ? (
          <>
            <span className="text-foreground font-medium">{shown.label}</span>
            {shown.unavailableReason ? (
              <span className="text-muted-foreground">{shown.unavailableReason}</span>
            ) : shown.price ? (
              <span className="text-muted-foreground tabular-nums">{shown.price}</span>
            ) : null}
          </>
        ) : null}
      </p>
      {hasUnavailable && unavailableHint ? (
        <p className="text-caption text-muted-foreground">{unavailableHint}</p>
      ) : null}
    </fieldset>
  );
}
