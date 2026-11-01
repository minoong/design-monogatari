'use client';

import { type ComponentProps, forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

import { useCheckPhase } from '@/lib/check-phase';
import { cn } from '@/lib/utils';

export type CheckboxProps = Omit<ComponentProps<'input'>, 'type'> & {
  /**
   * 일부만 선택된 상태(예: 하위 항목 중 일부만 고른 "전체 선택"). 체크 표시 대신 가로줄이 보이고, 낭독기에는 "일부 선택됨(mixed)"으로 알려진다.
   * 브라우저는 누르면 이 상태를 풀고 `checked`를 바꾸므로, 누른 뒤의 상태는 `onChange`에서 호출하는 쪽이 정한다.
   */
  indeterminate?: boolean;
};

/**
 * 네이티브 체크박스에 토큰 스타일만 입혔다. 스페이스로 켜고 끄는 동작과 폼 값은 브라우저가 맡는다.
 * 체크 표시는 `::after`로 그린다. 보이는 이름표는 `Label`을 `htmlFor`로 이어 준다.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, indeterminate = false, ...props },
  ref,
) {
  const innerRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);
  // `indeterminate`는 HTML 속성이 아니라 DOM 속성이라 렌더마다 맞춘다(누르면 브라우저가 풀므로, 호출하는 쪽이 다시 켜면 되돌아온다).
  useEffect(() => {
    if (innerRef.current) innerRef.current.indeterminate = indeterminate;
  });
  // 체크되면 튀어 오르고(in), 해제되면 ::before(채움)와 ::after(체크 표시)가 함께 줄어들며 사라진다(out). 처음 그려질 때는 움직이지 않는다.
  // 입력 자체의 box-shadow/border는 애니메이션하지 않는다: 끝난 뒤에도 포커스 링과 오류 표시를 덮어쓰기 때문이다.
  const phase = useCheckPhase(props.checked, innerRef);

  return (
    <input
      ref={innerRef}
      type="checkbox"
      data-phase={phase}
      className={cn(
        "border-border bg-background before:border-primary before:bg-primary relative size-5 shrink-0 cursor-pointer appearance-none rounded-md border align-middle before:pointer-events-none before:absolute before:-inset-px before:rounded-md before:border before:opacity-0 before:content-['']",
        'checked:border-primary checked:bg-primary indeterminate:border-primary indeterminate:bg-primary',
        // 누르는 동안 색이 바뀐다(선택 전은 옅은 면 `secondary-hover`, 선택·중간 상태는 `Button`의 주요 버튼 눌림처럼 `primary`에 `dimmer`를 26% 섞어 어둡게). 크기는 그대로다: 입력을 줄이면 눌린 순간
        // 클릭 영역도 줄어 가장자리 1px을 누른 클릭이 입력에 닿지 않는다. 색이라 감소 모션과 상관없이 쓰고 전환만 끈다.
        'ease-out-expo not-checked:not-indeterminate:active:not-disabled:bg-secondary-hover transition-colors duration-180 checked:active:not-disabled:border-[color-mix(in_srgb,var(--color-primary)_74%,var(--dimmer))] checked:active:not-disabled:bg-[color-mix(in_srgb,var(--color-primary)_74%,var(--dimmer))] indeterminate:active:not-disabled:border-[color-mix(in_srgb,var(--color-primary)_74%,var(--dimmer))] indeterminate:active:not-disabled:bg-[color-mix(in_srgb,var(--color-primary)_74%,var(--dimmer))] motion-reduce:transition-none',
        "after:border-primary-foreground after:absolute after:top-[45%] after:left-1/2 after:h-2.5 after:w-1.5 after:-translate-1/2 after:rotate-45 after:border-r-2 after:border-b-2 after:opacity-0 after:content-[''] checked:after:opacity-100",
        // 중간 상태: 체크 표시 대신 가로줄(너비 10px, 높이 0, 회전 없음)로 바꾼다.
        'indeterminate:after:top-1/2 indeterminate:after:h-0 indeterminate:after:w-2.5 indeterminate:after:rotate-0 indeterminate:after:border-r-0 indeterminate:after:opacity-100',
        'motion-safe:data-[phase=in]:animate-select-pop motion-safe:data-[phase=out]:not-indeterminate:before:animate-select-out motion-safe:data-[phase=out]:not-indeterminate:after:animate-select-out',
        'focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
        'aria-invalid:border-destructive aria-invalid:ring-destructive aria-invalid:focus-visible:ring-destructive aria-invalid:ring-2',
        'disabled:bg-muted disabled:checked:border-muted-foreground disabled:checked:bg-muted-foreground disabled:checked:after:border-background disabled:indeterminate:border-muted-foreground disabled:indeterminate:bg-muted-foreground disabled:indeterminate:after:border-background disabled:cursor-not-allowed',
        'forced-colors:appearance-auto forced-colors:before:hidden forced-colors:after:hidden',
        className,
      )}
      {...props}
    />
  );
});
