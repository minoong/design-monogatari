import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from './button';
import {
  Sheet,
  SheetBody,
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
  ['기본 차량가', '₩90,000,000'],
  ['스포트 트림', '+₩8,500,000'],
  ['메탈릭 외장', '+₩1,000,000'],
  ['파퓰러 패키지', '+₩3,600,000'],
];

const MANY_LINES = Array.from({ length: 24 }, (_, index) => [
  `선택 품목 ${index + 1}`,
  `+₩${((index + 1) * 350_000).toLocaleString('ko-KR')}`,
]);

function QuoteSheet({
  side,
  lines = LINES,
  handle,
  snapPoints,
  body = true,
}: {
  side: SheetSide;
  lines?: string[][];
  handle?: boolean;
  snapPoints?: number[];
  /** false 이면 `SheetBody` 없이 시트 전체가 스크롤한다(핸들을 끈 이전 방식). */
  body?: boolean;
}) {
  const list = (
    <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm">
      {lines.map(([label, price]) => (
        <li key={label} className="border-border flex justify-between border-b py-2">
          <span>{label}</span>
          <span className="tabular-nums">{price}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary">견적 요약 보기</Button>
      </SheetTrigger>
      <SheetContent handle={handle} side={side} snapPoints={snapPoints}>
        <SheetHeader>
          <SheetTitle>견적 요약</SheetTitle>
          <SheetDescription>
            선택하신 항목과 금액입니다. 항목을 눌러 해당 단계로 이동합니다.
          </SheetDescription>
        </SheetHeader>
        {body ? <SheetBody>{list}</SheetBody> : list}
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
export const 오른쪽_긴_내용: Story = {
  render: () => <QuoteSheet lines={MANY_LINES} side="right" />,
};
export const 아래: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '아래에서 열리는 시트는 위쪽에 핸들이 있고, 핸들이나 제목, 푸터의 빈 곳을 아래로 끌어 닫습니다(시트 높이의 30%를 넘게 끌거나 빠르게 쓸어내리면 닫히고, 아니면 제자리로 돌아옵니다). 목록과 버튼에서는 끌기가 시작되지 않습니다.',
      },
    },
  },
  render: () => <QuoteSheet side="bottom" />,
};

export const 아래_긴_내용: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '내용이 시트보다 길면 `SheetBody` 안에서 스크롤합니다. 제목과 닫기 버튼은 스크롤해도 늘 보입니다. 본문을 위아래로 쓸면 스크롤하고(시트는 움직이지 않음), 본문이 맨 위에 있을 때 손가락으로 아래로 끌면 시트가 따라 내려가 닫을 수 있습니다. 본문이 조금이라도 스크롤된 상태에서는 핸들, 제목, 푸터의 빈 곳을 끌어야 합니다.',
      },
    },
  },
  render: () => <QuoteSheet lines={MANY_LINES} side="bottom" />,
};

export const 아래_스냅_높이: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`snapPoints={[0.4, 0.85]}`는 화면 높이의 40%와 85% 두 높이에 멈춥니다. 처음에는 40%로 열리고, 핸들이나 본문을 위로 끌면 85%로 올라오며, 놓으면 가장 가까운 높이로 맞춰집니다. 가장 낮은 높이보다 더 내리면 닫힙니다. 85%일 때만 본문이 스크롤하고 40%일 때는 본문을 끌어 높이를 바꿉니다. 높이가 바뀔 때 `onSnapPointChange`가 새 높이로 불리고, 이 스토리는 그 값을 설명에 보여 줍니다.',
      },
    },
  },
  render: () => <SnapSheet />,
};

export const 아래_핸들_없음: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`handle={false}`이면 핸들과 끌어 닫기가 없고 시트 전체가 스크롤합니다(이전 동작). 끌어 닫지 않는 아래 시트에 씁니다.',
      },
    },
  },
  render: () => <QuoteSheet body={false} handle={false} lines={MANY_LINES} side="bottom" />,
};
function SnapSheet() {
  // `onSnapPointChange`로 받은 높이를 설명에 보여 준다(바뀔 때만 불린다).
  const [point, setPoint] = useState(0.4);
  const [changes, setChanges] = useState(0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary">견적 요약 보기</Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        snapPoints={[0.4, 0.85]}
        onSnapPointChange={(next) => {
          setPoint(next);
          setChanges((count) => count + 1);
        }}
      >
        <SheetHeader>
          <SheetTitle>견적 요약</SheetTitle>
          <SheetDescription data-testid="snap-state">
            현재 높이 {Math.round(point * 100)}%, 바뀐 횟수 {changes}
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
          <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm">
            {MANY_LINES.map(([label, price]) => (
              <li key={label} className="border-border flex justify-between border-b py-2">
                <span>{label}</span>
                <span className="tabular-nums">{price}</span>
              </li>
            ))}
          </ul>
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="primary">닫기</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function NestedSheets() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary">견적 요약 보기</Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>견적 요약</SheetTitle>
          <SheetDescription>항목을 눌러 자세한 내용을 아래에서 겹쳐 엽니다.</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary">파퓰러 패키지 자세히</Button>
            </SheetTrigger>
            <SheetContent side="bottom">
              <SheetHeader>
                <SheetTitle>파퓰러 패키지</SheetTitle>
                <SheetDescription>
                  바깥 시트가 한 칸 뒤로 물러난 채 이 시트가 위에 열립니다.
                </SheetDescription>
              </SheetHeader>
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="primary">닫기</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="primary">닫기</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export const 아래_중첩: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '시트 안에서 다른 시트를 열면 바깥 시트가 한 칸 뒤로 물러나고(5% 작아짐) 안쪽 시트가 그 위에 열립니다. 안쪽 시트의 핸들을 아래로 끌면 끄는 만큼 바깥 시트가 원래 크기로 돌아오고 다시 올리면 작아집니다(안쪽이 열린 정도에서 계산). 안쪽을 닫으면 바깥 시트가 원래대로 돌아옵니다. 안쪽 시트도 핸들로 끌어 닫을 수 있고 포커스는 열었던 버튼으로 돌아갑니다.',
      },
    },
  },
  render: () => <NestedSheets />,
};

export const 왼쪽: Story = { render: () => <QuoteSheet side="left" /> };
export const 위: Story = { render: () => <QuoteSheet side="top" /> };
