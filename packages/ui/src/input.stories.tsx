import type { Meta, StoryObj } from '@storybook/react-vite';

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
          '`Input`은 사용자가 값을 적을 때 사용합니다. 높이는 44px, 모서리는 rounded-md, 안내 문구는 보조 글자색을 써 주십시오. 오류는 `aria-invalid`로 destructive 보더·링이 켜집니다. 비활성은 불투명도가 아니라 muted 면입니다.',
      },
    },
  },
  args: {
    placeholder: '모델명 또는 트림 검색',
    type: 'email',
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'number', 'password', 'search', 'tel', 'url'],
    },
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 기본: Story = {};

export const 비활성: Story = {
  args: {
    disabled: true,
    placeholder: '지금은 수정할 수 없습니다',
  },
};

export const 오류: Story = {
  args: {
    'aria-invalid': true,
    defaultValue: 'not-an-email',
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
