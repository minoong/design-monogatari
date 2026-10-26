'use client';

import { Button } from '@repo/ui/button';
import { Presence } from '@repo/ui/presence';
import { SwitchField } from '@repo/ui/switch-field';
import { useState } from 'react';

export default function PresenceBasic() {
  const [show, setShow] = useState(true);

  return (
    <div className="flex min-h-24 flex-col items-start gap-4">
      <Button
        size="small"
        variant="secondary"
        onClick={() => {
          setShow((value) => !value);
        }}
      >
        {show ? '컨트롤 빼기' : '컨트롤 담기'}
      </Button>
      <div className="flex items-center">
        <Button size="small" variant="secondary">
          앞 버튼
        </Button>
        <Presence show={show}>
          <div className="border-border bg-card mx-2 flex h-8 items-center rounded-lg border px-3 text-sm">
            <SwitchField className="h-full" label="알림 받기" defaultChecked />
          </div>
        </Presence>
        <Button size="small" variant="secondary" className="ml-2">
          뒤 버튼
        </Button>
      </div>
    </div>
  );
}
