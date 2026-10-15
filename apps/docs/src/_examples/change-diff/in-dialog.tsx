import { Button } from '@repo/ui/button';
import { ChangeDiff } from '@repo/ui/change-diff';
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

export default function ChangeDiffInDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">트림을 컴포트로 바꾸기</Button>
      </DialogTrigger>
      <DialogContent data-ds-preview className="max-w-xl">
        <DialogHeader>
          <DialogTitle>트림을 바꾸면 다른 선택도 바뀝니다</DialogTitle>
          <DialogDescription>확인하기 전까지는 선택과 가격이 바뀌지 않습니다.</DialogDescription>
        </DialogHeader>
        <ChangeDiff
          rows={[
            { label: '트림', before: '스포트', after: '컴포트' },
            { label: '휠', before: '20인치 알로이 휠', after: '19인치 기본 휠' },
            { label: '외장 색상', before: '브론즈', after: '화이트' },
          ]}
          summary="-10,500,000원"
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">취소</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="primary">변경 확인</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
