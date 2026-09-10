import type { Meta, StoryObj } from '@storybook/react';

import { Input } from './input';
import { Label } from './label';

const meta = {
  title: '컴포넌트/입력',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`Input`은 사용자가 값을 적을 때 사용해요. 높이는 44px, 모서리는 rounded-md, 안내 문구는 보조 글자색을 써 주세요.',
      },
    },
  },
  args: {
    placeholder: '이름 또는 이메일',
    type: 'email',
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 기본: Story = {};

export const 비활성: Story = {
  args: {
    disabled: true,
    placeholder: '지금은 수정할 수 없어요',
  },
};

export const 라벨과함께: Story = {
  name: '라벨과 함께',
  render: (args) => (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="email">이메일</Label>
      <Input id="email" {...args} />
    </div>
  ),
};
