import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from './button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';

const meta = {
  title: '컴포넌트/다이얼로그',
  component: Dialog,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`Dialog`는 지금 하던 일을 잠시 멈추고 결정을 받을 때 사용합니다. `DialogTitle`은 접근 가능한 이름이라 필수입니다. `DialogContent`가 오버레이를 그리니 `DialogOverlay`를 옆에 또 넣지 마십시오. 제목은 본문색, 설명은 보조 글자색을 써 주십시오.',
      },
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 기본: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="primary">유의사항 보기</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>견적 유의사항을 확인해 주십시오</DialogTitle>
          <DialogDescription>
            견적서는 참고용이며 실제 가격과 출고 일정은 계약 시점에 따라 달라질 수 있습니다.
            확인하지 않으시면 견적 저장을 진행할 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button>닫기</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
