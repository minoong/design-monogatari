import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from './button';
import { Morph } from './morph';
import { SwitchField } from './switch-field';

const FRAME = 'bg-background/95 border-border max-w-full border backdrop-blur-sm';

const meta = {
  title: '컴포넌트/변형 (Morph)',
  component: Morph,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '한 자리에서 서로 다른 내용으로 바뀌는 틀입니다. 내용(`value`)이 바뀌면 틀이 새 내용의 크기와 모서리로 스프링(`SPRING.settle`)을 따라 변형되고, 안의 내용은 틀 안에서 옆으로 밀려 나가고 들어옵니다. 투명도는 바꾸지 않아서 반투명한 중간 상태가 없고, 내용은 틀 안에서 잘려서 밖으로 새지 않습니다. `order`로 이름의 순서를 주면 뒤쪽으로 바뀔 때 오른쪽에서, 앞쪽으로 바뀔 때 왼쪽에서 밀려듭니다. `value`가 `null`이면 틀이 왼쪽으로 밀려나며 사라집니다(자리 밖은 부모가 잘라 내야 합니다). 처음부터 있던 틀은 움직이지 않고(`animateOnMount`로 바꿉니다), 감소 모션이면 움직임 없이 바로 바뀝니다. 사라지는 내용과 틀은 `inert`입니다. 크기를 움직이는 예외이므로 절대 위치로 얹은 알약처럼 주변에 자리를 내줄 필요가 없는 작은 틀에 쓰십시오.',
      },
    },
  },
  args: { value: 'switch', children: null },
  argTypes: {
    value: { control: false },
    order: { control: false },
    radii: { control: false },
    animateOnMount: { control: 'boolean' },
    className: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof Morph>;

export default meta;

type Story = StoryObj<typeof meta>;

type Kind = 'switch' | 'note';
const ORDER = ['switch', 'note'] as const;
const RADII = { switch: 18, note: 8 };

const NOTE = '실내 색은 근사값이고 시트 구성과 가니쉬는 반영되지 않습니다.';

/** 차량 위 모서리에 얹는 상황을 흉내 낸다: 바깥 영역이 자리 밖을 잘라 낸다. */
function Stage({
  kind,
  open,
  onOpenChange,
}: {
  kind: Kind | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <div className="border-border bg-card relative h-40 w-96 max-w-full overflow-hidden rounded-lg border">
      <div className="absolute top-3 left-3 z-10 max-w-[calc(100%-1.5rem)]">
        <Morph className={FRAME} order={ORDER} radii={RADII} value={kind}>
          {kind === 'note' ? (
            <p className="text-foreground text-caption px-2.5 py-1.5">{NOTE}</p>
          ) : kind === 'switch' ? (
            <div className="flex py-1 pr-3 pl-1">
              <SwitchField
                checked={open}
                label="선루프 열어 보기"
                status={{ on: '열림', off: '닫힘' }}
                onChange={(event) => {
                  onOpenChange(event.target.checked);
                }}
              />
            </div>
          ) : null}
        </Morph>
      </div>
    </div>
  );
}

function Demo() {
  const [kind, setKind] = useState<Kind | null>('switch');
  // 안의 컨트롤 상태는 부모가 든다: 내용이 바뀌면 안의 요소가 새로 만들어지므로 비제어로 두면 왕복할 때 처음 값으로 돌아간다.
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex gap-2">
        {(
          [
            ['switch', '스위치'],
            ['note', '안내 문구'],
            [null, '없음'],
          ] as const
        ).map(([next, label]) => (
          <Button
            key={label}
            aria-pressed={kind === next}
            size="small"
            variant="secondary"
            onClick={() => {
              setKind(next);
            }}
          >
            {label}
          </Button>
        ))}
      </div>
      <Stage kind={kind} open={open} onOpenChange={setOpen} />
    </div>
  );
}

export const 기본: Story = {
  render: () => <Demo />,
};

function MountDemo() {
  const [round, setRound] = useState(0);
  return (
    <div className="flex flex-col items-start gap-4">
      <Button
        size="small"
        variant="secondary"
        onClick={() => {
          setRound((value) => value + 1);
        }}
      >
        다시 그리기
      </Button>
      <div key={round} className="w-96 max-w-full">
        <div className="border-border bg-card relative h-40 w-full overflow-hidden rounded-lg border">
          <div className="absolute top-3 left-3 z-10">
            <Morph animateOnMount className={FRAME} radii={RADII} value="switch">
              <div className="flex py-1 pr-3 pl-1">
                <SwitchField label="선루프 열어 보기" status={{ on: '열림', off: '닫힘' }} />
              </div>
            </Morph>
          </div>
        </div>
      </div>
    </div>
  );
}

export const 처음에도_움직임: Story = {
  name: '처음에도 움직임 (animateOnMount)',
  render: () => <MountDemo />,
};
