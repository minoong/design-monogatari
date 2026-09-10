import type { Meta, StoryObj } from '@storybook/react';

import { Input } from './input';
import { Label } from './label';

const meta = {
  title: '컴포넌트/라벨',
  component: Label,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`Label`은 입력 칸이 무엇을 받는지 알려 줘요. 반드시 `htmlFor`와 입력 `id`를 짝지어 주세요.',
      },
    },
  },
  args: {
    children: '이메일',
    htmlFor: 'label-email',
  },
} satisfies Meta<typeof Label>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 기본: Story = {
  render: (args) => (
    <div className="grid w-full max-w-sm gap-2">
      <Label {...args} />
      <Input id="label-email" type="email" placeholder="you@example.com" />
    </div>
  ),
};
