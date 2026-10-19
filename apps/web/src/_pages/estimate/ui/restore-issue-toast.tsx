'use client';

import { useToast } from '@repo/ui/toast';
import { useEffect, useRef } from 'react';

/**
 * 주소에서 읽지 못한 값이 있으면 한 번 알린다(오류 알림이라 닫을 때까지 남는다). 선택이 자동으로 바뀐 일은 여기가
 * 아니라 차량 위의 작은 표시(`stage-notice.tsx`)와 견적 요약이 맡는다. 알림 카드는 옵션을 가리고 선택할 때마다 쌓였다.
 */
export function RestoreIssueToast({ issueCount }: { issueCount: number }) {
  const { toast } = useToast();
  const shown = useRef(false);

  useEffect(() => {
    if (issueCount === 0 || shown.current) return;
    shown.current = true;
    toast({
      title: '주소의 일부를 읽지 못했습니다',
      description: '읽을 수 없는 값은 기본 선택으로 되돌렸습니다.',
      variant: 'error',
    });
  }, [issueCount, toast]);

  return null;
}
