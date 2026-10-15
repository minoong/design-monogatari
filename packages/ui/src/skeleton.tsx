'use client';

import { useInView } from 'motion/react';
import { type ComponentProps, useRef } from 'react';

import { cn } from './lib/cn';

/**
 * 불러오는 중인 자리를 채우는 회색 막대입니다. 크기와 모양은 `className`으로 실제 내용에 맞추십시오.
 * 스크린 리더에는 숨기고(`aria-hidden`), 화면 밖에 있으면 깜빡임을 멈추며, 감소 모션에서는 깜빡이지 않습니다.
 * 묶음 전체의 "불러오는 중" 안내는 `SkeletonGroup`이 맡습니다.
 */
export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);

  return (
    <div
      ref={ref}
      aria-hidden
      data-paused={inView ? undefined : ''}
      className={cn(
        'bg-muted rounded-md motion-safe:animate-pulse motion-safe:data-paused:[animation-play-state:paused]',
        className,
      )}
      {...props}
    />
  );
}

export type SkeletonGroupProps = ComponentProps<'div'> & {
  /** 스크린 리더가 읽는 안내 */
  label?: string;
};

/**
 * `Skeleton`들을 감싸는 묶음. 화면에서 숨긴 `label`("불러오는 중")을 스크린 리더가 훑을 때 읽습니다. 바뀌는 순간을
 * 알려 주지는 않으므로, 알림이 필요하면 호출하는 쪽의 항상 그려 둔 `role="status"` 문구를 바꾸십시오.
 * 내용이 도착하면 이 묶음을 지우고 실제 내용으로 바꾸십시오.
 */
export function SkeletonGroup({
  label = '불러오는 중입니다',
  className,
  children,
  ...props
}: SkeletonGroupProps) {
  return (
    <div className={className} {...props}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
