import type { Meta, StoryObj } from '@storybook/react';

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
          '`Dialog`는 지금 하던 일을 잠시 멈추고 결정을 받을 때 사용해요. 제목은 본문색, 설명은 보조 글자색을 써 주세요.',
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
        <Button variant="primary">약관 보기</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>약관에 동의해 주세요</DialogTitle>
          <DialogDescription>
            서비스를 이용하려면 필수 약관에 동의가 필요해요. 동의하지 않으면 이체를 진행할 수
            없어요.
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
