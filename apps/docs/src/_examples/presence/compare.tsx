'use client';

import { Button } from '@repo/ui/button';
import { Presence, type PresenceVariant } from '@repo/ui/presence';
import { SwitchField } from '@repo/ui/switch-field';
import { useState } from 'react';

const VARIANTS: [PresenceVariant, string][] = [
  ['collapse', 'collapse: 자리가 열리고 닫힘'],
  ['slide', 'slide(기본): 자리가 열리고 닫히며 밀려듦'],
  ['spring', 'spring: 슬라이드를 스프링으로'],
  ['reserve', 'reserve: 자리는 그대로, 컨트롤만(이웃이 안 움직임)'],
];

export default function PresenceCompare() {
  const [show, setShow] = useState(true);

  return (
    <div className="flex flex-col items-start gap-5">
      <Button
        size="small"
        variant="secondary"
        onClick={() => {
          setShow((value) => !value);
        }}
      >
        {show ? '컨트롤 빼기' : '컨트롤 담기'}
      </Button>
      {VARIANTS.map(([variant, label]) => (
        <div key={variant} className="flex flex-col gap-2">
          <p className="text-muted-foreground text-caption">{label}</p>
          <div className="flex items-center">
            <Button size="small" variant="secondary">
              앞 버튼
            </Button>
            <Presence show={show} variant={variant}>
              <div className="border-border bg-card mx-2 flex h-8 items-center rounded-lg border px-3 text-sm">
                <SwitchField className="h-full" label="알림 받기" defaultChecked />
              </div>
            </Presence>
            <Button size="small" variant="secondary" className="ml-2">
              뒤 버튼
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
