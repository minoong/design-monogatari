'use client';

import { useToast } from '@repo/ui/toast';
import { type Dispatch, useEffect, useRef } from 'react';

import type { WizardAction, WizardSnapshot } from '../model/wizard';

/** 처음부터 다시 시작한 뒤 실행 취소를 내미는 시간(ms). 알림의 기본값과 같고, 호버·포커스 중에는 멈춘다. */
const UNDO_WINDOW = 5000;

/**
 * 처음부터 다시 시작하면 되돌릴 수 있는 알림을 띄운다. 알림은 상태(`undo`)를 따라간다: 그 사이에 다른 동작이 일어나
 * `undo`가 사라지면 알림도 닫아, 새로 고른 것을 옛 상태로 덮어쓰는 일이 없다.
 */
export function ResetUndoToast({
  undo,
  dispatch,
}: {
  undo: WizardSnapshot | null;
  dispatch: Dispatch<WizardAction>;
}) {
  const { toast, dismiss } = useToast();
  const shown = useRef<{ snapshot: WizardSnapshot; id: string } | null>(null);

  useEffect(() => {
    if (undo && shown.current?.snapshot !== undo) {
      const id = toast({
        title: '처음부터 다시 시작했습니다',
        description: '선택이 모두 기본값으로 돌아갔습니다.',
        duration: UNDO_WINDOW,
        action: {
          label: '실행 취소',
          onClick: () => {
            dispatch({ type: 'undo' });
          },
        },
      });
      shown.current = { snapshot: undo, id };
    } else if (!undo && shown.current) {
      dismiss(shown.current.id);
      shown.current = null;
    }
  }, [undo, toast, dismiss, dispatch]);

  return null;
}
