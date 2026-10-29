'use client';

import { useEffect, useState } from 'react';

import { describeEffect } from '../model/describe';
import type { Effect } from '../model/types';

/** 차량 위에 머무는 최소 시간(ms). 길게 두면 차를 가리므로 한 문장을 읽을 만큼만 둔다. 자세한 내용은 견적 요약에 남는다. */
const MIN_VISIBLE_FOR = 4000;
/** 글자 하나당 더하는 시간(ms). 문장이 길수록 읽는 데 오래 걸리므로 그만큼 더 머문다. */
const PER_CHARACTER = 40;

function visibleFor(text: string) {
  return Math.max(MIN_VISIBLE_FOR, 1500 + text.length * PER_CHARACTER);
}

export const NOTICE_LEAD = '선택이 자동으로 바뀌었습니다.';

/**
 * 선택이 자동으로 바뀌었을 때 차량 위 왼쪽 위의 틀(`Morph`)에 잠깐 보일 문장과 보임 여부.
 * 아래쪽에 따로 칩을 두면 안내 문구, 도구 판과 겹쳐 차량 위에 흰 상자가 네 개가 됐다. 그래서 같은 자리의 틀이 이 문장으로 변형됐다가
 * 몇 초 뒤 원래(안내 문구나 선루프 스위치)로 돌아온다. 새로 바뀌면 이전 것을 대신하고(쌓이지 않음), 바뀐 항목 전체는 견적 요약의
 * "자동으로 바뀐 항목"에서 다시 볼 수 있다.
 */
export function useStageNotice(notices: readonly Effect[]) {
  // 어느 묶음을 이미 숨겼는지 기억한다. 새 묶음이 오면 다시 보인다(효과 안에서 상태를 바꾸지 않는다).
  const [hiddenFor, setHiddenFor] = useState<readonly Effect[] | null>(null);
  const visible = notices.length > 0 && hiddenFor !== notices;

  const first = notices[0];
  const more = notices.length - 1;
  const detail = first
    ? `${describeEffect(first)}${more > 0 ? ` 외 ${more}건. 견적 요약에서 모두 볼 수 있습니다.` : ''}`
    : '';
  const message = first ? `${NOTICE_LEAD} ${detail}` : '';

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setHiddenFor(notices);
    }, visibleFor(message));
    return () => {
      clearTimeout(timer);
    };
  }, [visible, notices, message]);

  return { visible: visible && Boolean(first), detail, message };
}
