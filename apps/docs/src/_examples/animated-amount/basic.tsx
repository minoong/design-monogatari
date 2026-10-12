'use client';

import { AnimatedAmount } from '@repo/ui/animated-amount';
import { Button } from '@repo/ui/button';
import { useState } from 'react';

const AMOUNTS = [12_000, 1_250_000, 98_700, 3_480_000];

export default function AnimatedAmountBasic() {
  const [index, setIndex] = useState(0);

  return (
    <div className="flex flex-col items-center gap-4">
      <AnimatedAmount value={AMOUNTS[index]!} className="text-title font-semibold" />
      <Button variant="secondary" onClick={() => setIndex((index + 1) % AMOUNTS.length)}>
        금액 바꾸기
      </Button>
    </div>
  );
}
