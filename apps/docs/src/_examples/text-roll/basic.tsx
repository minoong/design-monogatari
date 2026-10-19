'use client';

import { Button } from '@repo/ui/button';
import { ArrowLeftIcon } from '@repo/ui/icons/arrow-left';
import { ArrowRightIcon } from '@repo/ui/icons/arrow-right';
import { TextRoll } from '@repo/ui/text-roll';
import { useState } from 'react';

const STEPS = ['모델', '외장 색상', '휠', '시트', '내장', '선택 품목', '액세서리', '견적 결과'];

export default function TextRollBasic() {
  const [index, setIndex] = useState(1);
  const [direction, setDirection] = useState<'up' | 'down'>('up');

  function go(delta: number) {
    setDirection(delta > 0 ? 'up' : 'down');
    setIndex((value) => Math.min(STEPS.length - 1, Math.max(0, value + delta)));
  }

  return (
    <div className="flex w-full flex-col items-start gap-6">
      <h3 className="m-0 text-2xl font-semibold tracking-tight">
        <span className="sr-only">{index + 1}단계: </span>
        <TextRoll direction={direction}>{STEPS[index] ?? ''}</TextRoll>
      </h3>
      <div className="flex gap-2">
        <Button
          disabled={index === 0}
          variant="secondary"
          onClick={() => {
            go(-1);
          }}
        >
          <ArrowLeftIcon data-icon="inline-start" />
          이전
        </Button>
        <Button
          disabled={index === STEPS.length - 1}
          variant="primary"
          onClick={() => {
            go(1);
          }}
        >
          다음
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </div>
    </div>
  );
}
