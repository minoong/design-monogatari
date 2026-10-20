'use client';

import { Button } from '@repo/ui/button';
import { ArrowDownIcon } from '@repo/ui/icons/arrow-down';
import { ArrowLeftIcon } from '@repo/ui/icons/arrow-left';
import { ArrowRightIcon } from '@repo/ui/icons/arrow-right';
import { ArrowUpIcon } from '@repo/ui/icons/arrow-up';
import { CheckIcon } from '@repo/ui/icons/check';
import { ChevronDownIcon } from '@repo/ui/icons/chevron-down';
import { DownloadIcon } from '@repo/ui/icons/download';
import { HeartIcon } from '@repo/ui/icons/heart';
import { MaximizeIcon } from '@repo/ui/icons/maximize';
import { MinimizeIcon } from '@repo/ui/icons/minimize';
import { MoonIcon } from '@repo/ui/icons/moon';
import { PlusIcon } from '@repo/ui/icons/plus';
import { PrinterIcon } from '@repo/ui/icons/printer';
import { ReceiptTextIcon } from '@repo/ui/icons/receipt-text';
import { RotateCCWIcon } from '@repo/ui/icons/rotate-ccw';
import { SunIcon } from '@repo/ui/icons/sun';
import { TriangleAlertIcon } from '@repo/ui/icons/triangle-alert';
import { XIcon } from '@repo/ui/icons/x';
import { type ComponentType, type RefObject, useEffect, useRef, useState } from 'react';

type Handle = { startAnimation: () => void; stopAnimation: () => void };

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
  { name: 'download', use: '이미지 저장', Icon: DownloadIcon },
  { name: 'triangle-alert', use: '경고, 선택할 수 없음', Icon: TriangleAlertIcon },
  { name: 'plus', use: '추가', Icon: PlusIcon },
  { name: 'heart', use: '관심', Icon: HeartIcon },
];

function Item({ name, use, Icon, playAll }: (typeof ICONS)[number] & { playAll: number }) {
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

export default function IconsGallery() {
  const [playAll, setPlayAll] = useState(0);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex justify-end">
        <Button size="small" variant="secondary" onClick={() => setPlayAll((count) => count + 1)}>
          모두 재생
        </Button>
      </div>
      <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 min-[30rem]:grid-cols-2 lg:grid-cols-3">
        {ICONS.map((icon) => (
          <Item key={icon.name} {...icon} playAll={playAll} />
        ))}
      </ul>
    </div>
  );
}
