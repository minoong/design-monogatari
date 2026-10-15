'use client';

import { Button } from '@repo/ui/button';
import { Progress } from '@repo/ui/progress';
import { useState } from 'react';

export default function ProgressBasic() {
  const [value, setValue] = useState(40);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Progress label="모델 불러오는 중" value={value} />
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={() => {
            setValue((current) => Math.min(current + 20, 100));
          }}
        >
          20% 올리기
        </Button>
        <Button
          variant="clear"
          onClick={() => {
            setValue(0);
          }}
        >
          처음으로
        </Button>
      </div>
    </div>
  );
}
