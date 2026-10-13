'use client';

import { type ComponentProps, forwardRef, useImperativeHandle, useRef } from 'react';

import { useCheckPhase } from './lib/check-phase';
import { cn } from './lib/cn';

export type CheckboxProps = Omit<ComponentProps<'input'>, 'type'>;

/**
 * 네이티브 체크박스에 토큰 스타일만 입혔다. 스페이스로 켜고 끄는 동작과 폼 값은 브라우저가 맡는다.
 * 체크 표시는 `::after`로 그린다. 보이는 이름표는 `Label`을 `htmlFor`로 이어 준다.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, ...props },
  ref,
) {
  const innerRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);
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
        'checked:border-primary checked:bg-primary',
        "after:border-primary-foreground after:absolute after:top-[45%] after:left-1/2 after:h-2.5 after:w-1.5 after:-translate-1/2 after:rotate-45 after:border-r-2 after:border-b-2 after:opacity-0 after:content-[''] checked:after:opacity-100",
        'motion-safe:data-[phase=in]:animate-select-pop motion-safe:data-[phase=out]:before:animate-select-out motion-safe:data-[phase=out]:after:animate-select-out',
        'focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
        'aria-invalid:border-destructive aria-invalid:ring-destructive aria-invalid:focus-visible:ring-destructive aria-invalid:ring-2',
        'disabled:bg-muted disabled:checked:border-muted-foreground disabled:checked:bg-muted-foreground disabled:checked:after:border-background disabled:cursor-not-allowed',
        'forced-colors:appearance-auto forced-colors:before:hidden forced-colors:after:hidden',
        className,
      )}
      {...props}
    />
  );
});
