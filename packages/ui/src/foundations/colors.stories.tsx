import type { Meta, StoryObj } from '@storybook/react';
import type { ComponentProps } from 'react';

import { TokenStack } from './catalog-row';
import { ColorBar } from './color-swatch';
import { DocBody, DocCode, DocPage, DocSection } from './doc-page';

const NEUTRAL_BARS = [
  {
    label: 'neutral 50',
    tokenClass: 'bg-neutral-50',
    cssVar: '--color-neutral-50',
    inkClass: 'text-neutral-900',
  },
  {
    label: 'neutral 100',
    tokenClass: 'bg-neutral-100',
    cssVar: '--color-neutral-100',
    inkClass: 'text-neutral-900',
  },
  {
    label: 'neutral 200',
    tokenClass: 'bg-neutral-200',
    cssVar: '--color-neutral-200',
    inkClass: 'text-neutral-900',
  },
  {
    label: 'neutral 300',
    tokenClass: 'bg-neutral-300',
    cssVar: '--color-neutral-300',
    inkClass: 'text-neutral-900',
  },
  {
    label: 'neutral 400',
    tokenClass: 'bg-neutral-400',
    cssVar: '--color-neutral-400',
    inkClass: 'text-neutral-900',
  },
  {
    label: 'neutral 500',
    tokenClass: 'bg-neutral-500',
    cssVar: '--color-neutral-500',
    inkClass: 'text-neutral-50',
  },
  {
    label: 'neutral 600',
    tokenClass: 'bg-neutral-600',
    cssVar: '--color-neutral-600',
    inkClass: 'text-neutral-50',
  },
  {
    label: 'neutral 700',
    tokenClass: 'bg-neutral-700',
    cssVar: '--color-neutral-700',
    inkClass: 'text-neutral-50',
  },
  {
    label: 'neutral 800',
    tokenClass: 'bg-neutral-800',
    cssVar: '--color-neutral-800',
    inkClass: 'text-neutral-50',
  },
  {
    label: 'neutral 900',
    tokenClass: 'bg-neutral-900',
    cssVar: '--color-neutral-900',
    inkClass: 'text-neutral-50',
  },
] as const;

const BLUE_BARS = [
  {
    label: 'blue 50',
    tokenClass: 'bg-blue-50',
    cssVar: '--color-blue-50',
    inkClass: 'text-neutral-900',
  },
  {
    label: 'blue 100',
    tokenClass: 'bg-blue-100',
    cssVar: '--color-blue-100',
    inkClass: 'text-neutral-900',
  },
  {
    label: 'blue 200',
    tokenClass: 'bg-blue-200',
    cssVar: '--color-blue-200',
    inkClass: 'text-neutral-900',
  },
  {
    label: 'blue 300',
    tokenClass: 'bg-blue-300',
    cssVar: '--color-blue-300',
    inkClass: 'text-neutral-900',
  },
  {
    label: 'blue 400',
    tokenClass: 'bg-blue-400',
    cssVar: '--color-blue-400',
    inkClass: 'text-neutral-900',
  },
  {
    label: 'blue 500',
    tokenClass: 'bg-blue-500',
    cssVar: '--color-blue-500',
    inkClass: 'text-neutral-50',
  },
  {
    label: 'blue 600',
    tokenClass: 'bg-blue-600',
    cssVar: '--color-blue-600',
    inkClass: 'text-neutral-50',
  },
  {
    label: 'blue 700',
    tokenClass: 'bg-blue-700',
    cssVar: '--color-blue-700',
    inkClass: 'text-neutral-50',
  },
  {
    label: 'blue 800',
    tokenClass: 'bg-blue-800',
    cssVar: '--color-blue-800',
    inkClass: 'text-neutral-50',
  },
  {
    label: 'blue 900',
    tokenClass: 'bg-blue-900',
    cssVar: '--color-blue-900',
    inkClass: 'text-neutral-50',
  },
] as const;

const page = [
  {
    label: '화면 배경',
    tokenClass: 'bg-background',
    cssVar: '--background',
    inkClass: 'text-foreground',
  },
  {
    label: '본문',
    tokenClass: 'bg-foreground',
    cssVar: '--foreground',
    inkClass: 'text-background',
  },
] as const;

const card = [
  { label: '카드', tokenClass: 'bg-card', cssVar: '--card', inkClass: 'text-foreground' },
  { label: '보조 면', tokenClass: 'bg-muted', cssVar: '--muted', inkClass: 'text-foreground' },
  {
    label: '보조 호버',
    tokenClass: 'bg-secondary-hover',
    cssVar: '--secondary-hover',
    inkClass: 'text-foreground',
  },
] as const;

const mutedText = [
  {
    label: '보조 글자',
    tokenClass: 'bg-muted-foreground',
    cssVar: '--muted-foreground',
    inkClass: 'text-background',
  },
] as const;

