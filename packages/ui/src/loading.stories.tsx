import type { Meta, StoryObj } from '@storybook/react';

import { Loading } from './loading';

const meta = {
  title: '컴포넌트/로딩',
  component: Loading,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`Loading`은 화면이나 패널이 준비되는 동안 보여 주는 상태예요. 버튼 안의 점 세 개와 달리 이중 링을 돌리고, `progress`가 있으면 비율 링으로 바뀝니다. Lottie가 아니라 Motion입니다. `prefers-reduced-motion`이면 회전을 멈춥니다.',
      },
    },
  },
} satisfies Meta<typeof Loading>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 기본: Story = {};

export const 큰: Story = {
  args: {
    size: 'large',
    label: '모델을 불러오는 중',
  },
};

export const 진행률: Story = {
  args: {
    size: 'large',
    label: '불러오는 중',
    progress: 0.62,
  },
};
