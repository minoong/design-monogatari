import { Button } from '@repo/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/dialog';

export default function DialogBasic() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">견적 확인</Button>
      </DialogTrigger>
      <DialogContent data-ds-preview>
        <DialogHeader>
          <DialogTitle>이 구성으로 견적을 저장하시겠습니까?</DialogTitle>
          <DialogDescription>
            선택하신 트림과 옵션, 지역별 부대비용을 한 번 더 확인해 주십시오.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">취소</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="primary">견적 저장</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
