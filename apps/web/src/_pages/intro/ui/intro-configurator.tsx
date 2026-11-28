'use client';

import { cn } from '@repo/ui/cn';
import { TextRoll } from '@repo/ui/text-roll';
import Image from 'next/image';
import type { ReactNode } from 'react';

import { exteriorStill, interiorStill } from '../model/frame-shots';

export interface StillLayer {
  key: string;
  src: string;
}

/**
 * 미리 렌더한 정지 장면을 겹쳐 두고 고른 것만 보인다(Polestar 구성기). 새 장면은 170ms에 나타나고, 이전 장면은 80ms 늦게
 * 170ms 동안 사라져서 둘이 겹치는 동안 바탕이 비치지 않는다. 감소 모션에서는 바로 바뀐다.
 */
export function StillStack({
  layers,
  active,
  alt,
  crop = false,
  className,
}: {
  layers: readonly StillLayer[];
  active: string;
  alt: string;
  /**
   * 외관 장면은 차가 아래쪽 60%에 있어서 빈 곳을 잘라 보인다: 넓은 화면은 위쪽을 잘라 16:7, 좁은 화면은 양옆도 잘라 4:3으로
   * 차를 크게 보인다.
   */
  crop?: boolean;
  /** 바깥 상자(배치·고정용). 안쪽 상자는 늘 `relative`라서 `next/image`의 `fill`이 기준을 잃지 않는다. */
  className?: string;
}) {
  return (
    <div className={className}>
      <div
        role="img"
        aria-label={alt}
        className={cn('relative w-full', crop ? 'aspect-4/3 sm:aspect-16/7' : 'aspect-video')}
      >
        {layers.map((layer) => {
          const on = layer.key === active;
          return (
            <Image
              key={layer.key}
              alt=""
              aria-hidden
              fill
              src={layer.src}
              sizes="(min-width: 64rem) 66vw, 100vw"
              className={cn(
                crop ? 'object-cover object-[50%_80%]' : 'object-contain',
                'transition-opacity ease-out motion-reduce:transition-none',
                on ? 'z-10 opacity-100 duration-170' : 'z-0 opacity-0 delay-80 duration-170',
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

export function exteriorLayers(colors: readonly string[], wheels: readonly string[]): StillLayer[] {
  return colors.flatMap((color) =>
    wheels.map((wheel) => ({
      key: `${color}-${wheel}`,
      src: exteriorStill('lg', color, wheel),
    })),
  );
}

export function interiorLayers(interiors: readonly string[]): StillLayer[] {
  return interiors.map((interior) => ({
    key: interior,
    src: interiorStill('lg', interior),
  }));
}

/** 장면 옆(좁은 화면에서는 아래)에 놓이는 큰 값과 조작. 조작은 늘 보이고 탭 순서에 있다. */
export function ConfiguratorPanel({
  label,
  value,
  direction,
  children,
}: {
  label: string;
  value: string;
  direction?: 'up' | 'down';
  children: ReactNode;
}) {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground m-0 text-sm">{label}</p>
        <p aria-hidden className="m-0 text-4xl font-semibold tracking-tight sm:text-5xl">
          <TextRoll direction={direction}>{value}</TextRoll>
        </p>
      </div>
      {children}
    </div>
  );
}
