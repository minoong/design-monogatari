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

const LINES = Array.from({ length: 24 }, (_, index) => [
  `선택 품목 ${index + 1}`,
  `+${((index + 1) * 350_000).toLocaleString('ko-KR')}원`,
]);

export default function SheetBottomScroll() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary">긴 내용 열기</Button>
      </SheetTrigger>
      <SheetContent side="bottom" data-ds-preview>
        <SheetHeader>
          <SheetTitle>선택 내역</SheetTitle>
          <SheetDescription>목록은 스크롤하고, 제목과 버튼은 늘 보입니다.</SheetDescription>
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
