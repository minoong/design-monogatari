'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { useMemo } from 'react';

import { ScrollImageSequence } from './scroll-image-sequence';

function DummySequence() {
  const frames = useMemo(() => {
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
      ctx.fillStyle = `oklch(${0.96 - t * 0.08} 0.01 250)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = `oklch(${0.28 + t * 0.1} 0.04 250)`;
      const x = 120 + t * 420;
      ctx.beginPath();
      ctx.roundRect(x, 210, 320, 96, 18);
      ctx.fill();
      return canvas.toDataURL('image/png');
    });
  }, []);

  return (
    <div className="-m-8">
      <p className="text-muted-foreground text-caption px-6 py-8">아래로 스크롤해 시퀀스를 봐요.</p>
      <ScrollImageSequence alt="각도가 바뀌는 쿠페 실루엣" frames={frames} pinDistance={1.6}>
        <h2 className="text-title font-semibold tracking-tight">앞면이 공기를 가르며 돌아요</h2>
        <p className="text-body mt-2">스크롤하면 차체가 각도를 바꿔 앞모습이 드러나요.</p>
      </ScrollImageSequence>
      <p className="text-muted-foreground text-caption px-6 py-16">
        시퀀스가 끝나면 여기로 내려와요.
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
          '`ScrollImageSequence`는 스크롤 진행도를 이미지 프레임에 매핑해요. 핀과 스크럽은 GSAP ScrollTrigger예요. Motion을 같은 노드에 넣지 마세요. 에셋 URL은 소비자가 넣어요.',
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
