import type { Meta, StoryObj } from '@storybook/react-vite';

import { Label } from './label';
import { Radio } from './radio';

const meta = {
  title: '컴포넌트/라디오',
  component: Radio,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`Radio`는 여러 후보 중 하나만 고를 때 쓰는 네이티브 라디오입니다. 같은 `name`끼리 묶이면 방향키로 옮겨 다니고, 보이는 이름표는 [`Label`](?path=/docs/컴포넌트-라벨--docs)을 `htmlFor`로 이어 주십시오. 선택 상태는 테두리와 안쪽 점으로 보여 색만으로 구분하지 않습니다.',
      },
    },
  },
  args: {
    name: 'story-radio',
    id: 'story-radio-a',
  },
} satisfies Meta<typeof Radio>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 기본: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Radio {...args} />
      <Label htmlFor={args.id}>과세</Label>
    </div>
  ),
};

export const 선택됨: Story = {
  args: { defaultChecked: true },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Radio {...args} />
      <Label htmlFor={args.id}>과세</Label>
    </div>
  ),
};

export const 비활성: Story = {
  args: { disabled: true },
  render: (args) => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Radio {...args} />
        <Label htmlFor={args.id}>선택할 수 없습니다</Label>
      </div>
      <div className="flex items-center gap-2">
        <Radio {...args} id="story-radio-b" defaultChecked />
        <Label htmlFor="story-radio-b">선택된 채로 잠겼습니다</Label>
      </div>
    </div>
  ),
};

export const 오류: Story = {
  args: { 'aria-invalid': true },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Radio {...args} />
      <Label htmlFor={args.id}>하나를 골라 주십시오</Label>
    </div>
  ),
};

export const 그룹: Story = {
  render: () => (
    <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
      <legend className="mb-3 p-0 text-sm font-semibold">과세 구분</legend>
      {[
        ['taxable', '과세'],
        ['exempt', '면세'],
      ].map(([value, label], index) => (
        <div key={value} className="flex items-center gap-2">
          <Radio
            name="story-tax"
            id={`story-tax-${value}`}
            value={value}
            defaultChecked={index === 0}
          />
          <Label htmlFor={`story-tax-${value}`}>{label}</Label>
        </div>
      ))}
    </fieldset>
  ),
};
