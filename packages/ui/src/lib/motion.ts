import type { Transition } from 'motion/react';

/** 움직임 시간(초). 쓰임새별로 정한 값만 쓴다. */
export const DURATION = {
  /** 감소 모션이거나 눈에 띄지 않아야 하는 전환 */
  instant: 0.12,
  /** 호버·눌림 같은 즉각 반응 */
  fast: 0.18,
  /** 선택·상태 변화 */
  base: 0.28,
  /** 목록·섹션 진입 */
  slow: 0.45,
  /** 화면당 한 번 쓰는 큰 연출 */
  hero: 0.8,
} as const;

type Bezier = [number, number, number, number];

export const EASE: Record<'outExpo' | 'inOut', Bezier> = {
  /** 빠르게 시작해 부드럽게 멈춘다. 진입과 선택 반응의 기본 */
  outExpo: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
};

export const SPRING = {
  /** 눌림, 활성 표시 이동처럼 정확하고 빠른 반응 */
  snappy: { type: 'spring', stiffness: 520, damping: 32 },
  /** 패널·카드 이동 */
  gentle: { type: 'spring', stiffness: 260, damping: 28 },
  /** 선택 확정 같은 작은 강조. 화면당 하나 이내로 쓴다 */
  bouncy: { type: 'spring', stiffness: 380, damping: 18 },
} satisfies Record<string, Transition>;

/** 목록 항목 사이 지연(초) */
export const STAGGER = { fast: 0.03, base: 0.04, slow: 0.08 } as const;

/** 감소 모션이면 이동 없이 짧게 바꾼다. `useReducedMotion()` 값을 그대로 넘긴다. */
export function reducedTransition(reduce: boolean | null, transition: Transition): Transition {
  return reduce ? { duration: DURATION.instant } : transition;
}
