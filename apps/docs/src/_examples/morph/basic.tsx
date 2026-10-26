'use client';

import { Button } from '@repo/ui/button';
import { Morph } from '@repo/ui/morph';
import { SwitchField } from '@repo/ui/switch-field';
import { useState } from 'react';

const ORDER = ['switch', 'note'] as const;
const RADII = { switch: 18, note: 8 };

export default function MorphBasic() {
  const [kind, setKind] = useState<'switch' | 'note'>('switch');
  // 안의 컨트롤 상태는 부모가 든다(내용이 바뀌면 안의 요소가 새로 만들어진다).
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex gap-2">
        <Button
          aria-pressed={kind === 'switch'}
          size="small"
          variant="secondary"
          onClick={() => {
            setKind('switch');
          }}
        >
          외관
        </Button>
        <Button
          aria-pressed={kind === 'note'}
          size="small"
          variant="secondary"
          onClick={() => {
            setKind('note');
          }}
        >
          시트
        </Button>
      </div>
      <div className="border-border bg-card relative h-36 w-96 max-w-full overflow-hidden rounded-lg border">
        <div className="absolute top-3 left-3 z-10 max-w-[calc(100%-1.5rem)]">
          <Morph
            className="bg-background/95 border-border max-w-full border backdrop-blur-sm"
            order={ORDER}
            radii={RADII}
            value={kind}
          >
            {kind === 'note' ? (
              <p className="text-foreground text-caption px-2.5 py-1.5">
                실내 색은 근사값이고 시트 구성과 가니쉬는 반영되지 않습니다.
              </p>
            ) : (
              <div className="flex py-1 pr-3 pl-1">
                <SwitchField
                  checked={open}
                  label="선루프 열어 보기"
                  status={{ on: '열림', off: '닫힘' }}
                  onChange={(event) => {
                    setOpen(event.target.checked);
                  }}
                />
              </div>
            )}
          </Morph>
        </div>
      </div>
    </div>
  );
}
