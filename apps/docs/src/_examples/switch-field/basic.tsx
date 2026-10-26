'use client';

import { SwitchField } from '@repo/ui/switch-field';
import { useState } from 'react';

export default function SwitchFieldBasic() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <SwitchField
        label="선루프 열어 보기"
        status={{ on: '열림', off: '닫힘' }}
        checked={open}
        onChange={(event) => {
          setOpen(event.target.checked);
        }}
      />
      <p className="text-muted-foreground text-caption">상태: {open ? '열림' : '닫힘'}</p>
    </div>
  );
}
