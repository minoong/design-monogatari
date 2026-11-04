'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react';

import { cn } from '@/lib/utils';

/**
 * 툴팁을 쓰는 영역을 감싸 열림 지연을 정한다. 앱 최상위에 한 번 두면 된다.
 * 하나가 닫힌 뒤 `skipDelayDuration` 안에 옆 항목으로 옮기면 지연 없이 바로 열려, 줄지어 선 아이콘 버튼을 훑기 편하다.
 */
export function TooltipProvider({
  delayDuration = 400,
  skipDelayDuration = 300,
  ...props
}: ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
      {...props}
    />
  );
}

export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

/**
 * 반전색의 작은 말풍선. 포털로 그려져 부모의 `overflow`에 잘리지 않고, 화면 끝에서는 반대쪽으로 뒤집힌다.
 * 트리거에는 `aria-describedby`가 이어지고 Esc로 닫힌다. 터치에서는 열리지 않으므로 중요한 정보를 여기에만 두지 마십시오.
 */
export const TooltipContent = forwardRef<
  ElementRef<typeof TooltipPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(function TooltipContent({ className, sideOffset = 6, collisionPadding = 8, ...props }, ref) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          'bg-foreground text-background text-caption z-50 max-w-xs rounded-md px-2.5 py-1.5 font-sans leading-snug wrap-break-word',
          // 고대비 모드는 배경색을 지우므로 테두리로 말풍선의 가장자리를 남긴다.
          'forced-colors:border forced-colors:border-[CanvasText]',
          // 열릴 때만 트리거에 가까운 쪽 4px 떨어진 곳에서 제자리로 이동하며 나타난다. 이어서 열 때(`instant-open`)는 움직임 없이 바로 보인다.
          'data-[side=bottom]:[--tooltip-y:-4px] data-[side=left]:[--tooltip-y:0px] data-[side=right]:[--tooltip-y:0px] data-[side=top]:[--tooltip-y:4px]',
          'motion-safe:data-[state=delayed-open]:animate-tooltip-in motion-safe:data-[state=closed]:animate-tooltip-out',
          'motion-reduce:data-[state=delayed-open]:animate-tooltip-fade-in motion-reduce:data-[state=closed]:animate-tooltip-out-fade',
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
});
