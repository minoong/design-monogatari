'use client';

import { Label } from '@repo/ui/label';
import { Switch } from '@repo/ui/switch';
import { useState } from 'react';

export default function SwitchBasic() {
  const [on, setOn] = useState(true);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Switch
          id="switch-basic"
          checked={on}
          onChange={(event) => {
            setOn(event.target.checked);
          }}
        />
        <Label htmlFor="switch-basic">견적 알림 받기</Label>
      </div>
      <p className="text-muted-foreground text-caption">상태: {on ? '켜짐' : '꺼짐'}</p>
    </div>
  );
}
