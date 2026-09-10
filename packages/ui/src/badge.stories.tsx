import type { Meta, StoryObj } from '@storybook/react';

import { Badge } from './badge';

const meta = {
  title: '컴포넌트/배지',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`Badge`는 상태나 분류를 짧게 보여 줄 때 사용해요. 기본은 잉크색 채움이고, 보조는 옅은 면에 헤어라인 테두리예요.',
      },
    },
  },
  args: {
    children: '이체 완료',
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 기본: Story = {};

export const 보조: Story = {
  args: {
    variant: 'secondary',
    children: '대기 중',
  },
};
