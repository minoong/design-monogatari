import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Segmented, type SegmentedIndicator, SegmentedItem } from './segmented';
import { noControls } from './storybook/arg-types';

const meta = {
  title: '컴포넌트/세그먼트',
  component: Segmented,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '둘에서 넷쯤 되는 선택지 중 하나를 고르는 묶음입니다. 보이는 모양은 알약이지만 속은 네이티브 라디오라서 같은 이름끼리 방향키 이동, 폼 전송, `radiogroup` 의미를 브라우저가 처리합니다. 선택이 바뀌면 선택 표시가 이전 항목에서 새 항목으로 미끄러집니다(`SPRING.settle`, 넘치지 않고 멈춥니다. 감소 모션이면 바로 옮겨 갑니다). `indicator`로 모양을 고릅니다: `pill`(배경 채움 알약), `underline`(아래 막대), `ring`(테두리 링). `aria-label`로 묶음의 이름을 꼭 주십시오.',
      },
    },
  },
  args: { children: null, 'aria-label': '과세 구분' },
  argTypes: {
    ...noControls('children', 'value', 'defaultValue', 'onValueChange', 'name'),
    indicator: { control: 'inline-radio', options: ['pill', 'underline', 'ring'] },
  },
} satisfies Meta<typeof Segmented>;

export default meta;

type Story = StoryObj<typeof meta>;

function Taxes({ indicator }: { indicator?: SegmentedIndicator }) {
  return (
    <Segmented aria-label="과세 구분" defaultValue="taxed" indicator={indicator}>
      <SegmentedItem value="taxed">과세</SegmentedItem>
      <SegmentedItem value="exempt">면세</SegmentedItem>
    </Segmented>
  );
}

export const 기본: Story = {
  render: (args) => <Taxes indicator={args.indicator} />,
};

export const 세_가지_모양: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '같은 선택 묶음을 세 모양으로 놓았습니다. 각각 눌러서 선택 표시가 미끄러지는 모습을 비교해 보십시오.',
      },
    },
  },
  render: () => (
    <div className="flex flex-col items-start gap-6">
      {(['pill', 'underline', 'ring'] as const).map((indicator) => (
        <div key={indicator} className="flex flex-col gap-2">
          <p className="text-muted-foreground text-caption">{indicator}</p>
          <Segmented
            aria-label={`보기 방식 ${indicator}`}
            defaultValue="exterior"
            indicator={indicator}
          >
            <SegmentedItem value="exterior">외관</SegmentedItem>
            <SegmentedItem value="interior">내장</SegmentedItem>
            <SegmentedItem value="wheel">휠</SegmentedItem>
          </Segmented>
        </div>
      ))}
    </div>
  ),
};

export const 비활성_항목: Story = {
  render: (args) => (
    <Segmented aria-label="구동 방식" defaultValue="rear" indicator={args.indicator}>
      <SegmentedItem value="rear">후륜</SegmentedItem>
      <SegmentedItem value="all">사륜</SegmentedItem>
      <SegmentedItem value="hybrid" disabled>
        하이브리드
      </SegmentedItem>
    </Segmented>
  ),
};

function Controlled({ indicator }: { indicator?: SegmentedIndicator }) {
  const [value, setValue] = useState('taxed');
  return (
    <div className="flex flex-col gap-3">
      <Segmented
        aria-label="과세 구분"
        indicator={indicator}
        value={value}
        onValueChange={setValue}
      >
        <SegmentedItem value="taxed">과세</SegmentedItem>
        <SegmentedItem value="exempt">면세</SegmentedItem>
      </Segmented>
      <p className="text-muted-foreground text-caption">
        선택: {value === 'taxed' ? '과세' : '면세'}
      </p>
    </div>
  );
}

export const 제어됨: Story = {
  render: (args) => <Controlled indicator={args.indicator} />,
};
