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

export default function SheetNested() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary">견적 요약 열기</Button>
      </SheetTrigger>
      <SheetContent side="bottom" data-ds-preview>
        <SheetHeader>
          <SheetTitle>견적 요약</SheetTitle>
          <SheetDescription>항목을 눌러 자세한 내용을 겹쳐 엽니다.</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary">파퓰러 패키지 자세히</Button>
            </SheetTrigger>
            <SheetContent side="bottom" data-ds-preview>
              <SheetHeader>
                <SheetTitle>파퓰러 패키지</SheetTitle>
                <SheetDescription>바깥 시트가 뒤로 물러난 채 이 시트가 열립니다.</SheetDescription>
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
