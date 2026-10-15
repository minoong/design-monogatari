'use client';

import { CopyButton } from '@repo/ui/copy-button';
import { ToastProvider, useToast } from '@repo/ui/toast';

function ShareLink() {
  const { toast } = useToast();

  return (
    <CopyButton
      variant="primary"
      value="https://example.com/estimate?v=1&c=GCW95KC"
      label="견적 링크 복사"
      onCopy={() => {
        toast({ title: '링크를 복사했습니다', description: '붙여 넣어 견적을 공유하십시오.' });
      }}
    />
  );
}

export default function CopyButtonWithToast() {
  return (
    <ToastProvider>
      <ShareLink />
    </ToastProvider>
  );
}
