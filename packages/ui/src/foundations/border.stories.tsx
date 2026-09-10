'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useRef, useState } from 'react';

import { CatalogRow, TokenStack } from './catalog-row';
import { DocBody, DocCode, DocPage, DocSection } from './doc-page';
import { useLiveCssVar } from './use-live-token';

function HairlineRow() {
  const ref = useRef<HTMLDivElement>(null);
  const [meta, setMeta] = useState('border border-border');

  useEffect(() => {
    function read() {
      const node = ref.current;
      if (!node) {
        return;
      }
      const styles = getComputedStyle(node);
      const color = styles.getPropertyValue('--border').trim();
      const width = styles.borderTopWidth;
      setMeta(`border border-border · ${color} · ${width}`);
    }

    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <CatalogRow
      preview={<div ref={ref} className="bg-background border-border size-16 rounded-md border" />}
      title="기본 헤어라인"
      meta={meta}
    />
  );
}

function PrimaryEdgeRow() {
  const { ref, value } = useLiveCssVar('--primary');

  return (
    <CatalogRow
      preview={<div ref={ref} className="bg-background border-primary size-16 rounded-md border" />}
      title="선택 강조 테두리"
      meta={`border border-primary${value ? ` · ${value}` : ''}`}
    />
  );
}

function RingRow() {
  const { ref, value } = useLiveCssVar('--ring');

  return (
    <CatalogRow
      preview={<div ref={ref} className="bg-background ring-ring size-16 rounded-md ring-2" />}
      title="포커스 링"
      meta={`ring-2 ring-ring${value ? ` · ${value}` : ''}`}
    />
  );
}

function Border() {
  return (
    <DocPage
      kicker="파운데이션"
      title="보더"
      lead="기본 테두리는 border-border 한 줄이에요. 두께는 Tailwind border(1px)이고, 포커스는 ring-ring이에요. 5–8% 검정은 흰 배경에서, 5–8% 흰색은 검정 배경에서 사라지니 쓰지 마세요."
    >
      <DocSection title="이렇게 써요">
        <DocBody>
          색은 --border / --ring 토큰, 두께는 Tailwind 유틸리티예요. 카드·입력·다이얼로그·보조
          버튼은 같은 헤어라인을 공유해요.
        </DocBody>
        <DocCode>{`<div className="border-border rounded-lg border" />
<input className="border-border focus-visible:ring-ring focus-visible:ring-offset-background border focus-visible:ring-2 focus-visible:ring-offset-2" />`}</DocCode>
      </DocSection>

      <DocSection title="두께와 색">
        <TokenStack>
          <HairlineRow />
          <PrimaryEdgeRow />
          <RingRow />
        </TokenStack>
      </DocSection>

      <DocSection title="구분선">
        <DocBody>목록이나 표는 border-b border-border로 나눠 주세요.</DocBody>
        <div className="border-border bg-card overflow-hidden rounded-md border">
          {['보내는 계좌', '받는 분', '이체 금액'].map((item) => (
            <div
              key={item}
              className="border-border text-foreground border-b px-4 py-3 text-sm last:border-b-0"
            >
              {item}
            </div>
          ))}
        </div>
      </DocSection>
    </DocPage>
  );
}

const meta = {
  title: '파운데이션/보더',
  component: Border,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Border>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 토큰: Story = {};