const primary = [
  {
    label: '주요 액션',
    tokenClass: 'bg-primary',
    cssVar: '--primary',
    inkClass: 'text-primary-foreground',
  },
  {
    label: '주요 호버',
    tokenClass: 'bg-primary-hover',
    cssVar: '--primary-hover',
    inkClass: 'text-primary-foreground',
  },
  {
    label: '주요 위 글자',
    tokenClass: 'bg-primary-foreground',
    cssVar: '--primary-foreground',
    inkClass: 'text-primary',
  },
  {
    label: '어두운 면 링크',
    tokenClass: 'bg-primary-on-dark',
    cssVar: '--primary-on-dark',
    inkClass: 'text-background',
  },
] as const;

const chrome = [
  { label: '테두리', tokenClass: 'bg-border', cssVar: '--border', inkClass: 'text-foreground' },
  {
    label: '포커스 링',
    tokenClass: 'bg-ring',
    cssVar: '--ring',
    inkClass: 'text-primary-foreground',
  },
  {
    label: '오버레이',
    tokenClass: 'bg-overlay',
    cssVar: '--overlay',
    inkClass: 'text-primary-foreground',
  },
  {
    label: '눌림 딤',
    tokenClass: 'bg-dimmer',
    cssVar: '--dimmer',
    inkClass: 'text-primary-foreground',
  },
] as const;

function Bars({ items }: { items: readonly ComponentProps<typeof ColorBar>[] }) {
  return (
    <TokenStack>
      {items.map((item) => (
        <ColorBar key={item.cssVar} {...item} />
      ))}
    </TokenStack>
  );
}

function Colors() {
  return (
    <DocPage
      kicker="파운데이션"
      title="색"
      lead="아래 50–900은 @theme 원시 스케일이에요. 화면 컴포넌트에는 bg-neutral-*를 쓰지 말고, bg-background / bg-primary 같은 시맨틱 클래스만 써 주세요. 툴바에서 테마를 바꿔도 원시 스케일 값은 그대로예요."
    >
      <DocSection title="이렇게 써요">
        <DocBody>시맨틱 토큰이 스케일 한 칸을 가리켜요. hex는 컴포넌트에 적지 마세요.</DocBody>
        <DocCode>{`<div className="bg-background text-foreground" />
<button className="bg-primary text-primary-foreground" />`}</DocCode>
      </DocSection>

      <DocSection title="Neutral">
        <DocBody>
          면·글자·테두리의 회색 계단이에요. 950은 라이트 스케일의 검정 칸이에요. 다크
          캔버스·헤어라인은 시맨틱 토큰(background, border)을 쓰세요.
        </DocBody>
        <Bars items={NEUTRAL_BARS} />
      </DocSection>

      <DocSection title="Blue">
        <DocBody>
          Action Blue 한 줄기예요. 라이트에서 600이 primary, 500이 호버·링, 400이 어두운 면
          링크예요. 다크 primary·링은 이 스케일이 아니라 시맨틱 토큰이에요.
        </DocBody>
        <Bars items={BLUE_BARS} />
      </DocSection>

      <DocSection title="페이지">
        <DocBody>
          기본 면은 background, 그 위 글자는 foreground예요. 테마를 바꾸면 이 값만 바뀌어요.
        </DocBody>
        <Bars items={page} />
      </DocSection>

      <DocSection title="카드와 보조 면">
        <DocBody>
          떠 있는 면은 card, 옅은 채움은 muted예요. 호버만 secondary-hover를 써 주세요.
        </DocBody>
        <Bars items={card} />
      </DocSection>

      <DocSection title="보조 글자">
        <DocBody>
          설명, 플레이스홀더, 캡션은 muted-foreground예요. 대비율은 4.5:1을 지켜 주세요.
        </DocBody>
        <Bars items={mutedText} />
      </DocSection>

      <DocSection title="주요 액션">
        <DocBody>
          누르는 면은 primary 하나예요. 다크에서는 Radix accent 9예요. 어두운 타일 위 링크만
          primary-on-dark를 쓰고, 밝은 배경에는 올리지 마세요.
        </DocBody>
        <Bars items={primary} />
      </DocSection>

      <DocSection title="테두리와 링">
        <DocBody>
          색 토큰은 여기 있고, 두께와 쓰는 방법은 보더 페이지에서 볼 수 있어요. 포커스는 ring, 딤은
          overlay예요. 다크 헤어라인은 5–8% 흰색이 아니라 border 토큰이에요.
        </DocBody>
        <Bars items={chrome} />
      </DocSection>
    </DocPage>
  );
}

const meta = {
  title: '파운데이션/색',
  component: Colors,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Colors>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 팔레트: Story = {};
