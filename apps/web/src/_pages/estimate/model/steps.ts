import type { ItemRef } from './types';

export const STEPS = [
  { id: 'model', label: '모델' },
  { id: 'exterior', label: '외장 색상' },
  { id: 'wheel', label: '휠' },
  { id: 'seat', label: '시트' },
  { id: 'interior', label: '내장' },
  { id: 'options', label: '선택 품목' },
  { id: 'accessories', label: '액세서리' },
  { id: 'result', label: '견적 결과' },
] as const;

export type StepId = (typeof STEPS)[number]['id'];

export const DEFAULT_STEP: StepId = 'model';

export function isStepId(value: unknown): value is StepId {
  return STEPS.some((step) => step.id === value);
}

/** 한 항목을 바꾸러 갈 단계 */
export function stepOf(slot: ItemRef['slot']): StepId {
  switch (slot) {
    case 'powertrain':
    case 'trim':
      return 'model';
    case 'color':
      return 'exterior';
    case 'wheel':
    case 'caliper':
      return 'wheel';
    case 'seat':
      return 'seat';
    case 'interior':
    case 'garnish':
      return 'interior';
    case 'package':
      return 'options';
    case 'accessory':
      return 'accessories';
  }
}

export function neighborStep(step: StepId, offset: -1 | 1): StepId | null {
  const index = STEPS.findIndex((candidate) => candidate.id === step);
  return STEPS[index + offset]?.id ?? null;
}
