'use client';

import { TriangleAlertIcon, type TriangleAlertIconHandle } from '@repo/ui/icons/triangle-alert';
import { useEffect, useRef } from 'react';

/** 경고를 알리는 삼각형. 나타날 때 한 번 흔들린다(감소 모션이면 가만히 있다). 장식이라 스크린 리더에는 읽히지 않는다. */
export function AlertGlyph() {
  const ref = useRef<TriangleAlertIconHandle>(null);

  useEffect(() => {
    ref.current?.startAnimation();
  }, []);

  return <TriangleAlertIcon ref={ref} className="text-destructive" size={20} />;
}
