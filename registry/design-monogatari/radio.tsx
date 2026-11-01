'use client';

import { type ComponentProps, forwardRef, useImperativeHandle, useRef } from 'react';

import { useCheckPhase } from '@/lib/check-phase';
import { cn } from '@/lib/utils';

export type RadioProps = Omit<ComponentProps<'input'>, 'type'>;

/** 네이티브 라디오에 토큰 스타일만 입혔다. 같은 `name`끼리는 브라우저가 방향키 이동을 처리한다. */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { className, ...props },
  ref,
) {
  const innerRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);
  // 선택되면 튀어 오르고(in), 해제되면 ::before에 그린 선택된 모습이 줄어들며 사라진다(out). 처음 그려질 때는 움직이지 않는다.
  // 입력 자체의 box-shadow/border는 애니메이션하지 않는다: 끝난 뒤에도 포커스 링과 오류 표시를 덮어쓰기 때문이다.
  const phase = useCheckPhase(props.checked, innerRef);

  return (
    <input
      ref={innerRef}
      type="radio"
      data-phase={phase}
      className={cn(
        "border-border bg-background before:border-primary before:bg-primary relative size-5 shrink-0 cursor-pointer appearance-none rounded-full border align-middle before:pointer-events-none before:absolute before:-inset-px before:rounded-full before:border before:opacity-0 before:shadow-[inset_0_0_0_4px_var(--color-background)] before:content-['']",
        'checked:border-primary checked:bg-primary checked:shadow-[inset_0_0_0_4px_var(--color-background)]',
        // 누르는 동안 색이 바뀐다(선택 전은 옅은 면 `secondary-hover`, 선택은 `Button`의 주요 버튼 눌림처럼 `primary`에 `dimmer`를 26% 섞어 어둡게). 크기는 그대로다: 입력을 줄이면 눌린 순간
        // 클릭 영역도 줄어 가장자리 1px을 누른 클릭이 입력에 닿지 않는다. 색이라 감소 모션과 상관없이 쓰고 전환만 끈다.
        'ease-out-expo not-checked:active:not-disabled:bg-secondary-hover transition-colors duration-180 checked:active:not-disabled:border-[color-mix(in_srgb,var(--color-primary)_74%,var(--dimmer))] checked:active:not-disabled:bg-[color-mix(in_srgb,var(--color-primary)_74%,var(--dimmer))] motion-reduce:transition-none',
        'motion-safe:data-[phase=in]:animate-select-pop motion-safe:data-[phase=out]:before:animate-select-out',
        'focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
        'aria-invalid:border-destructive aria-invalid:ring-destructive aria-invalid:focus-visible:ring-destructive aria-invalid:ring-2',
        'disabled:bg-muted disabled:checked:border-muted-foreground disabled:checked:bg-muted-foreground disabled:cursor-not-allowed',
        'forced-colors:appearance-auto forced-colors:before:hidden',
        className,
      )}
      {...props}
    />
  );
});
