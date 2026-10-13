'use client';

import { Button } from '@repo/ui/button';
import { DURATION } from '@repo/ui/motion';
import { useState } from 'react';

const ROWS = [
  ['instant', DURATION.instant, '감소 모션, 눈에 띄지 않는 전환'],
  ['fast', DURATION.fast, '호버, 눌림'],
  ['base', DURATION.base, '선택, 상태 변화'],
  ['slow', DURATION.slow, '목록, 섹션 진입'],
  ['hero', DURATION.hero, '화면당 한 번의 큰 연출'],
] as const;

export default function MotionTokens() {
  const [played, setPlayed] = useState(false);

  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <div className="flex justify-end">
        <Button size="small" onClick={() => setPlayed((value) => !value)}>
          재생
        </Button>
      </div>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {ROWS.map(([name, duration, note]) => (
          <li key={name} className="grid grid-cols-[6.5rem_1fr] items-center gap-3 text-sm">
            <span className="flex flex-col">
              <code className="text-xs">{name}</code>
              <span className="text-muted-foreground text-xs tabular-nums">{duration}s</span>
            </span>
            <span className="bg-muted relative h-6 overflow-hidden rounded-full" title={note}>
              <span
                className="bg-primary ease-out-expo absolute inset-y-0 left-0 w-full origin-left transition-transform motion-reduce:transition-none"
                style={{
                  transform: `scaleX(${played ? 1 : 0})`,
                  transitionDuration: `${duration}s`,
                }}
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
