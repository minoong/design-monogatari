import type { Meta, StoryObj } from '@storybook/react';
import { type ReactNode, type RefObject, useRef, useState } from 'react';

import { AnimatedAmount } from './animated-amount';
import { Button } from './button';
import { StoryReplay } from './story-replay';

const SCROLL_IN_VIEW_AMOUNT = 'all';

const TRIM_TOTALS = {
  standard: 62_900_000,
  long: 71_400_000,
  performance: 79_800_000,
} as const;

type TrimId = keyof typeof TRIM_TOTALS;

const TRIM_LABELS: Record<TrimId, string> = {
  standard: '스탠다드',
  long: '롱 레인지',
  performance: '퍼포먼스',
};

function EstimateAmountPlayground({
  initialTrim = 'long',
  className,
}: {
  initialTrim?: TrimId;
  className?: string;
}) {
  const [trim, setTrim] = useState<TrimId>(initialTrim);

  return (
    <div className="flex flex-col gap-6">
      <AnimatedAmount className={className} value={TRIM_TOTALS[trim]} />
      <div className="flex flex-wrap gap-2">
        {(Object.keys(TRIM_LABELS) as TrimId[]).map((id) => {
          const selected = id === trim;
          return (
            <Button
              key={id}
              aria-pressed={selected}
              onClick={() => setTrim(id)}
              variant={selected ? 'primary' : 'secondary'}
            >
              {TRIM_LABELS[id]}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function AmountScrollStage({
  children,
  hint,
}: {
  children: (rootRef: RefObject<HTMLDivElement | null>) => ReactNode;
  hint: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <p className="text-muted-foreground text-sm">{hint}</p>
      <div className="border-border overflow-hidden rounded-lg border">
        <div ref={rootRef} className="h-80 overflow-y-auto">
          <div aria-hidden className="h-80" />
          <div className="px-5 py-8">{children(rootRef)}</div>
          <div aria-hidden className="h-40" />
        </div>
      </div>
    </div>
  );
}

function InViewScrollDemo() {
  return (
    <AmountScrollStage hint="아래로 스크롤해 금액이 상자에 다 들어오면 굴러요.">
      {(rootRef) => (
        <>
          <p className="text-muted-foreground mb-2 text-sm">합계</p>
          <AnimatedAmount
            className="text-[28px] font-semibold tracking-tight"
            inView
            inViewAmount={SCROLL_IN_VIEW_AMOUNT}
            inViewRoot={rootRef}
            value={71_400_000}
          />
        </>
      )}
    </AmountScrollStage>
  );
}

function WidthComparePlayground({ className }: { className?: string }) {
  return (
    <AmountScrollStage hint="아래로 스크롤해 금액이 상자에 다 들어오면 굴러요. 위는 ‘원’이 고정되고, 아래는 따라가요.">
      {(rootRef) => (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground text-sm">폭 고정</p>
            <AnimatedAmount
              className={className}
              inView
              inViewAmount={SCROLL_IN_VIEW_AMOUNT}
              inViewRoot={rootRef}
              reserveWidth
              value={71_400_000}
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground text-sm">폭 따라감</p>
            <AnimatedAmount
              className={className}
              inView
              inViewAmount={SCROLL_IN_VIEW_AMOUNT}
              inViewRoot={rootRef}
              reserveWidth={false}
              value={71_400_000}
            />
          </div>
        </div>
      )}
    </AmountScrollStage>
  );
}

const meta = {
  title: '컴포넌트/금액',
  component: AnimatedAmount,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`AnimatedAmount`는 금액이 바뀔 때 자릿수가 세로로 굴러가요. 기본은 `reserveWidth`로 목표 금액 너비를 미리 잡아 `원`이 밀리지 않아요. `inView`를 켜면 뷰포트에 들어올 때 0에서 목표값까지 굴러요. `inViewOnce`, `inViewAmount`, `inViewMargin`은 Motion `useInView` 옵션과 같아요. `prefers-reduced-motion`이면 롤 없이 바로 최종 값을 보여 줘요.',
      },
    },
  },
  args: {
    value: 71_400_000,
    suffix: '원',
  },
  argTypes: {
    value: { control: { type: 'number' } },
    animate: { control: { type: 'boolean' } },
    inView: { control: { type: 'boolean' } },
    inViewOnce: { control: { type: 'boolean' } },
    inViewAmount: { control: { type: 'text' } },
    inViewMargin: { control: { type: 'text' } },
    inViewRoot: { control: false },
    reserveWidth: { control: { type: 'boolean' } },
    prefix: { control: { type: 'text' } },
    suffix: { control: { type: 'text' } },
  },
} satisfies Meta<typeof AnimatedAmount>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 기본: Story = {};

export const 견적헤더: Story = {
  render: () => (
    <EstimateAmountPlayground className="font-sans text-sm font-semibold" initialTrim="long" />
  ),
  parameters: {
    docs: {
      description: {
        story: '견적 헤더 크기예요. 트림을 고르면 합계가 자리수 롤로 바뀌어요.',
      },
    },
  },
};

export const 견적합계: Story = {
  render: () => (
    <EstimateAmountPlayground
      className="text-[28px] font-semibold tracking-tight"
      initialTrim="long"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: '하단 합계 크기예요. 트림을 고르면 합계가 자리수 롤로 바뀌어요.',
      },
    },
  },
};

export const 폭고정: Story = {
  render: () => (
    <StoryReplay>
      <WidthComparePlayground className="text-[28px] font-semibold tracking-tight" />
    </StoryReplay>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '스크롤해서 금액이 상자에 다 들어오면 (`inViewAmount: all`) `reserveWidth` 차이가 보여요. 위는 목표 너비를 미리 잡아 `원`이 안 움직이고, 아래는 숫자 폭을 따라가요. 오른쪽 위 새로고침으로 처음부터 다시 볼 수 있어요.',
      },
    },
  },
};

export const 뷰포트진입: Story = {
  render: () => (
    <StoryReplay>
      <InViewScrollDemo />
    </StoryReplay>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '스크롤해서 금액이 상자에 다 들어오면 (`inViewAmount: all`) 0에서 목표값까지 자리수가 굴러요. 기본은 한 번만 재생해요 (`inViewOnce`). 오른쪽 위 새로고침으로 처음부터 다시 볼 수 있어요.',
      },
    },
  },
};
