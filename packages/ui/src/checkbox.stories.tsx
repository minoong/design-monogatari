import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Checkbox } from './checkbox';
import { Label } from './label';

const meta = {
  title: '컴포넌트/체크박스',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`Checkbox`는 여러 항목을 각각 켜고 끌 때 쓰는 네이티브 체크박스입니다. 스페이스로 켜고 끄는 동작과 폼 값은 브라우저가 맡고, 보이는 이름표는 `Label`을 `htmlFor`로 이어 주십시오. 체크하면 0.32초 튀어 오르고, 해제하면 채움과 체크 표시가 줄어들며 0.2초 안에 사라집니다. 처음 그려질 때와 감소 모션 설정에서는 움직이지 않습니다. 체크 표시는 모양으로 구분되어 색에만 기대지 않습니다.',
      },
    },
  },
  args: { id: 'story-checkbox' },
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 기본: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox {...args} />
      <Label htmlFor={args.id}>견적서를 이메일로 받겠습니다</Label>
    </div>
  ),
};

export const 선택됨: Story = {
  args: { defaultChecked: true },
  render: 기본.render,
};

export const 비활성: Story = {
  args: { disabled: true },
  render: (args) => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Checkbox {...args} />
        <Label htmlFor={args.id}>선택할 수 없습니다</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox {...args} id="story-checkbox-b" defaultChecked />
        <Label htmlFor="story-checkbox-b">선택된 채로 잠겼습니다</Label>
      </div>
    </div>
  ),
};

export const 오류: Story = {
  args: { 'aria-invalid': true },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox {...args} />
      <Label htmlFor={args.id}>유의사항을 확인했습니다</Label>
    </div>
  ),
};

function Accessories() {
  const [selected, setSelected] = useState<string[]>(['floor-mat']);
  const items: [string, string][] = [
    ['floor-mat', '프리미엄 플로어 매트'],
    ['dashcam', '빌트인 블랙박스'],
    ['tow-hitch', '견인 장치'],
  ];

  return (
    <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
      <legend className="mb-3 p-0 text-sm font-semibold">액세서리</legend>
      {items.map(([value, label]) => (
        <div key={value} className="flex items-center gap-2">
          <Checkbox
            id={`story-accessory-${value}`}
            checked={selected.includes(value)}
            onChange={(event) =>
              setSelected((current) =>
                event.target.checked ? [...current, value] : current.filter((id) => id !== value),
              )
            }
          />
          <Label htmlFor={`story-accessory-${value}`}>{label}</Label>
        </div>
      ))}
    </fieldset>
  );
}

export const 그룹: Story = {
  render: () => <Accessories />,
};
