import type { Meta, StoryObj } from '@storybook/react';

import { DocBody, DocPage, DocSection } from './doc-page';

const tokenRows = [
  ['배경', 'background', 'bg-background'],
  ['글자', 'foreground', 'text-foreground'],
  ['보조 면', 'muted', 'bg-muted'],
  ['보조 글자', 'muted-foreground', 'text-muted-foreground'],
  ['테두리', 'border', 'border-border'],
  ['주요 액션', 'primary', 'bg-primary, text-primary'],
  ['주요 호버', 'primary-hover', 'hover:bg-primary-hover'],
  ['주요 위 글자', 'primary-foreground', 'text-primary-foreground'],
  ['어두운 면 링크', 'primary-on-dark', 'text-primary-on-dark'],
  ['포커스', 'ring', 'focus-visible:ring-ring'],
  ['오버레이', 'overlay', 'bg-overlay'],
  ['카드', 'card', 'bg-card'],
  ['상태(오류)', 'destructive', 'text-destructive, border-destructive'],
  ['상태 위 글자', 'destructive-foreground', 'text-destructive-foreground'],
  ['눌림 딤', 'dimmer', 'bg-dimmer'],
  ['테두리 별칭', 'muted-strong', 'border-muted-strong'],
  ['제목', 'text-title', 'text-title'],
  ['본문', 'text-body', 'text-body'],
  ['캡션', 'text-caption', 'text-caption'],
  ['버튼', 'rounded.pill', 'rounded-pill'],
  ['카드·다이얼로그', 'rounded.lg', 'rounded-lg'],
  ['입력', 'rounded.md', 'rounded-md'],
] as const;

const dos = [
  '누르는 면과 본문 링크는 primary로 맞춰 주세요.',
  '테두리는 border-border로 남겨 두세요. 옅은 검은색은 흰 배경에서 사라져요.',
  '화면 바탕은 bg-background, 글자는 text-foreground를 짝으로 써 주세요.',
  '라이트와 다크는 툴바에서 바꿔 가며 같은 화면을 확인해 주세요.',
];

const donts = [
  '컴포넌트에 hex를 직접 넣지 마세요. 값은 토큰이 가지고 있어요.',
  'bg-neutral-*나 bg-blue-*를 컴포넌트에 쓰지 마세요. 시맨틱 클래스를 써 주세요.',
  '기본 확인 버튼에 bg-foreground를 쓰지 마세요.',
  '브랜드 강조색을 하나 더 만들지 마세요. 실패·오류는 destructive를 쓰고, CTA에는 쓰지 마세요. 그림자도 크롬에 올리지 마세요.',
  'Motion을 쓰는 요소에 Tailwind transition 클래스를 같이 넣지 마세요.',
];

function Overview() {
  return (
    <DocPage
      kicker="파운데이션"
      title="design-monogatari를 소개해요"
      lead="제품을 만들 때 함께 쓰는 화면 언어예요. 바탕은 조용하고, 강조는 Action Blue 하나예요. 장식용 그라데이션이나 그림자는 쓰지 않고, 같은 토큰으로 라이트와 다크를 오가요."
    >
      <DocSection title="지향하는 목표">
        <ul className="text-foreground text-body list-disc space-y-2 pl-5">
          <li>
            화면의 최소 품질을 항상 맞춰 줘요. 토큰만 따르면 배경·글자·테두리가 흔들리지 않아요.
          </li>
          <li>다시 그리지 않고 제품 문제에 집중할 수 있게 해 줘요.</li>
          <li>움직임까지 포함해, 쓰는 사람이 서비스라고 느끼게 만드는 게 목표예요.</li>
        </ul>
      </DocSection>

      <DocSection title="토큰을 이렇게 연결해요">
        <DocBody>
          색과 보더, 라운딩은 CSS 변수에 두고, 화면에서는 Tailwind 클래스만 써 주세요. 값은
          DESIGN.md와 globals.css가 가지고 있어요.
        </DocBody>
        <table className="border-border w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-border border-b">
              <th className="text-foreground py-2.5 pr-4 font-semibold">역할</th>
              <th className="text-foreground py-2.5 pr-4 font-semibold">토큰</th>
              <th className="text-foreground py-2.5 font-semibold">클래스</th>
            </tr>
          </thead>
          <tbody>
            {tokenRows.map(([role, token, tw]) => (
              <tr key={token} className="border-border border-b">
                <td className="text-foreground py-2.5 pr-4">{role}</td>
                <td className="text-muted-foreground py-2.5 pr-4 font-mono text-xs">{token}</td>
                <td className="text-muted-foreground py-2.5 font-mono text-xs">{tw}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DocSection>

      <section className="grid gap-6 sm:grid-cols-2">
        <div className="border-border bg-card flex flex-col gap-3 rounded-lg border p-5">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">이렇게 써요</h2>
          <ul className="text-foreground list-disc space-y-2 pl-5 text-sm leading-6">
            {dos.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="border-border bg-muted flex flex-col gap-3 rounded-lg border p-5">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">
            이렇게는 쓰지 않아요
          </h2>
          <ul className="text-foreground list-disc space-y-2 pl-5 text-sm leading-6">
            {donts.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </DocPage>
  );
}

const meta = {
  title: '파운데이션/소개',
  component: Overview,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Overview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 가이드: Story = {};
