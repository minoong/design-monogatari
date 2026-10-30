import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId, useState } from 'react';

import { Button } from './button';
import { ArrowLeftIcon } from './icons/arrow-left';
import { ArrowRightIcon } from './icons/arrow-right';
import { Input } from './input';
import { Label } from './label';
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
  decorators: [
    (Story) => (
      // transform이 있는 조상은 fixed 자손의 기준이 되어, 스토리 안에서 막대가 이 틀 아래에 붙는다.
      <div className="border-border relative h-64 w-full max-w-3xl transform-[translateZ(0)] overflow-hidden rounded-lg border">
        <Story />
      </div>
    ),
  ],
  render: () => <PriceBarDemo />,
};

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

const MAX_DIGITS = 12;

function TypedAmountDemo() {
  const [digits, setDigits] = useState('82900000');
  const amount = Number(digits || '0');
  const inputId = useId();

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex max-w-xs flex-col gap-1.5">
        <Label htmlFor={inputId}>금액(원)</Label>
        <Input
          id={inputId}
          inputMode="numeric"
          autoComplete="off"
          value={digits ? new Intl.NumberFormat('ko-KR').format(Number(digits)) : ''}
          placeholder="숫자를 입력하십시오"
          onChange={(event) => {
            setDigits(
              event.target.value.replace(/\D/g, '').slice(0, MAX_DIGITS).replace(/^0+/, ''),
            );
          }}
        />
      </div>
      <div className="flex flex-wrap items-start gap-4">
        <NarrowBar width={390} amount={amount} />
        <NarrowBar width={320} amount={amount} />
      </div>
    </div>
  );
}

export const 입력으로줄이기: Story = {
  name: '숫자를 입력하면 글자가 줄어듭니다',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          '금액을 입력하면 자릿수가 늘수록 총액 글자가 줄어 버튼 옆 한 줄에 맞춥니다(제목 크기의 절반까지). 절반으로도 안 들어가는 폭(320px)에서는 총액이 자기 줄로 내려가 글자가 다시 원래 크기가 됩니다. 두 막대는 같은 금액을 받습니다.',
      },
    },
  },
  render: () => <TypedAmountDemo />,
};

export const 폭별비교: Story = {
  name: '폭별 비교',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          '같은 금액(133,150,000원)을 390px, 360px, 320px 폭의 막대에 넣었습니다. 폭이 좁을수록 글자가 줄다가, 더는 줄일 수 없는 폭에서는 줄바꿈됩니다.',
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      <NarrowBar width={390} amount={133_150_000} />
      <NarrowBar width={360} amount={133_150_000} />
      <NarrowBar width={320} amount={133_150_000} />
    </div>
  ),
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
