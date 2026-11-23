import { Badge } from '@repo/ui/badge';
import { Button } from '@repo/ui/button';
import type { CSSProperties } from 'react';

import { Stage } from './stage';
import { SuvDither } from './suv-dither';

/** 같은 코드, 다른 테마 클래스. 토큰은 `.light`/`.dark` 어느 요소에든 걸 수 있어서 한 화면에 둘을 나란히 둔다. */
function TokenCard({ tone }: { tone: 'light' | 'dark' }) {
  return (
    <div
      className={`${tone} lp-float bg-background text-foreground border-border min-w-0 rounded-lg border p-5`}
      data-ds-preview
      style={{ '--lp-float': tone === 'light' ? '24px' : '-24px' } as CSSProperties}
    >
      <p className="text-muted-foreground m-0 mb-3 font-mono text-xs">
        {tone === 'light' ? 'html.light' : 'html.dark'}
      </p>
      <div aria-label={`${tone === 'light' ? '라이트' : '다크'} 토큰으로 찍은 SUV`} role="img">
        <SuvDither tone={tone} />
      </div>
      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-muted-foreground m-0 text-sm">견적 합계</p>
          <p className="m-0 text-2xl font-semibold tracking-tight">₩93,200,000</p>
        </div>
        <Button radius="pill" size="small" variant="primary">
          견적 저장
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge>상담 대기</Badge>
        <Badge variant="secondary">재고 있음</Badge>
        <Badge variant="destructive">재고 없음</Badge>
      </div>
    </div>
  );
}

/** 토큰 구역의 장면: 라이트와 다크를 나란히 두고, SUV 점도 각자의 토큰 색으로 찍는다. */
export function SceneTokens() {
  return (
    <Stage
      caption="같은 구성 요소를 라이트와 다크 토큰으로 나란히 보여 줍니다"
      file="packages/ui/src/styles/globals.css"
    >
      <div className="grid gap-4 p-4 md:grid-cols-2 md:p-8">
        <TokenCard tone="light" />
        <TokenCard tone="dark" />
      </div>
    </Stage>
  );
}
