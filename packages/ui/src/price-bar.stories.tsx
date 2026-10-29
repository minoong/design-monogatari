import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from './button';
import { ArrowLeftIcon } from './icons/arrow-left';
import { ArrowRightIcon } from './icons/arrow-right';
import { PriceBar, PriceBarActions, PriceBarTotal, PriceBreakdown, PriceRow } from './price-bar';
import { textControls } from './storybook/arg-types';

const meta = {
  title: '컴포넌트/가격 막대',
  component: PriceBar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`PriceBar`는 견적 총액, 요약 열기 버튼, 이전·다음 버튼을 한 줄에 모은 막대입니다. 총액은 숫자가 굴러가며 바뀌고, 멈춘 뒤 스크린 리더에 "이름 + 금액"이 읽힙니다. `PriceBreakdown`과 `PriceRow`는 항목별 금액 목록입니다. 위치는 호출하는 쪽이 정하고 `fixed`를 주면 화면 아래에 붙습니다.',
      },
    },
  },
  decorators: [
    (Story) => (
      // transform이 있는 조상은 fixed 자손의 기준이 되어, 스토리 안에서 막대가 이 틀 아래에 붙는다.
      <div className="border-border relative h-64 w-full max-w-3xl transform-[translateZ(0)] overflow-hidden rounded-lg border">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    fixed: { control: 'boolean' },
    ...textControls('aria-label'),
  },
} satisfies Meta<typeof PriceBar>;

export default meta;

type Story = StoryObj<typeof meta>;

const BASE = 82_900_000;

function PriceBarDemo() {
  const [packageOn, setPackageOn] = useState(false);
  const amount = BASE + (packageOn ? 5_000_000 : 0);

  return (
    <PriceBar fixed>
      <PriceBarTotal amount={amount} note="취득세와 부대비용 별도" />
      <PriceBarActions>
        <Button
          variant="secondary"
          onClick={() => {
            setPackageOn((on) => !on);
          }}
        >
          {packageOn ? '파퓰러 패키지 빼기' : '파퓰러 패키지 더하기'}
        </Button>
        <Button variant="primary">다음 단계</Button>
      </PriceBarActions>
    </PriceBar>
  );
}

export const 기본: Story = {
  render: () => <PriceBarDemo />,
};

const NARROW_AMOUNTS = [
  { label: '8천만 원대', amount: 82_900_000 },
  { label: '1억 원대', amount: 129_850_000 },
  { label: '11억 원대', amount: 1_129_850_000 },
] as const;

function NarrowBar({ width, amount }: { width: number; amount: number }) {
  return (
    <figure className="m-0 max-w-full" style={{ width }}>
      <figcaption className="text-muted-foreground text-caption mb-1">{width}px 폭</figcaption>
      <PriceBar className="border-border gap-x-3 gap-y-2 rounded-lg border">
        <PriceBarTotal amount={amount} />
        <PriceBarActions className="ml-auto flex-nowrap">
          <Button variant="secondary">
            <ArrowLeftIcon data-icon="inline-start" />
            이전
          </Button>
          <Button variant="primary">
            다음
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </PriceBarActions>
      </PriceBar>
    </figure>
  );
}

export const 좁은폭: Story = {
  name: '좁은 폭에서 글자 줄이기',
  parameters: {
    docs: {
      description: {
        story:
          '금액이 버튼 옆 자리보다 길면 글자 크기를 줄여 한 줄에 맞춥니다(제목 크기의 절반까지). 그래도 안 들어가는 폭에서는 총액이 자기 줄로 내려갑니다. 금액을 바꿔 두 폭을 비교해 보십시오.',
      },
    },
  },
  render: () => <NarrowDemo />,
};

function NarrowDemo() {
  const [index, setIndex] = useState(1);
  const { amount } = NARROW_AMOUNTS[index] ?? NARROW_AMOUNTS[0];

  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="금액">
        {NARROW_AMOUNTS.map((item, i) => (
          <Button
            key={item.label}
            size="small"
            variant={i === index ? 'primary' : 'secondary'}
            aria-pressed={i === index}
            onClick={() => {
              setIndex(i);
            }}
          >
            {item.label}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-start gap-3">
        <NarrowBar width={390} amount={amount} />
        <NarrowBar width={320} amount={amount} />
      </div>
    </div>
  );
}

export const 항목별금액: Story = {
  name: '항목별 금액',
  decorators: [
    (Story) => (
      <div className="border-border w-full max-w-md rounded-lg border p-4">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <PriceBreakdown title="견적 요약">
      <PriceRow label="기본 가격" amount={82_900_000} />
      <PriceRow
        label="외장 색상 · 브루클린 그레이"
        amount={1_000_000}
        signed
        action={
          <a
            href="#exterior"
            aria-label="외장 색상 변경"
            className="text-foreground text-caption underline underline-offset-2"
          >
            변경
          </a>
        }
      />
      <PriceRow label="휠 · 19인치 기본 휠" amount="기본 포함" />
      <PriceRow label="프로모션" amount={-1_500_000} signed />
      <PriceRow label="예상 견적 금액" amount={82_400_000} total />
    </PriceBreakdown>
  ),
};
