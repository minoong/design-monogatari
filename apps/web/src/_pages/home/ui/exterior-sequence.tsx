'use client';

import { ScrollImageSequence } from '@repo/ui/scroll-image-sequence';
import { useEffect, useState } from 'react';

const FRAME_COUNT = 181;

export const EXTERIOR_FRAMES = Array.from(
  { length: FRAME_COUNT },
  (_, index) => `/exterior/desktop/${String(index).padStart(4, '0')}.avif`,
);

const FIRST_FRAME = '/exterior/desktop/0000.avif';

export function ExteriorSequence() {
  const [hasFrames, setHasFrames] = useState(true);

  useEffect(() => {
    const image = new Image();
    image.onerror = () => {
      setHasFrames(false);
    };
    image.src = FIRST_FRAME;
  }, []);

  if (!hasFrames) {
    return (
      <p className="text-muted-foreground text-caption px-6 py-8">
        외장 시퀀스 프레임이 없어요. <code>pnpm --filter web copy:exterior</code> 를 실행하세요.
      </p>
    );
  }

  return (
    <ScrollImageSequence
      alt="Kite Coupe 앞면이 스크롤에 따라 각도를 바꿉니다."
      frames={EXTERIOR_FRAMES}
    >
      <h2 className="text-title font-semibold tracking-tight">
        매끈한 앞면이 공기를 가르며 달릴 준비를 해요
      </h2>
      <p className="text-muted-foreground text-body mt-2">
        스크롤하면 차체가 천천히 돌아 앞모습이 드러나요. 공기역학은 숫자 더미가 아니라 면의 흐름으로
        보여 줘요.
      </p>
    </ScrollImageSequence>
  );
}
