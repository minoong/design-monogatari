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

export default function SheetBottom() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary">아래에서 열기</Button>
      </SheetTrigger>
      <SheetContent side="bottom" data-ds-preview>
        <SheetHeader>
          <SheetTitle>예상 견적가</SheetTitle>
          <SheetDescription>
            모바일에서는 아래에서 올라오는 시트로 요약을 보여 줍니다. 핸들을 아래로 끌어 닫아
            보십시오.
          </SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="primary">확인</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
