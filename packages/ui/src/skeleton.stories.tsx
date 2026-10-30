import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from './button';
import { Skeleton, SkeletonGroup } from './skeleton';

const meta = {
  title: '컴포넌트/스켈레톤',
  component: Skeleton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`Skeleton`은 불러오는 중인 자리를 채우는 회색 막대입니다. 크기와 모양은 `className`으로 실제 내용에 맞춥니다. 스크린 리더에는 숨기고, 화면 밖에서는 깜빡임을 멈추며, 감소 모션에서는 깜빡이지 않습니다. `SkeletonGroup`이 화면에서 숨긴 "불러오는 중입니다"를 스크린 리더가 훑을 때 읽게 합니다. 내용이 도착하면 묶음을 지우고 실제 내용으로 바꾸십시오.',
      },
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 기본: Story = {
  render: () => (
    <SkeletonGroup label="견적을 불러오는 중입니다" className="flex w-80 flex-col gap-3">
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </SkeletonGroup>
  ),
};

export const 옵션행: Story = {
  name: '옵션 행',
  render: () => (
    <SkeletonGroup label="옵션을 불러오는 중입니다" className="flex w-96 flex-col gap-2">
      {[0, 1, 2].map((index) => (
        <div key={index} className="border-border flex items-start gap-3 rounded-lg border p-4">
          <Skeleton className="mt-0.5 size-5 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-4/5" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </SkeletonGroup>
  ),
};

function LoadedDemo() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="flex w-80 flex-col gap-4">
      {loaded ? (
        <div className="flex flex-col gap-1">
          <p className="text-foreground text-sm font-semibold">예상 견적 금액</p>
          <p className="text-title font-semibold">₩82,900,000</p>
        </div>
      ) : (
        <SkeletonGroup label="견적을 불러오는 중입니다" className="flex flex-col gap-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-9 w-3/4" />
        </SkeletonGroup>
      )}
      <Button
        variant="secondary"
        onClick={() => {
          setLoaded((value) => !value);
        }}
      >
        {loaded ? '다시 불러오기' : '불러오기 완료'}
      </Button>
    </div>
  );
}

export const 내용으로바뀜: Story = {
  name: '내용으로 바뀜',
  render: () => <LoadedDemo />,
};
