'use client';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ComponentType, type RefObject, useEffect, useRef, useState } from 'react';

import { Button } from '../button';
import { ArrowDownIcon } from '../icons/arrow-down';
import { ArrowLeftIcon } from '../icons/arrow-left';
import { ArrowRightIcon } from '../icons/arrow-right';
import { ArrowUpIcon } from '../icons/arrow-up';
import { CheckIcon } from '../icons/check';
import { ChevronDownIcon } from '../icons/chevron-down';
import { HeartIcon } from '../icons/heart';
import { MaximizeIcon } from '../icons/maximize';
import { MinimizeIcon } from '../icons/minimize';
import { MoonIcon } from '../icons/moon';
import { PlusIcon } from '../icons/plus';
import { PrinterIcon } from '../icons/printer';
import { ReceiptTextIcon } from '../icons/receipt-text';
import { RotateCCWIcon } from '../icons/rotate-ccw';
import { SunIcon } from '../icons/sun';
import { TriangleAlertIcon } from '../icons/triangle-alert';
import { XIcon } from '../icons/x';
import { DocCode, DocPage, DocSection } from './doc-page';

type Handle = { startAnimation: () => void; stopAnimation: () => void };

/** 이름, 쓰는 곳, 컴포넌트. 견적 앱에서 쓰는 자리를 함께 적어 둔다. */
const ICONS: readonly {
  name: string;
  use: string;
  Icon: ComponentType<{ ref?: RefObject<Handle | null>; size?: number }>;
}[] = [
  { name: 'arrow-left', use: '이전, 왼쪽으로 돌리기', Icon: ArrowLeftIcon },
  { name: 'arrow-right', use: '다음, 이동', Icon: ArrowRightIcon },
  { name: 'arrow-up', use: '위로 돌리기', Icon: ArrowUpIcon },
  { name: 'arrow-down', use: '아래로 돌리기', Icon: ArrowDownIcon },
  { name: 'check', use: '확인, 완료', Icon: CheckIcon },
  { name: 'x', use: '닫기, 취소', Icon: XIcon },
  { name: 'chevron-down', use: '펼치기', Icon: ChevronDownIcon },
  { name: 'maximize', use: '확대', Icon: MaximizeIcon },
  { name: 'minimize', use: '축소', Icon: MinimizeIcon },
  { name: 'rotate-ccw', use: '처음으로, 다시 시작', Icon: RotateCCWIcon },
  { name: 'sun', use: '라이트, 선루프', Icon: SunIcon },
  { name: 'moon', use: '다크', Icon: MoonIcon },
  { name: 'receipt-text', use: '견적 요약', Icon: ReceiptTextIcon },
  { name: 'printer', use: '인쇄', Icon: PrinterIcon },
  { name: 'triangle-alert', use: '경고, 선택할 수 없음', Icon: TriangleAlertIcon },
  { name: 'plus', use: '추가', Icon: PlusIcon },
  { name: 'heart', use: '관심', Icon: HeartIcon },
];

function GalleryItem({ name, use, Icon, playAll }: (typeof ICONS)[number] & { playAll: number }) {
  const handle = useRef<Handle>(null);

  // "모두 재생"을 누를 때마다 번호가 올라가고, 그때 한 번 재생한다.
  useEffect(() => {
    if (playAll > 0) handle.current?.startAnimation();
  }, [playAll]);

  return (
    <li>
      <Button
        className="size-full justify-start gap-3 py-3 text-left whitespace-normal"
        display="block"
        variant="secondary"
        onClick={() => handle.current?.startAnimation()}
      >
        <Icon ref={handle} size={24} />
        <span className="flex min-w-0 flex-col">
          <code className="text-xs">{name}</code>
          <span className="text-muted-foreground text-caption">{use}</span>
        </span>
      </Button>
    </li>
  );
}

function Gallery() {
  const [playAll, setPlayAll] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          size="small"
          variant="secondary"
          onClick={() => {
            setPlayAll((count) => count + 1);
          }}
        >
          모두 재생
        </Button>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ICONS.map((icon) => (
          <GalleryItem key={icon.name} {...icon} playAll={playAll} />
        ))}
      </ul>
    </div>
  );
}

/** 문장 안에 넣는 코드. 블록인 DocCode는 문단 안에 둘 수 없다. */
function Code({ children }: { children: string }) {
  return <code className="bg-muted rounded-sm px-1 py-0.5 font-mono text-sm">{children}</code>;
}

function Icons() {
  return (
    <DocPage
      kicker="파운데이션"
      lead="움직이는 아이콘입니다. lucide-animated의 아이콘을 옮겨 온 것과 직접 만든 것이 섞여 있고, 모두 같은 규칙을 따릅니다."
      title="아이콘"
    >
      <DocSection title="쓰는 법">
        <div className="text-foreground text-body flex flex-col gap-4">
          <DocCode>{"import { ArrowRightIcon } from '@repo/ui/icons/arrow-right';"}</DocCode>
          <p>
            버튼의 <b>바로 아래 자식</b>으로 두고 <Code>data-icon=&quot;inline-start&quot;</Code>{' '}
            또는 <Code>inline-end</Code>를 줍니다. 그러면 버튼에 마우스를 올리거나 키보드로 포커스가
            올 때 아이콘이 움직이고, 버튼이 아이콘 쪽 여백을 줄여 줍니다. 아이콘을 <Code>span</Code>{' '}
            같은 요소로 감싸면 버튼이 아이콘을 찾지 못해 움직이지 않습니다.
          </p>
          <p>
            상태가 바뀔 때 한 번 움직이려면 <Code>ref</Code>의 <Code>startAnimation()</Code>을
            부릅니다(예: 테마 전환, 선루프 열기). 감소 모션 설정이면 움직이지 않습니다.
          </p>
        </div>
      </DocSection>
      <DocSection title="규칙">
        <ul className="text-foreground text-body flex list-disc flex-col gap-2 pl-5">
          <li>
            장식입니다. 이름은 버튼 글자나 <Code>aria-label</Code>이 맡고, 아이콘은{' '}
            <Code>aria-hidden</Code>입니다.
          </li>
          <li>
            한 번 재생하고 멈춥니다. 반복하는 움직임은 로딩처럼 진행 중인 상태에만 쓰고 화면 밖이면
            멈춥니다.
          </li>
          <li>
            새 아이콘은 <Code>node scripts/adapt-lucide-animated.mjs &lt;이름&gt;</Code>로 옮깁니다.
            제어가 둘 이상이거나 변형 이름이 다른 아이콘은 직접 옮깁니다.
          </li>
          <li>
            디자인 시스템 컴포넌트는 레지스트리 항목(<Code>icon-check</Code>처럼 <Code>icon-</Code>
            이름)으로 등록한 아이콘만 가져옵니다. 등록하지 않은 아이콘을 가져오면 레지스트리 검사가
            실패합니다. 지금 등록된 것은 <Code>check</Code>와 <Code>x</Code>입니다.
          </li>
        </ul>
      </DocSection>
      <DocSection title="목록">
        <Gallery />
      </DocSection>
    </DocPage>
  );
}

const meta = {
  title: '파운데이션/아이콘',
  component: Icons,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Icons>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 목록: Story = {};
