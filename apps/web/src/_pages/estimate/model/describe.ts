import { CATALOG } from './catalog';
import { formatWon, josa } from './format';
import { findItem } from './selection';
import type { Catalog, Effect, ItemRef } from './types';

/** 슬롯의 화면용 이름 */
export const SLOT_LABEL: Record<ItemRef['slot'] | 'trim', string> = {
  powertrain: '파워트레인',
  trim: '트림',
  color: '외장 색상',
  wheel: '휠',
  seat: '시트',
  interior: '내장 색상',
  garnish: '가니쉬',
  caliper: '브레이크 캘리퍼',
  rimFinish: '휠 마감',
  package: '선택 품목',
  accessory: '액세서리',
};

export type EffectTense = 'done' | 'pending';

/**
 * 효과를 사용자에게 보여 줄 한국어 한 문장으로 옮긴다. UI는 이 문장이나 효과 데이터를 그대로 렌더한다.
 * `pending`은 아직 확인하지 않은 변경(확인 창)이라 "바꿉니다"로, `done`은 이미 반영된 변경(알림)이라 "바꿨습니다"로 쓴다.
 */
export function describeEffect(
  effect: Effect,
  catalog: Catalog = CATALOG,
  tense: EffectTense = 'done',
): string {
  const name = (ref: ItemRef) => findItem(ref, catalog).label;
  const slotName = (slot: ItemRef['slot']) => SLOT_LABEL[slot];
  const done = tense === 'done';

  switch (effect.kind) {
    case 'auto-added':
      return `${josa(name(effect.because), '을/를')} 고르려면 ${josa(name(effect.item), '이/가')} 필요해서 함께 ${done ? '담았습니다' : '담습니다'}.`;
    case 'auto-removed':
      return effect.reason === 'unavailable'
        ? `현재 사양에서는 ${josa(name(effect.item), '을/를')} 선택할 수 없어 ${done ? '뺐습니다' : '뺍니다'}.`
        : `${name(effect.item)}에 필요한 ${effect.because ? josa(name(effect.because), '이/가') : '품목이'} 없어져 함께 ${done ? '뺐습니다' : '뺍니다'}.`;
    case 'replaced': {
      const removed = effect.removed.map(name).join(', ');
      if (effect.reason === 'excludes') {
        return `${josa(name(effect.by), '은/는')} ${josa(removed, '와/과')} 함께 고를 수 없어 ${josa(removed, '을/를')} ${done ? '뺐습니다' : '뺍니다'}.`;
      }
      if (effect.reason === 'includes') {
        return `${name(effect.by)}에 ${josa(removed, '이/가')} 포함돼 있어 따로 담지 않습니다.`;
      }
      const kept = effect.added.map(name).join(', ');
      return `${josa(removed, '을/를')} 풀고 ${kept}만 개별로 ${done ? '남겼습니다' : '남깁니다'}.`;
    }
    case 'remapped': {
      const ref = { slot: effect.slot, id: effect.to } as ItemRef;
      const before = findItem({ slot: effect.slot, id: effect.from } as ItemRef, catalog).label;
      const after = name(ref);
      return effect.reason === 'derived'
        ? `${josa(slotName(effect.slot), '이/가')} 내장에 맞춰 ${before}에서 ${josa(after, '으로/로')} ${done ? '바뀌었습니다' : '바뀝니다'}.`
        : `${josa(slotName(effect.slot), '을/를')} ${before}에서 ${josa(after, '으로/로')} ${done ? '바꿨습니다' : '바꿉니다'}.`;
    }
    case 'blocked':
      return `${name(effect.requiredBy)}에 ${josa(name(effect.item), '이/가')} 필요해서 해제할 수 없습니다.`;
    case 'unavailable-reason':
      return effect.reason;
    case 'suggestion':
      return `${effect.message} (${formatWon(effect.savings)} 절약)`;
  }
}
