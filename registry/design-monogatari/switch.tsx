import { type ComponentProps, forwardRef } from 'react';

import { cn } from '@/lib/utils';

export type SwitchProps = Omit<ComponentProps<'input'>, 'type' | 'role'>;

/**
 * 켜고 끄는 네이티브 체크박스에 `role="switch"`를 달고 토큰 스타일만 입혔다. 스페이스로 켜고 끄는 동작과 폼 값은 브라우저가 맡는다.
 * 트랙은 입력 자체이고 손잡이는 `::after`다. 보이는 이름표는 `Label`을 `htmlFor`로 이어 주고, 이름표가 없으면 `aria-label`을 준다.
 *
 * 누르는 동안(`:active`) 손잡이가 켜짐 쪽으로 늘어났다가 놓으면 돌아온다. 키보드의 스페이스와 연결된 이름표를 누를 때도 입력이
 * `:active`가 되므로 JS 상태 없이 같은 효과가 난다(터치는 기기에 따라 다를 수 있어 확인하지 못했다). 감소 모션이면 늘어나지도
 * 미끄러지지도 않고 바로 바뀐다.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type="checkbox"
      role="switch"
      className={cn(
        // 트랙 44x24. 투명한 `::before`가 세로로 6px씩 넓혀 누를 수 있는 영역을 36px로 만든다(패딩 상자 기준이라 테두리 1px을 보정한 7px).
        // 더 넓히면 `gap-3`(12px)로 쌓은 이웃 스위치의 영역과 겹쳐 클릭을 가로챈다. 연결된 `Label`을 쓰면 영역이 더 넓다.
        // 꺼짐 테두리는 Checkbox/Radio의 안 켜진 상태와 같은 `border-border`다(진한 `muted-foreground`는 무거워 보여 쓰지 않는다).
        "border-border bg-muted rounded-pill ease-out-expo relative h-6 w-11 shrink-0 cursor-pointer appearance-none border align-middle transition-[background-color,border-color] duration-280 before:absolute before:inset-x-0 before:inset-y-[-7px] before:content-['']",
        // 손잡이: 16px 원. 눌리면 20px로 늘고(`--thumb`), 켜짐이면 오른쪽 끝에 붙어 늘어나도 오른쪽 끝이 고정된다.
        "after:bg-muted-foreground after:rounded-pill after:ease-out-expo [--thumb:1rem] after:absolute after:top-1/2 after:left-[3px] after:h-4 after:w-(--thumb) after:-translate-y-1/2 after:transition-[left,width,background-color] after:duration-280 after:content-['']",
        'active:[--thumb:1.25rem]',
        'checked:border-primary checked:bg-primary checked:after:bg-primary-foreground checked:after:left-[calc(100%-3px-var(--thumb))]',
        'motion-reduce:transition-none motion-reduce:after:transition-none motion-reduce:active:[--thumb:1rem]',
        'focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
        'aria-invalid:border-destructive aria-invalid:ring-destructive aria-invalid:focus-visible:ring-destructive aria-invalid:ring-2',
        'disabled:bg-muted disabled:border-border disabled:after:bg-border disabled:cursor-not-allowed',
        'disabled:checked:border-muted-foreground disabled:checked:bg-muted-foreground disabled:checked:after:bg-background',
        // 강제 색상 모드는 배경을 지운다: 트랙은 테두리(`ButtonText`)로, 켜짐은 `Highlight` 채움과 `HighlightText` 손잡이로 남긴다.
        'forced-colors:border-[ButtonText] forced-colors:after:bg-[ButtonText] forced-colors:checked:bg-[Highlight] forced-colors:checked:after:bg-[HighlightText]',
        // 비활성 규칙이 위 강제 색상 규칙보다 우선순위가 높아서, 따로 지정하지 않으면 비활성 스위치가 빈 알약이 된다.
        'forced-colors:disabled:border-[GrayText] forced-colors:disabled:after:bg-[GrayText] forced-colors:disabled:checked:bg-[GrayText] forced-colors:disabled:checked:after:bg-[Canvas]',
        className,
      )}
      {...props}
    />
  );
});
