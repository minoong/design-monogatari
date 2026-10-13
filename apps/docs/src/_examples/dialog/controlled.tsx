'use client';

import { Button } from '@repo/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/dialog';
import { useState } from 'react';

export default function DialogControlled() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        바깥에서 열기
      </Button>
      <p className="text-muted-foreground text-caption">상태: {open ? '열림' : '닫힘'}</p>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-ds-preview>
          <DialogHeader>
            <DialogTitle>제어 컴포넌트</DialogTitle>
            <DialogDescription>
              열림 상태를 직접 들고 있습니다. Esc, 바깥 클릭, 닫기 버튼 모두 onOpenChange로
              알립니다.
            </DialogDescription>
          </DialogHeader>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            닫기
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
