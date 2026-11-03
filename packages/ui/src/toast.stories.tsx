import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from './button';
import { noControls } from './storybook/arg-types';
import { type ToastOptions, ToastProvider, useToast } from './toast';

/** 버튼마다 알림 하나를 띄우는 공통 틀. 스토리는 어떤 알림을 띄울지만 적는다. */
function Buttons({ items }: { items: readonly { label: string; options: ToastOptions }[] }) {
  const { toast } = useToast();

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Button
          key={item.label}
          variant="secondary"
          onClick={() => {
            toast(item.options);
          }}
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
}

function withProvider(items: readonly { label: string; options: ToastOptions }[]): Story['render'] {
  return (args) => (
    <ToastProvider {...args}>
      <Buttons items={items} />
    </ToastProvider>
  );
}

const meta = {
  title: '컴포넌트/알림 토스트',
  component: ToastProvider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`ToastProvider`로 앱을 감싸고 `useToast()`로 `toast({ title })`를 호출하면 화면 아래에 잠깐 알림이 뜹니다. 알림 영역은 항상 DOM에 있는 라이브 리전이라 새 알림이 읽히고(기본은 조용히, 오류는 즉시), 일반 알림은 5초 뒤에 닫히지만 마우스를 올리거나 포커스가 있는 동안, 창이 가려진 동안에는 멈추고, 동작이 있거나 오류인 알림은 자동으로 닫히지 않습니다. Esc로 닫고, F8을 누르면 알림 카드로 포커스가 옵니다. 터치와 펜에서는 카드를 옆으로 밀어 닫을 수 있고(카드 너비의 35%를 넘게 밀면 닫히고(일반 알림은 24px 넘게 움직인 뒤 빠르게 쓸어도 닫히지만 오류와 동작 알림은 거리로만), 아니면 제자리로 돌아옵니다), 미는 동안에는 자동으로 닫히지 않습니다. 마우스에서는 밀지 않으므로 글자를 선택할 수 있습니다. 모달 안에서는 쓰지 마십시오. 응답이 꼭 필요한 일에는 쓰지 말고 `Dialog`를 쓰십시오.',
      },
    },
  },
  args: { children: null, limit: 3 },
  argTypes: {
    limit: { control: { type: 'number', min: 1, max: 6 } },
    ...noControls('children', 'hotkey'),
  },
} satisfies Meta<typeof ToastProvider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 기본: Story = {
  render: withProvider([
    {
      label: '링크 복사',
      options: {
        title: '링크를 복사했습니다',
        description: '공유할 견적 링크가 클립보드에 있습니다.',
      },
    },
  ]),
};

export const 제목만: Story = {
  name: '제목만',
  render: withProvider([
    { label: '견적 저장', options: { title: '견적을 저장했습니다' } },
    { label: '이미지 저장', options: { title: '차량 이미지를 저장했습니다' } },
  ]),
  parameters: {
    docs: {
      description: {
        story: '설명이 필요 없는 짧은 결과는 제목만 둡니다. 카드가 낮아져 화면을 덜 가립니다.',
      },
    },
  },
};

export const 긴문장: Story = {
  name: '긴 문장',
  render: withProvider([
    {
      label: '긴 설명',
      options: {
        title: '선택하신 옵션 중 일부가 자동으로 바뀌었습니다',
        description:
          '4인승 시트를 고르면 뒷좌석 컴포트 패키지가 함께 담깁니다. 해제하시려면 시트를 다시 고르십시오. 바뀐 항목은 견적 요약에서 확인하실 수 있습니다.',
      },
    },
  ]),
  parameters: {
    docs: {
      description: {
        story:
          '카드 최대 너비는 `max-w-sm`이고 긴 문장은 줄바꿈됩니다. 좁은 화면(390px)에서도 화면 밖으로 넘치지 않는지 확인하십시오.',
      },
    },
  },
};

