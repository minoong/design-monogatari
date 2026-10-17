'use client';

import { Button } from '@repo/ui/button';
import { useState } from 'react';

const VIEWS = ['외관', '휠', '시트', '대시보드'] as const;

export default function ButtonPressed() {
  const [view, setView] = useState<(typeof VIEWS)[number]>('외관');
  const [open, setOpen] = useState(false);

  return (
    <>
      <div aria-label="카메라 시점" className="flex flex-wrap gap-2" role="group">
        {VIEWS.map((name) => (
          <Button
            key={name}
            aria-pressed={view === name}
            size="small"
            variant="secondary"
            onClick={() => {
              setView(name);
            }}
          >
            {name}
          </Button>
        ))}
      </div>
      <Button
        aria-pressed={open}
        size="small"
        variant="secondary"
        onClick={() => {
          setOpen((value) => !value);
        }}
      >
        선루프 열기
      </Button>
    </>
  );
}
