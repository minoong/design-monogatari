'use client';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { cn } from '../lib/cn';
import { TokenStack } from './catalog-row';
import { DocBody, DocCode, DocPage, DocSection } from './doc-page';
import { useLiveStyle } from './use-live-token';

function TypeRow({
  label,
  tokenClass,
  sample,
}: {
  label: string;
  tokenClass: string;
  sample: string;
}) {
  const { ref, value } = useLiveStyle('fontSize');

  return (
    <div className="border-border flex flex-col gap-2 rounded-md border p-4">
      <div className="text-muted-foreground flex flex-wrap items-baseline justify-between gap-2 font-mono text-xs">
        <span>{label}</span>
        <span>
          {tokenClass}
          {value ? ` · ${value}` : ''}
        </span>
      </div>
      <div ref={ref} className={cn('text-foreground', tokenClass)}>
        {sample}
      </div>
    </div>
  );
}

function Typography() {
  return (
    <DocPage
      kicker="파운데이션"
      title="타이포그래피"
      lead="글자는 역할 토큰으로 맞춥니다. 제목은 text-title(28px), 본문은 text-body(17px), 캡션은 text-caption(14px)입니다. 제목은 font-semibold에 tracking-tight이고, 굵기 500은 쓰지 않습니다."
    >
      <DocSection title="이렇게 씁니다">
        <DocBody>
          폰트는 @theme의 font-sans / font-mono입니다. 앱은 Geist, 그 외는 system-ui로 떨어집니다.
          크기를 외우지 말고 역할에 맞는 클래스만 골라 주십시오.
        </DocBody>
        <DocCode>{`<h1 className="font-sans text-title font-semibold tracking-tight">
  선택하신 구성의 견적을 확인하십시오
</h1>
<p className="font-sans text-body">본문</p>
<p className="text-muted-foreground text-caption">도움말</p>`}</DocCode>
      </DocSection>

      <DocSection title="크기">
        <TokenStack>
          <TypeRow
            label="제목"
            tokenClass="font-sans text-title font-semibold tracking-tight"
            sample="선택하신 구성의 견적을 확인하십시오"
          />
          <TypeRow
            label="본문"
            tokenClass="font-sans text-body"
            sample="트림과 외장 색상, 옵션을 한 번 더 확인한 뒤 진행해 주십시오."
          />
          <TypeRow
            label="강조"
            tokenClass="font-sans text-body font-semibold"
            sample="탁송료는 지역에 따라 다릅니다. 입력 칸의 안내 문구는 보조 글자색을 써 주십시오."
          />
          <TypeRow
            label="캡션"
            tokenClass="text-muted-foreground font-sans text-caption"
            sample="출고 일정은 재고에 따라 달라질 수 있습니다."
          />
          <TypeRow
            label="코드"
            tokenClass="font-mono text-sm"
            sample="bg-primary text-primary-foreground"
          />
        </TokenStack>
      </DocSection>
    </DocPage>
  );
}

const meta = {
  title: '파운데이션/타이포그래피',
  component: Typography,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Typography>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 스케일: Story = {};