// 조사("으로/로")는 받침에 따라 달라서 색마다 붙인 형태를 함께 적는다(블랙으로, 브론즈로, 화이트로).
const COLORS = [
  { name: '블랙', to: '블랙으로' },
  { name: '브론즈', to: '브론즈로' },
  { name: '화이트', to: '화이트로' },
] as const;

function UndoDemo() {
  const { toast } = useToast();
  const [color, setColor] = useState('화이트');

  function change(next: (typeof COLORS)[number]) {
    const previous = color;
    setColor(next.name);
    toast({
      title: `외장 색상을 ${next.to} 바꿨습니다`,
      action: {
        label: '실행 취소',
        onClick: () => {
          setColor(previous);
        },
      },
    });
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-foreground m-0 text-sm">
        외장 색상: <span className="font-semibold">{color}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {COLORS.map((next) => (
          <Button
            key={next.name}
            variant="secondary"
            disabled={color === next.name}
            onClick={() => {
              change(next);
            }}
          >
            {next.to} 변경
          </Button>
        ))}
      </div>
    </div>
  );
}

export const 실행취소: Story = {
  name: '실행 취소 동작',
  render: (args) => (
    <ToastProvider {...args}>
      <UndoDemo />
    </ToastProvider>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '동작이 있는 알림은 자동으로 닫히지 않고, 동작을 눌러 되돌립니다. 알림이 사라져도 같은 일을 할 다른 길(여기서는 색상 버튼)이 있어야 합니다. 알림 안의 동작은 Tab 또는 F8로 닿습니다.',
      },
    },
  },
};

export const 오류: Story = {
  render: withProvider([
    {
      label: '복사 실패',
      options: {
        title: '링크를 복사하지 못했습니다',
        description: '브라우저의 클립보드 권한을 확인해 주십시오.',
        variant: 'error',
      },
    },
    {
      label: '주소 읽기 실패',
      options: {
        title: '주소의 일부를 읽지 못했습니다',
        description: '읽을 수 없는 값은 기본 선택으로 되돌렸습니다.',
        variant: 'error',
      },
    },
  ]),
  parameters: {
    docs: {
      description: {
        story:
          '오류는 스크린 리더가 바로 읽고(`assertive`, 앞에 "오류:"가 붙습니다) 닫을 때까지 남습니다.',
      },
    },
  },
};

export const 표시시간: Story = {
  name: '표시 시간',
  render: withProvider([
    { label: '2초', options: { title: '2초 동안 떠 있습니다', duration: 2000 } },
    { label: '5초(기본)', options: { title: '5초 동안 떠 있습니다' } },
    {
      label: '10초',
      options: {
        title: '10초 동안 떠 있습니다',
        description: '마우스를 올리거나 포커스가 있는 동안에는 시간이 멈춥니다.',
        duration: 10_000,
      },
    },
  ]),
  parameters: {
    docs: {
      description: {
        story:
          '`duration`(ms)으로 시간을 정합니다. 마우스를 올리거나 카드 안에 포커스가 있거나 창이 가려진 동안에는 멈추고, 벗어나면 처음부터 다시 셉니다.',
      },
    },
  },
};

function StackDemo() {
  const { toast } = useToast();

  return (
    <Button
      variant="secondary"
      onClick={() => {
        for (let index = 1; index <= 5; index += 1) {
          toast({ title: `알림 ${index}`, description: '동시에 여러 개를 띄웠습니다.' });
        }
      }}
    >
      알림 5개 한꺼번에
    </Button>
  );
}

export const 여러개: Story = {
  name: '여러 개 쌓임',
  render: (args) => (
    <ToastProvider {...args}>
      <StackDemo />
    </ToastProvider>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '동시에 보이는 알림은 `limit`(기본 3)개이고, 넘치면 오래된 것부터 닫힙니다. 컨트롤에서 `limit`를 바꿔 보십시오.',
      },
    },
  },
};
