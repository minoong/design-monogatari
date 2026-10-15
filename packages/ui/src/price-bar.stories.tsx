import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from './button';
import { PriceBar, PriceBarActions, PriceBarTotal, PriceBreakdown, PriceRow } from './price-bar';

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
