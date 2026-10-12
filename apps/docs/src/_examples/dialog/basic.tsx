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
        <Button variant="secondary">이체 확인</Button>
      </DialogTrigger>
      <DialogContent data-ds-preview>
        <DialogHeader>
          <DialogTitle>10,000원을 이체할까요?</DialogTitle>
          <DialogDescription>보내는 계좌와 받는 분을 한 번 더 확인해 주세요.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">취소</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="primary">이체하기</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
