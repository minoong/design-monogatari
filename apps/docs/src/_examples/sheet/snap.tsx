'use client';

import { Button } from '@repo/ui/button';
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@repo/ui/sheet';
import { useState } from 'react';

const LINES = Array.from({ length: 24 }, (_, index) => [
  `선택 품목 ${index + 1}`,
  `+₩${((index + 1) * 350_000).toLocaleString('ko-KR')}`,
]);

export default function SheetSnap() {
  const [point, setPoint] = useState(0.4);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary">높이를 고르는 시트 열기</Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        snapPoints={[0.4, 0.85]}
        data-ds-preview
        onSnapPointChange={setPoint}
      >
        <SheetHeader>
          <SheetTitle>선택 내역</SheetTitle>
          <SheetDescription>
            핸들이나 본문을 위로 끌면 높이가 올라갑니다. 지금 높이는 {Math.round(point * 100)}
            %입니다.
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
          <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm">
            {LINES.map(([label, price]) => (
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
