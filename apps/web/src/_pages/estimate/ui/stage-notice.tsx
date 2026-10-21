'use client';

import { useEffect, useState } from 'react';

import { describeEffect } from '../model/describe';
import type { Effect } from '../model/types';

/** 차량 위에 머무는 최소 시간(ms). 길게 두면 차를 가리므로 한 줄을 읽을 만큼만 둔다. 자세한 내용은 견적 요약에 남는다. */
const MIN_VISIBLE_FOR = 7000;
/** 글자 하나당 더하는 시간(ms). 문장이 길수록 읽는 데 오래 걸리므로 그만큼 더 머문다. */
const PER_CHARACTER = 90;

function visibleFor(text: string) {
  return Math.max(MIN_VISIBLE_FOR, 3000 + text.length * PER_CHARACTER);
}

/**
 * 선택이 자동으로 바뀌면 차량 위 아래쪽에 작은 표시를 하나만 잠깐 보인다.
 * 안내 블록은 나타날 때 옵션을 밀었고, 알림 카드는 옵션을 가리며 선택할 때마다 쌓였다. 이 표시는 차량 영역 안에 겹쳐서
 * 배치를 바꾸지 않고, 새로 바뀌면 이전 것을 대신하며(쌓이지 않음), 눌러도 아무 일이 없고(`pointer-events-none`)
 * 몇 초 뒤 사라진다. 바뀐 항목 전체는 견적 요약의 "자동으로 바뀐 항목"에서 다시 볼 수 있다.
 */
export function StageNotice({ notices }: { notices: readonly Effect[] }) {
  // 어느 묶음을 이미 숨겼는지 기억한다. 새 묶음이 오면 다시 보인다(효과 안에서 상태를 바꾸지 않는다).
  const [hiddenFor, setHiddenFor] = useState<readonly Effect[] | null>(null);
  const visible = notices.length > 0 && hiddenFor !== notices;

  const first = notices[0];
  const more = notices.length - 1;
  const message = first
    ? `선택이 자동으로 바뀌었습니다. ${describeEffect(first)}${more > 0 ? ` 외 ${more}건. 견적 요약에서 모두 볼 수 있습니다.` : ''}`
    : '';

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setHiddenFor(notices);
    }, visibleFor(message));
    return () => {
      clearTimeout(timer);
    };
  }, [visible, notices, message]);

  return (
    <div
      role="status"
      className="split:right-auto split:max-w-md pointer-events-none absolute inset-x-3 bottom-3 z-10 flex justify-start"
    >
      {visible && first ? (
        <p className="bg-background/85 text-foreground text-caption line-clamp-2 rounded-md px-2.5 py-1.5 backdrop-blur-sm">
          <span className="font-semibold">선택이 자동으로 바뀌었습니다.</span>{' '}
          {describeEffect(first)}
          {more > 0 ? ` 외 ${more}건. 견적 요약에서 모두 볼 수 있습니다.` : ''}
        </p>
      ) : null}
    </div>
  );
}
