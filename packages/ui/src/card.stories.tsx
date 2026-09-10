import type { Meta, StoryObj } from '@storybook/react';

import { Card } from './card';

const meta = {
  title: '컴포넌트/카드',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`Card`는 관련 정보를 한 덩어리로 묶어 줄 때 사용해요. 그림자는 올리지 않고, 헤어라인 테두리로 면을 나눠 주세요.',
      },
    },
  },
  args: {
    title: '이용 안내',
    href: 'https://turborepo.dev',
    children: '이체 한도와 수수료는 상품마다 달라요. 진행 전에 한 번 더 확인해 주세요.',
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 기본: Story = {};
