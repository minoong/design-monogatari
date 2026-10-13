import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { OptionGroup, OptionRow } from './option-row';

const meta = {
  title: '컴포넌트/옵션 행',
  component: OptionRow,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`OptionRow`는 견적처럼 하나만 고르는 옵션 한 줄이에요. 네이티브 라디오라서 같은 `name`끼리 방향키로 이동하고, 이름·설명·선택 불가 이유가 모두 입력에 연결돼요. `unavailableReason`을 주면 행이 muted 면이 되고 이유가 행 안에 항상 보여요(호버에 의존하지 않아요). 이때도 입력은 비활성이 아니라서 눌렀을 때 대안을 안내할 수 있어요. 완전히 막으려면 `disabled`를 쓰세요. 묶음은 `OptionGroup`이 `fieldset`과 `legend`로 감싸요.',
      },
    },
  },
  args: {
    name: 'story-option',
    label: '19인치 기본 휠',
    description: '모든 트림에 기본으로 들어가요.',
    price: '기본 포함',
  },
} satisfies Meta<typeof OptionRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 기본: Story = {
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
};

export const 선택됨: Story = {
  args: { defaultChecked: true },
  decorators: 기본.decorators,
};

export const 선택불가이유: Story = {
  name: '선택 불가 + 이유',
  args: {
    label: '21인치 알로이 휠',
    description: '지름이 커서 더 단단한 인상이에요.',
    price: '+3,200,000원',
    unavailableReason: '가솔린 스포트 트림에서만 선택할 수 있어요.',
  },
  decorators: 기본.decorators,
};

export const 비활성: Story = {
  args: { disabled: true, label: '20인치 알로이 휠', price: '+1,500,000원' },
  decorators: 기본.decorators,
};

export const 뱃지와썸네일: Story = {
  name: '뱃지와 썸네일',
  args: {
    label: '크림',
    badge: (
      <span className="border-border bg-background text-muted-foreground rounded-full border px-2 py-0.5 text-xs font-semibold">
        추천
      </span>
    ),
    media: <span aria-hidden className="bg-muted border-border block size-12 rounded-md border" />,
    price: '+500,000원',
  },
  decorators: 기본.decorators,
};

function WheelGroup() {
  const [value, setValue] = useState('w19');
  const wheels = [
    { value: 'w19', label: '19인치 기본 휠', price: '기본 포함' },
    { value: 'w20', label: '20인치 알로이 휠', price: '+1,500,000원' },
    {
      value: 'w21',
      label: '21인치 알로이 휠',
      price: '+3,200,000원',
      unavailableReason: '가솔린 스포트 트림에서만 선택할 수 있어요.',
    },
  ];
  return (
    <OptionGroup legend="휠" className="w-full max-w-md">
      {wheels.map((wheel) => (
        <OptionRow
          key={wheel.value}
          name="story-wheel"
          value={wheel.value}
          label={wheel.label}
          price={wheel.price}
          unavailableReason={wheel.unavailableReason}
          checked={value === wheel.value}
          onChange={() => setValue(wheel.value)}
        />
      ))}
    </OptionGroup>
  );
}

export const 그룹: Story = {
  render: () => <WheelGroup />,
};
