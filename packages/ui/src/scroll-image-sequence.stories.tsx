'use client';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo } from 'react';

import { ScrollImageSequence } from './scroll-image-sequence';

function useDummyFrames() {
  return useMemo(() => {
    if (typeof document === 'undefined') {
      return [];
    }

    const count = 24;
    return Array.from({ length: count }, (_, index) => {
      const canvas = document.createElement('canvas');
      canvas.width = 960;
      canvas.height = 540;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return '';
      }

      const t = index / (count - 1);
      // 바탕은 그리지 않는다(투명). 캔버스 뒤의 `bg-background`가 비쳐서 라이트·다크 어느 쪽에서도 글이 읽힌다.
      ctx.fillStyle = `oklch(${0.55 + t * 0.1} 0.06 250)`;
      const x = 120 + t * 420;
      ctx.beginPath();
      ctx.roundRect(x, 210, 320, 96, 18);
      ctx.fill();
      return canvas.toDataURL('image/png');
    });
  }, []);
}

function DummySequence() {
  const frames = useDummyFrames();

  return (
    <div>
      <p className="text-muted-foreground text-caption px-6 py-8">
        아래로 스크롤해 시퀀스를 봅니다.
      </p>
      <ScrollImageSequence alt="각도가 바뀌는 쿠페 실루엣" frames={frames} pinDistance={1.6}>
        <h2 className="text-title font-semibold tracking-tight">앞면이 공기를 가르며 돕니다</h2>
        <p className="text-body mt-2">스크롤하면 차체가 각도를 바꿔 앞모습이 드러납니다.</p>
      </ScrollImageSequence>
      <p className="text-muted-foreground text-caption px-6 py-16">
        시퀀스가 끝나면 여기로 내려옵니다.
      </p>
    </div>
  );
}

const meta = {
  title: '컴포넌트/스크롤시퀀스',
  component: ScrollImageSequence,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '`ScrollImageSequence`는 스크롤 진행도를 이미지 프레임에 매핑합니다. 핀과 스크럽은 GSAP ScrollTrigger입니다. Motion을 같은 노드에 넣지 마십시오. 에셋 URL은 소비자가 넣습니다.',
      },
    },
  },
} satisfies Meta<typeof ScrollImageSequence>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 기본: Story = {
  args: {
    frames: [],
  },
  render: () => <DummySequence />,
};

/** `overlay="none"`과 `--sequence-progress`: 글이 진행도 10–20%에 위로 비켜 나가고, 75% 뒤에 아래에서 올라온다. */
function ProgressOverlaySequence() {
  const frames = useDummyFrames();
  const ramp = (start: number, span: number) =>
    `clamp(0, calc((var(--sequence-progress) - ${start}) / ${span}), 1)`;

  return (
    <div>
      <p className="text-muted-foreground text-caption px-6 py-8">
        아래로 스크롤하면 제목이 비켜 나가고, 끝에서 설명이 올라옵니다.
      </p>
      <ScrollImageSequence
        alt="각도가 바뀌는 쿠페 실루엣"
        frames={frames}
        pinDistance={2}
        frameRange={[0.15, 0.75]}
        restingProgress={1}
        overlay="none"
      >
        <h2
          className="absolute inset-x-0 top-10 m-0 text-center text-4xl font-semibold tracking-tight"
          style={{
            opacity: `calc(1 - ${ramp(0.1, 0.1)})`,
            translate: `0 calc(${ramp(0.1, 0.1)} * -32px)`,
          }}
        >
          어느 각도에서 봐도
        </h2>
        <p
          className="text-body absolute inset-x-0 bottom-10 m-0 text-center"
          style={{
            opacity: ramp(0.78, 0.08),
            translate: `0 calc((1 - ${ramp(0.78, 0.08)}) * 3vh)`,
          }}
        >
          마지막 장면에 설명이 붙습니다.
        </p>
      </ScrollImageSequence>
      <p className="text-muted-foreground text-caption px-6 py-16">
        시퀀스가 끝나면 여기로 내려옵니다.
      </p>
    </div>
  );
}

export const 진행도에_묶은_글: Story = {
  args: {
    frames: [],
  },
  render: () => <ProgressOverlaySequence />,
};
