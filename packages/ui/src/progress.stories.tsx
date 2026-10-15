import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from './button';
import { Progress } from './progress';
import { textControls } from './storybook/arg-types';

const meta = {
  title: '컴포넌트/진행률',
  component: Progress,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`Progress`는 끝이 정해진 작업의 진행률 막대(`role="progressbar"`)입니다. 이름(`label`)이 필수이고, 값 문구는 기본이 백분율이며 `valueText`로 "4 / 13 부품"처럼 바꿀 수 있습니다. 막대는 `transform`으로만 움직이고 백분율 숫자는 굴러가며 바뀝니다. 감소 모션에서는 줄어듭니다. 언제 끝날지 모르는 작업에는 `Skeleton`을 쓰십시오.',
      },
    },
  },
  args: { label: '모델 불러오는 중', value: 40 },
  argTypes: {
    ...textControls('valueText'),
    label: { control: 'text' },
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Progress>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 기본: Story = {};

export const 값문구: Story = {
  name: '값 문구',
  args: { label: '차량 부품 불러오는 중', value: 4, max: 13, valueText: '4 / 13 부품' },
};

export const 이름숨김: Story = {
  name: '이름 숨김',
  args: { labelHidden: true, label: '견적 계산 진행률', value: 70 },
};

function StepDemo() {
  const [value, setValue] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      <Progress label="모델 불러오는 중" value={value} />
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={() => {
            setValue((current) => Math.min(current + 25, 100));
          }}
        >
          25% 올리기
        </Button>
        <Button
          variant="clear"
          onClick={() => {
            setValue(0);
          }}
        >
          처음으로
        </Button>
      </div>
    </div>
  );
}

export const 직접올려보기: Story = {
  name: '직접 올려 보기',
  render: () => <StepDemo />,
};
