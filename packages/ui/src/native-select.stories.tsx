import type { Meta, StoryObj } from '@storybook/react-vite';

import { Label } from './label';
import { NativeSelect } from './native-select';

const meta = {
  title: '컴포넌트/네이티브 셀렉트',
  component: NativeSelect,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`NativeSelect`는 브라우저 기본 `<select>`에 Input과 같은 높이·테두리·포커스 링을 입힌 컴포넌트입니다. 모바일에서는 OS 선택 창이 열리고 키보드·스크린 리더 동작은 기본 그대로입니다. 옵션 목록을 직접 그리는 드롭다운이 필요하면 쓰지 마십시오.',
      },
    },
  },
  args: { id: 'story-select' },
  render: (args) => (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor={args.id}>탁송지</Label>
      <NativeSelect {...args}>
        <option value="seoul">서울</option>
        <option value="gyeonggi">경기</option>
        <option value="busan">부산</option>
        <option value="jeju">제주</option>
      </NativeSelect>
    </div>
  ),
} satisfies Meta<typeof NativeSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 기본: Story = {};

export const 비활성: Story = { args: { disabled: true } };

export const 오류: Story = { args: { 'aria-invalid': true } };
