import type { Meta, StoryObj } from '@storybook/react-vite';

import { Card, CardDescription, CardHeader, CardTitle } from './card';
import { Reveal, RevealGroup } from './reveal';
import { StoryReplay } from './story-replay';

const ITEMS = [
  ['트림', '컴포트와 스포트 중에서 고릅니다.'],
  ['외장 색상', '글로시, 메탈릭, 무광 가운데 고릅니다.'],
  ['휠', '트림에 따라 선택할 수 있는 휠이 달라집니다.'],
  ['시트', '5인승과 4인승 중에서 고릅니다.'],
  ['내장', '외장 색상과 어울리는 내장만 선택할 수 있습니다.'],
];

function Cards() {
  return (
    <RevealGroup className="grid w-full max-w-xl gap-3">
      {ITEMS.map(([title, description]) => (
        <Reveal key={title}>
          <Card>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
          </Card>
        </Reveal>
      ))}
    </RevealGroup>
  );
}

const meta = {
  title: '컴포넌트/리빌',
  component: Reveal,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`Reveal`은 화면에 들어올 때 아래에서 위로 떠오르며 나타나는 래퍼입니다. `RevealGroup` 안에 여러 개를 두면 위에서부터 차례로(기본 0.04초 간격) 나타납니다. 한 번만 재생하고, `prefers-reduced-motion`이면 이동 없이 짧은 페이드만 합니다. 자바스크립트가 실행되기 전까지는 숨겨져 있으니 첫 화면 위쪽의 핵심 내용에는 쓰지 마십시오. 시간과 곡선은 `@repo/ui/motion` 토큰입니다.',
      },
    },
  },
  argTypes: {
    distance: { control: 'number' },
  },
} satisfies Meta<typeof Reveal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 그룹: Story = {
  render: () => (
    <StoryReplay>
      <Cards />
    </StoryReplay>
  ),
};

export const 하나: Story = {
  name: '단독',
  render: () => (
    <StoryReplay>
      <Reveal distance={24} className="w-full max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>예상 견적가</CardTitle>
            <CardDescription>선택하신 구성의 취득세와 부대비용이 포함됩니다.</CardDescription>
          </CardHeader>
        </Card>
      </Reveal>
    </StoryReplay>
  ),
};
