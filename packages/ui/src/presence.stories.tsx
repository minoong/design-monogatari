import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from './button';
import { cn } from './lib/cn';
import { Presence, type PresenceFrom, type PresenceVariant } from './presence';
import { SwitchField } from './switch-field';

const meta = {
  title: '컴포넌트/등장 (Presence)',
  component: Presence,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '조건에 따라 담기고 빠지는 컨트롤이 갑자기 끼어들고 사라지고, 그 순간 이웃이 확 밀리거나 당겨지지 않게 하는 래퍼입니다. 모양은 `variant`로 고릅니다: `collapse`는 자리가 열리고 닫히며 컨트롤이 그 자리에서 드러나고(이웃이 그 폭만큼 부드럽게 비켜 줍니다), `slide`(기본)는 거기에 컨트롤이 `from` 쪽에서 밀려들고 밀려나며(자기 자리 안에서 잘려서 이웃 위를 지나지 않습니다), `spring`은 `slide`와 같은 움직임을 스프링으로 합니다. 자리를 여닫는 세 가지는 이웃이 프레임마다 밀리므로 덜컹거릴 수 있고, `reserve`는 자리를 늘 잡아 두어 이웃이 전혀 움직이지 않습니다(꺼진 동안 그 자리는 비어 있습니다). 움직임이 필요 없으면 이 컴포넌트를 쓰지 않고 조건부로 그리십시오. 투명도는 바꾸지 않아서 반투명한 중간 상태가 없습니다. `from`은 자리가 열리는 축(`left`·`right` 가로, `up`·`down` 세로)과 밀려드는 쪽입니다. 처음부터 켜져 있던 것은 움직이지 않고(`animateOnMount`로 바꿉니다), 감소 모션이면 움직임 없이 바로 바뀝니다. 사라지는 동안에는 `inert`라서 포커스와 클릭을 받지 않습니다. 자리를 여닫는 모양은 폭이나 높이를 움직이는 예외이므로 작은 컨트롤 하나에 쓰십시오.',
      },
    },
  },
  args: { show: true, children: null },
  argTypes: {
    show: { control: 'boolean' },
    variant: { control: 'inline-radio', options: ['collapse', 'slide', 'spring', 'reserve'] },
    from: { control: 'inline-radio', options: ['left', 'right', 'up', 'down'] },
    animateOnMount: { control: 'boolean' },
    children: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof Presence>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 컨트롤 양옆에 이웃 버튼을 둬서, 컨트롤이 담기고 빠질 때 이웃이 어떻게 움직이는지 보인다. */
function Row({
  show,
  variant,
  from,
  animateOnMount,
}: {
  show: boolean;
  variant?: PresenceVariant;
  from?: PresenceFrom;
  animateOnMount?: boolean;
}) {
  const vertical = from === 'up' || from === 'down';
  return (
    // 이웃과의 간격은 flex `gap`이 아니라 마진으로 준다: 컨트롤 쪽 마진은 `Presence` 안에 있어 자리와 함께 열리고 닫히고,
    // `gap`은 컨트롤이 DOM에서 내려가는 순간 그 간격만큼 한 번에 튄다.
    <div className={vertical ? 'flex flex-col items-start' : 'flex items-center'}>
      <Button size="small" variant="secondary">
        앞 버튼
      </Button>
      <Presence show={show} variant={variant} from={from} animateOnMount={animateOnMount}>
        <div
          className={cn(
            'border-border bg-card flex h-8 items-center rounded-lg border px-3 text-sm',
            vertical ? 'my-2' : 'mx-2',
          )}
        >
          <SwitchField className="h-full" label="알림 받기" defaultChecked />
        </div>
      </Presence>
      <Button size="small" variant="secondary" className={vertical ? 'mt-2' : 'ml-2'}>
        뒤 버튼
      </Button>
    </div>
  );
}

function ToggleButton({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <Button variant="secondary" size="small" onClick={onToggle}>
      {show ? '컨트롤 빼기' : '컨트롤 담기'}
    </Button>
  );
}

function Demo({
  variant,
  from,
  animateOnMount,
}: {
  variant?: PresenceVariant;
  from?: PresenceFrom;
  animateOnMount?: boolean;
}) {
  const [show, setShow] = useState(true);
  return (
    <div className="flex min-h-32 flex-col items-start gap-4">
      <ToggleButton
        show={show}
        onToggle={() => {
          setShow((value) => !value);
        }}
      />
      <Row show={show} variant={variant} from={from} animateOnMount={animateOnMount} />
    </div>
  );
}

const VARIANTS: [PresenceVariant, string][] = [
  ['collapse', '자리가 열리고 닫힘 (collapse)'],
  ['slide', '자리가 열리고 닫히며 밀려듦 (slide, 기본)'],
  ['spring', '슬라이드를 스프링으로 (spring)'],
  ['reserve', '자리는 그대로, 컨트롤만 (reserve: 이웃이 안 움직임)'],
];

function Compare() {
  const [show, setShow] = useState(true);
  return (
    <div className="flex flex-col items-start gap-6">
      <ToggleButton
        show={show}
        onToggle={() => {
          setShow((value) => !value);
        }}
      />
      {VARIANTS.map(([variant, label]) => (
        <div key={variant} className="flex flex-col gap-2">
          <p className="text-muted-foreground text-caption">{label}</p>
          <Row show={show} variant={variant} />
        </div>
      ))}
    </div>
  );
}

export const 기본: Story = {
  render: (args) => (
    <Demo variant={args.variant} from={args.from} animateOnMount={args.animateOnMount} />
  ),
};

export const 세_가지_비교: Story = {
  name: '세 가지 비교',
  render: () => <Compare />,
};

export const 방향: Story = {
  name: '밀려드는 방향',
  render: () => (
    <div className="flex flex-wrap gap-10">
      {(['left', 'right', 'up', 'down'] as const).map((from) => (
        <div key={from} className="flex flex-col gap-2">
          <p className="text-muted-foreground text-caption">{from}</p>
          <Demo from={from} />
        </div>
      ))}
    </div>
  ),
};

export const 처음부터_있음: Story = {
  name: '처음부터 있음 (움직이지 않음)',
  render: () => (
    <Presence show>
      <p className="text-sm">
        이 문장은 처음 그릴 때 움직이지 않습니다. 스토리를 다시 불러 확인해 보십시오.
      </p>
    </Presence>
  ),
};

function RemountDemo() {
  const [round, setRound] = useState(0);
  return (
    <div className="flex min-h-24 flex-col items-start gap-4">
      <Button
        variant="secondary"
        size="small"
        onClick={() => {
          setRound((value) => value + 1);
        }}
      >
        다시 그리기
      </Button>
      <div key={round}>
        <Row show animateOnMount />
      </div>
    </div>
  );
}

export const 처음에도_움직임: Story = {
  name: '처음에도 움직임 (animateOnMount)',
  render: () => <RemountDemo />,
};
