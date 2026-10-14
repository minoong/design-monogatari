'use client';

import { Button } from '@repo/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import { Reveal, RevealGroup } from '@repo/ui/reveal';
import { useState } from 'react';

const ITEMS = [
  ['트림', '컴포트와 스포트 중에서 고릅니다.'],
  ['외장 색상', '글로시, 메탈릭, 무광 가운데 고릅니다.'],
  ['휠', '트림에 따라 선택할 수 있는 휠이 달라집니다.'],
];

export default function RevealBasic() {
  const [generation, setGeneration] = useState(0);

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex justify-end">
        <Button size="small" onClick={() => setGeneration((value) => value + 1)}>
          다시 재생
        </Button>
      </div>
      <RevealGroup key={generation} className="grid gap-3">
        {ITEMS.map(([title, description]) => (
          <Reveal key={title}>
            <Card>
              <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          </Reveal>
        ))}
      </RevealGroup>
    </div>
  );
}
