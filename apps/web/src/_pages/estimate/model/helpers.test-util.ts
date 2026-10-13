import { createDefaultSelection, resolveSelection } from './resolve';
import type { Intent, Resolution, Selection } from './types';

export const defaults = (): Selection => createDefaultSelection();

/** 확인이 필요한 변경까지 사용자가 승인한 것처럼 이어서 적용한다. */
export function apply(prev: Selection, ...intents: Intent[]): Selection {
  return intents.reduce((current, intent) => {
    const result = resolveSelection(current, intent);
    if (result.status === 'blocked') {
      throw new Error(`막힌 변경: ${JSON.stringify(intent)} → ${JSON.stringify(result.effects)}`);
    }
    return result.next;
  }, prev);
}

export const kinds = (result: Resolution) => result.effects.map((effect) => effect.kind);
