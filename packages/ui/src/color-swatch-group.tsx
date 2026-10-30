'use client';

import { animate, useMotionValue, useReducedMotion } from 'motion/react';
import * as motion from 'motion/react-client';
import { type ReactNode, useId, useLayoutEffect, useRef, useState } from 'react';

import { useCheckPhase } from './lib/check-phase';
import { cn } from './lib/cn';
import { SPRING } from './lib/motion';

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

type ColorSwatchProps = {
  option: ColorSwatchOption;
  name: string;
  checked: boolean;
  descriptionId: string;
  onSelect: () => void;
  onPreview: (value: string | null) => void;
};

function ColorSwatch({
  option,
  name,
  checked,
  descriptionId,
  onSelect,
  onPreview,
}: ColorSwatchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const phase = useCheckPhase(checked, inputRef);
  const hasDescription = Boolean(option.price || option.unavailableReason);

  return (
    <label
      className="relative inline-flex size-9 cursor-pointer"
      onPointerEnter={() => onPreview(option.value)}
      onPointerLeave={(event) => {
        // 터치는 손을 떼도 마지막으로 누른 칩의 캡션을 남긴다.
        if (event.pointerType === 'mouse') onPreview(null);
      }}
    >
      <input
        ref={inputRef}
        type="radio"
        name={name}
        value={option.value}
        checked={checked}
        onChange={onSelect}
        onFocus={() => onPreview(option.value)}
        onBlur={() => onPreview(null)}
        aria-label={option.label}
        aria-describedby={hasDescription ? descriptionId : undefined}
        aria-disabled={option.unavailableReason ? true : undefined}
        className="peer sr-only"
      />
      <span
        aria-hidden
        data-phase={phase}
        style={{ backgroundColor: option.color }}
        // 선택되면 튀어 오르고(in), 해제되면 바로 줄어들며 사라진다(out). 처음 그려질 때는 움직이지 않는다.
        className="border-border peer-focus-visible:outline-ring motion-safe:data-[phase=in]:animate-select-pop relative size-9 rounded-full border peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4"
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
}

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
  unavailableHint = '사선이 그어진 색은 지금 고를 수 없습니다.',
  className,
}: ColorSwatchGroupProps) {
  const captionId = useId();
  const [previewValue, setPreviewValue] = useState<string | null>(null);
  // 선택 링은 그룹이 요소 하나로 그리고 선택된 칩의 위치로 옮긴다. 칩마다 링을 만들고 없애면 가려지거나 이동이 생략된다(OptionGroup에서 겪었다).
  // 기준 상자는 `fieldset`이 아니라 칩들을 담은 `relative` 상자다: `fieldset`의 절대 위치 기준은 `legend` 아래부터라서 어긋난다.
  const chipsRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const ringX = useMotionValue(0);
  const ringY = useMotionValue(0);
  const ringOpacity = useMotionValue(0);
  const placed = useRef(false);
  useLayoutEffect(() => {
    const chips = chipsRef.current;
    const row = chips?.querySelector<HTMLInputElement>(
      'input[type="radio"]:checked',
    )?.parentElement;
    if (!chips || !row) {
      // 선택된 칩이 없으면 숨기기만 한다(요소는 지우지 않는다).
      ringOpacity.set(0);
      return;
    }
    // `offsetLeft`/`offsetTop`은 정수로 반올림돼 소수 배치에서 링이 어긋난다. 칩 상자 기준의 실제 위치 차이를 쓴다.
    const target = () => {
      const box = chips.getBoundingClientRect();
      const at = row.getBoundingClientRect();
      return { x: at.left - box.left, y: at.top - box.top };
    };
    const { x, y } = target();
    ringOpacity.set(1);
    if (!placed.current || reduceMotion) {
      // `set`은 이전 값과의 차이를 속도로 남기고, 이 효과가 다시 돌 때(감소 모션 설정이 정해질 때, 호출하는 쪽의 `options`가 새 배열일 때)
      // 같은 자리로 건 스프링이 그 속도를 이어받아 링이 아래로 튀었다 돌아온다. `jump`는 속도를 지운다.
      ringX.jump(x);
      ringY.jump(y);
      placed.current = true;
    } else {
      // 이미 그 자리면 움직일 게 없다(효과가 값 변화 없이 다시 돌 수 있다).
      if (Math.abs(ringX.get() - x) > 0.01) void animate(ringX, x, SPRING.settle);
      if (Math.abs(ringY.get() - y) > 0.01) void animate(ringY, y, SPRING.settle);
    }
    // 칩이 줄바꿈되는 폭이나 글꼴이 바뀌면 애니메이션 없이 따라간다. 관찰을 시작하면 크기가 그대로여도 한 번 통지가 오는데,
    // 그때 `jump`하면 방금 건 이동 애니메이션이 끝나 버리므로 목표가 바뀐 때만 따라간다.
    let goal = { x, y };
    const observer = new ResizeObserver(() => {
      const next = target();
      if (Math.abs(next.x - goal.x) < 0.5 && Math.abs(next.y - goal.y) < 0.5) return;
      goal = next;
      ringX.jump(next.x);
      ringY.jump(next.y);
    });
    observer.observe(chips);
    observer.observe(row);
    return () => {
      observer.disconnect();
    };
  }, [value, options, reduceMotion, ringX, ringY, ringOpacity]);
  const hasUnavailable = options.some((option) => option.unavailableReason);
  const shown =
    options.find((option) => option.value === (previewValue ?? value)) ??
    options.find((option) => option.value === value);

  return (
    <fieldset className={cn('m-0 min-w-0 border-0 p-0 font-sans', className)}>
      <legend className="text-foreground mb-3 p-0 text-sm font-semibold">{legend}</legend>
      <div ref={chipsRef} className="relative flex flex-col gap-4">
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
              {items.map((option) => (
                <ColorSwatch
                  key={option.value}
                  option={option}
                  name={name}
                  checked={value === option.value}
                  descriptionId={`${captionId}-${option.value}-description`}
                  onSelect={() => onValueChange(option.value)}
                  onPreview={setPreviewValue}
                />
              ))}
            </div>
          </div>
        ))}
        {/* 선택된 칩의 링. 요소는 하나이고 마지막 자식이라 칩들 위에 그려지며, 속이 비어 있어 칩 색을 가리지 않는다. 링 안쪽의 간격(ring-offset)은
            페이지 배경색이라 칩 가장자리를 2px 띄운다. 강제 색상 모드는 box-shadow를 지우므로 outline으로 남긴다. */}
        <motion.span
          aria-hidden
          className="ring-primary dark:ring-primary-on-dark ring-offset-background pointer-events-none absolute top-0 left-0 size-9 rounded-full ring-2 ring-offset-2 forced-colors:outline-2 forced-colors:outline-offset-2 forced-colors:outline-[Highlight]"
          style={{ x: ringX, y: ringY, opacity: ringOpacity }}
        />
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
