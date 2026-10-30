import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ComponentProps, useState } from 'react';

import { ColorSwatchGroup, type ColorSwatchOption } from './color-swatch-group';
import { noControls, textControls } from './storybook/arg-types';

// 데모용 색이다. 컴포넌트는 색을 정하지 않고 호출하는 쪽이 `color`로 넘긴다.
const options: ColorSwatchOption[] = [
  { value: 'white', label: '화이트', color: '#f2f2f0', group: '글로시', price: '기본 포함' },
  { value: 'black', label: '블랙', color: '#1a1a1c', group: '글로시', price: '기본 포함' },
  { value: 'blue', label: '블루', color: '#27406b', group: '글로시', price: '기본 포함' },
  { value: 'pearl', label: '펄 화이트', color: '#e8e6df', group: '메탈릭', price: '+₩1,000,000' },
  {
    value: 'bronze',
    label: '브론즈',
    color: '#7a5c3e',
    group: '메탈릭',
    price: '+₩1,000,000',
    unavailableReason: '스포트 트림에서만 선택할 수 있습니다.',
  },
  {
    value: 'matte-gray',
    label: '무광 그레이',
    color: '#6b6d70',
    group: '무광',
    price: '+₩8,000,000',
    unavailableReason: '스포트 트림에서만 선택할 수 있습니다.',
  },
];

function ControlledSwatches(props: ComponentProps<typeof ColorSwatchGroup>) {
  const [value, setValue] = useState(props.value);
  return <ColorSwatchGroup {...props} value={value} onValueChange={setValue} />;
}

const meta = {
  title: '컴포넌트/색 칩 그룹',
  component: ColorSwatchGroup,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`ColorSwatchGroup`은 외장·내장 색을 칩으로 고르는 라디오 묶음입니다. `group`이 같은 칩은 소제목 아래 묶이고, 선택한 칩은 두 겹 링으로 보입니다. 칩에 마우스를 올리거나 키보드로 포커스하면 아래 캡션에 이름과 가격이 보이고, `unavailableReason`이 있는 칩은 사선이 그어지며 캡션에 이유가 보입니다. 색 값은 호출하는 쪽이 넘기고 이 컴포넌트는 정하지 않습니다.',
      },
    },
  },
  args: {
    legend: '외장 색상',
    name: 'story-color',
    value: 'white',
    options,
    onValueChange: () => {},
  },
  render: (args) => <ControlledSwatches {...args} />,
  argTypes: {
    ...textControls('legend', 'unavailableHint'),
    ...noControls('onValueChange', 'options'),
  },
} satisfies Meta<typeof ColorSwatchGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 기본: Story = {};

export const 그룹없음: Story = {
  name: '그룹 없음',
  args: { options: options.slice(0, 3).map((option) => ({ ...option, group: undefined })) },
};

export const 선택불가포함: Story = {
  name: '선택 불가 포함',
  args: { value: 'pearl' },
};
