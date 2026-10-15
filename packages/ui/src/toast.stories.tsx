import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from './button';
import { ToastProvider, useToast } from './toast';

function Demo() {
  const { toast } = useToast();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            title: '링크를 복사했습니다',
            description: '공유할 견적 링크가 클립보드에 있습니다.',
          })
        }
      >
        기본 알림
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            title: '링크를 복사하지 못했습니다',
            description: '브라우저의 클립보드 권한을 확인해 주십시오.',
            variant: 'error',
          })
        }
      >
        오류 알림
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            title: '외장 색상을 변경했습니다',
            action: { label: '되돌리기', onClick: () => toast({ title: '되돌렸습니다' }) },
          })
        }
      >
        동작 포함
      </Button>
    </div>
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
          '`ToastProvider`로 앱을 감싸고 `useToast()`로 `toast({ title })`를 호출하면 화면 아래에 잠깐 알림이 뜹니다. 알림 영역은 항상 DOM에 있는 라이브 리전이라 새 알림이 읽히고(기본은 조용히, 오류는 즉시), 일반 알림은 5초 뒤에 닫히지만 마우스를 올리거나 포커스가 있는 동안, 창이 가려진 동안에는 멈추고, 동작이 있거나 오류인 알림은 자동으로 닫히지 않습니다. Esc로 닫고, F8을 누르면 알림 카드로 포커스가 옵니다. 모달 안에서는 쓰지 마십시오. 응답이 꼭 필요한 일에는 쓰지 말고 `Dialog`를 쓰십시오.',
      },
    },
  },
  args: { children: null },
} satisfies Meta<typeof ToastProvider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 기본: Story = {
  render: (args) => (
    <ToastProvider {...args}>
      <Demo />
    </ToastProvider>
  ),
};
