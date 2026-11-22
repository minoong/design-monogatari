import { DURATION } from '@repo/ui/motion';
import type { CSSProperties } from 'react';

import { Stage } from './stage';
import { SuvDither } from './suv-dither';

const MAX = DURATION.hero;

/**
 * 모션 구역의 장면: 스크롤을 내리면 SUV가 도트 도로 위를 가로지르고 도로는 반대로 흐른다.
 * 아래에는 움직임 시간 토큰을 길이로 보여 준다. 값은 `@repo/ui/motion`에서 읽는다.
 */
export function SceneMotion() {
  return (
    <Stage caption="스크롤을 내리면 SUV가 도로 위를 달립니다" file="packages/ui/src/lib/motion.ts">
      <div className="overflow-clip px-4 pt-10 pb-4 md:px-8">
        <div className="lp-drive" style={{ '--lp-drive': '16%' } as CSSProperties}>
          <div className="mx-auto w-full max-w-xl" aria-label="달리는 가상의 SUV" role="img">
            <SuvDither />
          </div>
        </div>
        <div
          aria-hidden
          className="lp-road text-foreground/50 mt-1 h-2 w-full bg-[radial-gradient(circle_closest-side,currentColor_50%,transparent_60%)] bg-size-[16px_8px]"
          style={{ '--lp-road': '-320px' } as CSSProperties}
        />
      </div>
      <dl
        className="lp-float border-border m-0 grid gap-x-8 gap-y-2 border-t p-4 font-mono text-xs md:grid-cols-2 md:p-8"
        style={{ '--lp-float': '10px' } as CSSProperties}
      >
        {Object.entries(DURATION).map(([name, seconds]) => (
          <div key={name} className="flex items-center gap-3">
            <dt className="text-muted-foreground w-14 shrink-0">{name}</dt>
            <dd aria-hidden className="m-0 flex-1">
              <span
                className="bg-primary block h-1.5 rounded-full"
                style={{ width: `${(seconds / MAX) * 100}%` }}
              />
            </dd>
            <dd className="m-0 w-14 text-right tabular-nums">{seconds}초</dd>
          </div>
        ))}
      </dl>
    </Stage>
  );
}
