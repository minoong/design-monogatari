import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from './badge';

const meta = {
  title: '컴포넌트/배지',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`Badge`는 상태나 분류를 짧게 보여 줄 때 사용합니다. 기본은 정보 칩(잉크 채움), 보조는 옅은 면, 오류는 destructive 아웃라인입니다. CTA 대신 쓰지 마십시오.',
      },
    },
  },
  args: {
    children: '견적 저장 완료',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'secondary', 'destructive'] },
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 기본: Story = {};

export const 보조: Story = {
  args: {
    variant: 'secondary',
    children: '상담 대기',
  },
};

export const 오류: Story = {
  args: {
    variant: 'destructive',
    children: '재고 없음',
  },
};
