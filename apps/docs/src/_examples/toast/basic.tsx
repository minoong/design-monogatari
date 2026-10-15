'use client';

import { Button } from '@repo/ui/button';
import { ToastProvider, useToast } from '@repo/ui/toast';

function Buttons() {
  const { toast } = useToast();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            title: '링크를 복사했습니다',
            description: '공유할 견적 링크가 클립보드에 있습니다.',
          })
        }
      >
        링크 복사
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            title: '링크를 복사하지 못했습니다',
            description: '브라우저의 클립보드 권한을 확인해 주십시오.',
            variant: 'error',
          })
        }
      >
        오류 알림
      </Button>
    </div>
  );
}

export default function ToastBasic() {
  return (
    <ToastProvider>
      <Buttons />
    </ToastProvider>
  );
}
