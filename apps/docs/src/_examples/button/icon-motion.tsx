'use client';

import { Button } from '@repo/ui/button';
import { CheckIcon } from '@repo/ui/icons/check';
import { XIcon } from '@repo/ui/icons/x';
import { useState } from 'react';

export default function ButtonIconMotion() {
  const [generation, setGeneration] = useState(0);

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3">
      <div key={generation} className="flex flex-wrap items-center gap-2">
        <Button iconMotion="mount" variant="secondary">
          <XIcon data-icon="inline-start" />
          취소
        </Button>
        <Button iconMotion="mount" variant="primary">
          <CheckIcon data-icon="inline-start" />
          변경 확인
        </Button>
      </div>
      <Button
        size="small"
        variant="secondary"
        onClick={() => {
          setGeneration((current) => current + 1);
        }}
      >
        다시 보기
      </Button>
    </div>
  );
}
