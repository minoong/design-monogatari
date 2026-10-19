import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from './button';
import { ArrowLeftIcon } from './icons/arrow-left';
import { ArrowRightIcon } from './icons/arrow-right';
import { TextRoll } from './text-roll';

const STEPS = ['모델', '외장 색상', '휠', '시트', '내장', '선택 품목', '액세서리', '견적 결과'];

const meta = {
  title: '컴포넌트/글자 롤',
  component: TextRoll,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`TextRoll`은 글자가 바뀔 때 이전 글자가 위로 밀려 나가고 새 글자가 아래에서 바로 뒤따라 올라오게 합니다. 단계 제목처럼 한 자리에서 짧은 제목만 바뀌는 곳에 씁니다. 처음 그려질 때는 움직이지 않고, 감소 모션이면 이동 없이 바로 바뀝니다.',
      },
    },
  },
  args: {
    children: '외장 색상',
  },
} satisfies Meta<typeof TextRoll>;

export default meta;

type Story = StoryObj<typeof meta>;

function Stepping() {
  const [index, setIndex] = useState(1);
  const [direction, setDirection] = useState<'up' | 'down'>('up');

  function go(delta: number) {
    setDirection(delta > 0 ? 'up' : 'down');
    setIndex((value) => Math.min(STEPS.length - 1, Math.max(0, value + delta)));
  }

  return (
    <div className="flex flex-col items-start gap-6">
      <h2 className="text-title font-semibold tracking-tight">
        <span className="sr-only">{index + 1}단계: </span>
        <TextRoll direction={direction}>{STEPS[index] ?? ''}</TextRoll>
      </h2>
      <div className="flex gap-2">
        <Button
          disabled={index === 0}
          variant="secondary"
          onClick={() => {
            go(-1);
          }}
        >
          <ArrowLeftIcon data-icon="inline-start" />
          이전
        </Button>
        <Button
          disabled={index === STEPS.length - 1}
          variant="primary"
          onClick={() => {
            go(1);
          }}
        >
          다음
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </div>
    </div>
  );
}

export const 기본: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '단계 제목입니다. 다음을 누르면 이전 글자가 위로 나가고 새 글자가 그 바로 뒤에서 올라오며, 이전을 누르면 반대로 위에서 내려옵니다(`direction`). 글자 전체가 한 덩어리로 움직여서 순서가 섞이지 않습니다.',
      },
    },
  },
  render: () => <Stepping />,
};

function LongText() {
  const [first, setFirst] = useState(true);

  return (
    <div className="flex max-w-sm flex-col items-start gap-6">
      <p className="text-body">
        <TextRoll>
          {first
            ? '선택한 구성의 견적입니다. 과세 구분과 등록 지역에 따라 취득세가 달라집니다.'
            : '외장 색상을 고릅니다. 무광과 일부 메탈릭은 가격이 더해지는 색상입니다.'}
        </TextRoll>
      </p>
      <Button
        variant="secondary"
        onClick={() => {
          setFirst((value) => !value);
        }}
      >
        문장 바꾸기
      </Button>
    </div>
  );
}

export const 두_줄: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '줄이 두 개여도 글자 전체가 한 덩어리로 움직여서 겹치지 않습니다. 두 글자의 줄 수가 같을 때 가장 깔끔하고, 긴 문장보다는 제목처럼 짧은 글자에 맞습니다.',
      },
    },
  },
  render: () => <LongText />,
};
