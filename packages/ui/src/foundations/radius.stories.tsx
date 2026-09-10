'use client';

import type { Meta, StoryObj } from '@storybook/react';

import { cn } from '../lib/cn';
import { CatalogRow, TokenStack } from './catalog-row';
import { DocBody, DocCode, DocPage, DocSection } from './doc-page';
import { useLiveStyle } from './use-live-token';

const radii = [
  { name: '입력', tokenClass: 'rounded-md', note: '필드, 셀렉트' },
  { name: '카드', tokenClass: 'rounded-lg', note: '카드, 다이얼로그' },
  { name: '버튼', tokenClass: 'rounded-pill', note: '주요·보조 버튼' },
] as const;

function RadiusRow({ name, tokenClass, note }: { name: string; tokenClass: string; note: string }) {
  const { ref, value } = useLiveStyle('borderRadius');

  return (
    <CatalogRow
      preview={
        <div ref={ref} className={cn('bg-muted border-border size-16 border', tokenClass)} />
      }
      title={name}
      meta={`${tokenClass} · ${note}${value ? ` · ${value}` : ''}`}
    />
  );
}

function Radius() {
  return (
    <DocPage
      kicker="파운데이션"
      title="라운딩"
      lead="모서리는 역할에 따라 세 가지만 써요. 입력은 rounded-md, 떠 있는 면은 rounded-lg, 누르는 알약은 rounded-pill이에요."
    >
      <DocSection title="이렇게 써요">
        <DocBody>
          값은 @theme의 --radius-md / --radius-lg / --radius-pill이에요. 같은 화면에서도 역할이
          바뀌면 라운딩도 바뀌어요.
        </DocBody>
        <DocCode>{`<input className="rounded-md" />
<div className="rounded-lg border border-border" />
<button className="rounded-pill" />`}</DocCode>
      </DocSection>

      <DocSection title="역할별로 보기">
        <TokenStack>
          {radii.map((item) => (
            <RadiusRow key={item.tokenClass} {...item} />
          ))}
        </TokenStack>
      </DocSection>
    </DocPage>
  );
}

const meta = {
  title: '파운데이션/라운딩',
  component: Radius,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Radius>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 스케일: Story = {};
