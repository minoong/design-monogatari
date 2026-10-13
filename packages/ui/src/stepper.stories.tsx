import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Stepper, StepperItem } from './stepper';

const STEPS = [
  { value: 'model', label: '모델' },
  { value: 'color', label: '외장 색상' },
  { value: 'wheel', label: '휠' },
  { value: 'seat', label: '시트' },
  { value: 'interior', label: '내장' },
  { value: 'options', label: '선택 품목' },
  { value: 'accessory', label: '액세서리' },
  { value: 'result', label: '견적 결과' },
];

function EstimateStepper({
  initial = 'color',
  width = 'w-0 min-w-full max-w-2xl',
}: {
  initial?: string;
  width?: string;
}) {
  const [value, setValue] = useState(initial);
  const currentIndex = STEPS.findIndex((step) => step.value === value);

  return (
    <div className={width}>
      <Stepper aria-label="견적 단계" value={value}>
        {STEPS.map((step, index) => (
          <StepperItem
            key={step.value}
            value={step.value}
            completed={index < currentIndex}
            href={`#${step.value}`}
            onClick={(event) => {
              event.preventDefault();
              setValue(step.value);
            }}
          >
            {step.label}
          </StepperItem>
        ))}
      </Stepper>
    </div>
  );
}

const meta = {
  title: '컴포넌트/스테퍼',
  component: Stepper,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`Stepper`는 견적처럼 여러 단계로 나뉜 화면에서 지금 위치를 보여 주고 어느 단계로든 이동하게 하는 링크 목록입니다. `nav` 안의 번호 붙은 `ol`이며 `aria-label`이 필요합니다. 현재 단계에는 `aria-current="step"`이 붙고, 끝낸 단계는 `completed`로 체크 표시를 합니다. 폭이 좁으면 가로로 스크롤되고 현재 단계가 가운데로 옮겨집니다(감소 모션 설정이면 즉시 이동). 링크는 `href`를 주거나 `asChild`로 Next `Link`를 넘기십시오.',
      },
    },
  },
  args: { 'aria-label': '견적 단계' },
} satisfies Meta<typeof Stepper>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 기본: Story = {
  render: () => <EstimateStepper />,
};

export const 좁은폭: Story = {
  name: '좁은 폭 (스크롤과 가운데 정렬)',
  render: () => <EstimateStepper initial="interior" width="w-80" />,
};

export const 끝낸단계가현재: Story = {
  name: '끝낸 단계가 현재일 때',
  render: () => (
    <Stepper aria-label="견적 단계" value="color">
      <StepperItem value="model" href="#model" completed>
        모델
      </StepperItem>
      <StepperItem value="color" href="#color" completed>
        외장 색상
      </StepperItem>
      <StepperItem value="wheel" href="#wheel">
        휠
      </StepperItem>
    </Stepper>
  ),
};

export const 첫단계: Story = {
  name: '첫 단계',
  render: () => <EstimateStepper initial="model" />,
};

export const 마지막단계: Story = {
  name: '마지막 단계',
  render: () => <EstimateStepper initial="result" />,
};
