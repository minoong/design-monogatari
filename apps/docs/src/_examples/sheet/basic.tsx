import { Button } from '@repo/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@repo/ui/sheet';

const LINES = [
  ['기본 차량가', '₩90,000,000'],
  ['스포트 트림', '+₩8,500,000'],
  ['메탈릭 외장', '+₩1,000,000'],
];

export default function SheetBasic() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary">견적 요약 보기</Button>
      </SheetTrigger>
      <SheetContent data-ds-preview>
        <SheetHeader>
          <SheetTitle>견적 요약</SheetTitle>
          <SheetDescription>선택하신 항목과 금액입니다.</SheetDescription>
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
