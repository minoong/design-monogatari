import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode, useId, useState } from 'react';

import { Button } from './button';
import { ArrowLeftIcon } from './icons/arrow-left';
import { ArrowRightIcon } from './icons/arrow-right';
import { Input } from './input';
import { Label } from './label';
import {
  PriceBar,
  PriceBarActions,
  type PriceBarProps,
  PriceBarTotal,
  PriceBreakdown,
  PriceRow,
} from './price-bar';
import { textControls } from './storybook/arg-types';

/** 컨트롤로 바꿔 볼 수 있는 값: 막대 자체의 속성에 총액 칸의 값을 더했다. */
type PriceBarArgs = PriceBarProps & {
  amount: number;
  label: string;
  note: string;
};

const meta = {
  title: '컴포넌트/가격 막대',
  component: PriceBar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`PriceBar`는 견적 총액, 이전·다음 버튼을 한 줄에 모은 막대입니다. 총액은 숫자가 굴러가며 바뀌고, 멈춘 뒤 스크린 리더에 "이름 + 금액"이 읽힙니다. 금액이 버튼 옆 자리보다 길면 글자가 줄어 한 줄에 맞추고, 그래도 안 들어가면 총액이 자기 줄로 내려갑니다. `PriceBreakdown`과 `PriceRow`는 항목별 금액 목록입니다. 위치는 호출하는 쪽이 정하고 `fixed`를 주면 화면 아래에 붙습니다.',
      },
    },
  },
  args: {
    amount: 82_900_000,
    label: '예상 견적 금액',
    note: '취득세와 부대비용 별도',
  },
  argTypes: {
    amount: { control: 'number' },
    // `fixed`는 화면 아래에 붙으므로 따로 둔 `고정` 스토리에서만 다룬다.
    fixed: { control: false },
    ...textControls('label', 'note', 'aria-label'),
  },
} satisfies Meta<PriceBarArgs>;

export default meta;

type Story = StoryObj<PriceBarArgs>;

/** 가운데 정렬된 캔버스에서는 막대가 내용 폭으로 줄어들므로 폭을 준다. 좁은 화면에서는 뷰포트에서 캔버스 여백을 뺀 폭까지만 줄인다. */
function Stage({ children }: { children: ReactNode }) {
  return <div className="w-160 max-w-[calc(100vw-6rem)]">{children}</div>;
}

function StepButtons() {
  return (
    <>
      <Button variant="secondary">
        <ArrowLeftIcon data-icon="inline-start" />
        이전
      </Button>
      <Button variant="primary">
        다음
        <ArrowRightIcon data-icon="inline-end" />
      </Button>
    </>
  );
}

export const 기본: Story = {
  render: ({ amount, label, note, ...props }) => (
    <Stage>
      <PriceBar {...props} className="border-border rounded-lg border">
        <PriceBarTotal amount={amount} label={label} note={note || undefined} />
        <PriceBarActions>
          <StepButtons />
        </PriceBarActions>
      </PriceBar>
    </Stage>
  ),
};

const FIT_WIDTHS = [390, 360, 320] as const;
const MAX_DIGITS = 12;

function FitBar({ width, amount }: { width: number; amount: number }) {
  return (
    <figure className="m-0 max-w-full" style={{ width }}>
      <figcaption className="text-muted-foreground text-caption mb-1">{width}px 폭</figcaption>
      <PriceBar className="border-border gap-x-3 gap-y-2 rounded-lg border">
        <PriceBarTotal amount={amount} />
        <PriceBarActions className="ml-auto flex-nowrap">
          <StepButtons />
        </PriceBarActions>
      </PriceBar>
    </figure>
  );
}

function FitDemo() {
  const [digits, setDigits] = useState('133150000');
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
        {FIT_WIDTHS.map((width) => (
          <FitBar key={width} width={width} amount={amount} />
        ))}
      </div>
    </div>
  );
}

export const 글자맞춤: Story = {
  name: '글자 맞춤',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          '금액을 입력하면 같은 금액이 세 폭(390/360/320px)의 막대에 들어갑니다. 자릿수가 늘수록 총액 글자가 버튼 옆 자리에 맞게 줄어들고(제목 크기의 절반까지), 절반으로도 안 들어가는 폭에서는 총액이 자기 줄로 내려가 원래 크기로 돌아옵니다.',
      },
    },
  },
  render: () => <FitDemo />,
};

export const 고정: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`fixed`는 막대를 화면 아래에 붙이고 기기의 하단 안전 영역을 비웁니다. 스토리에서는 변환이 있는 틀이 기준이 되어 틀 아래에 붙습니다.',
      },
    },
  },
  decorators: [
    (Story) => (
      // transform이 있는 조상은 fixed 자손의 기준이 되어, 스토리 안에서 막대가 이 틀 아래에 붙는다.
      <div className="border-border relative h-60 w-160 max-w-[calc(100vw-6rem)] transform-[translateZ(0)] overflow-hidden rounded-lg border max-sm:h-80">
        <div className="text-muted-foreground p-4 text-sm">
          <p className="text-foreground font-semibold">견적 본문 영역</p>
          <p className="mt-1">막대가 아래에 붙습니다.</p>
        </div>
        <Story />
      </div>
    ),
  ],
  render: ({ amount, label, note, ...props }) => (
    <PriceBar {...props} fixed>
      <PriceBarTotal amount={amount} label={label} note={note || undefined} />
      <PriceBarActions>
        <StepButtons />
      </PriceBarActions>
    </PriceBar>
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
