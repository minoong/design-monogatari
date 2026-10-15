import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from './button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  type SheetSide,
  SheetTitle,
  SheetTrigger,
} from './sheet';

const LINES = [
  ['기본 차량가', '90,000,000원'],
  ['스포트 트림', '+8,500,000원'],
  ['메탈릭 외장', '+1,000,000원'],
  ['파퓰러 패키지', '+3,600,000원'],
];

function QuoteSheet({ side }: { side: SheetSide }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary">견적 요약 보기</Button>
      </SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>견적 요약</SheetTitle>
          <SheetDescription>
            선택하신 항목과 금액입니다. 항목을 눌러 해당 단계로 이동합니다.
          </SheetDescription>
        </SheetHeader>
        <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm">
          {LINES.map(([label, price]) => (
            <li key={label} className="border-border flex justify-between border-b py-2">
              <span>{label}</span>
              <span className="tabular-nums">{price}</span>
            </li>
          ))}
        </ul>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="primary">닫기</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

const meta = {
  title: '컴포넌트/시트',
  component: Sheet,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`Sheet`는 화면 가장자리에서 밀려 나오는 패널입니다. 견적 요약처럼 지금 화면을 유지한 채 보조 내용을 보여 줄 때 쓰고, 데스크톱에서는 `right`, 모바일에서는 `bottom`으로 엽니다. `Dialog`와 같은 Radix 대화상자라서 `SheetTitle`이 필수이고, 열리면 포커스가 안으로 들어가고 Esc로 닫히며 닫히면 포커스가 열었던 버튼으로 돌아갑니다. 열릴 때 0.28초, 닫힐 때 0.18초 동안 가장자리에서 밀려 나오며, 감소 모션이면 움직이지 않습니다.',
      },
    },
  },
} satisfies Meta<typeof Sheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 오른쪽: Story = { render: () => <QuoteSheet side="right" /> };
export const 아래: Story = { render: () => <QuoteSheet side="bottom" /> };
export const 왼쪽: Story = { render: () => <QuoteSheet side="left" /> };
export const 위: Story = { render: () => <QuoteSheet side="top" /> };
