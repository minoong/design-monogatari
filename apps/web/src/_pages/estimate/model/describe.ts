import { CATALOG } from './catalog';
import { formatWon } from './format';
import { findItem } from './selection';
import type { Catalog, Effect, ItemRef } from './types';

const SLOT_LABEL: Record<ItemRef['slot'] | 'trim', string> = {
  powertrain: '파워트레인',
  trim: '트림',
  color: '외장 색상',
  wheel: '휠',
  seat: '시트',
  interior: '내장 색상',
  garnish: '가니쉬',
  package: '선택 품목',
  accessory: '액세서리',
};

/** 효과를 사용자에게 보여 줄 한국어 한 문장으로 옮긴다. UI는 이 문장이나 효과 데이터를 그대로 렌더한다. */
export function describeEffect(effect: Effect, catalog: Catalog = CATALOG): string {
  const name = (ref: ItemRef) => findItem(ref, catalog).label;
  const slotName = (slot: ItemRef['slot']) => SLOT_LABEL[slot];

  switch (effect.kind) {
    case 'auto-added':
      return `${name(effect.because)}을(를) 고르려면 ${name(effect.item)}이(가) 필요해서 함께 담았습니다.`;
    case 'auto-removed':
      return effect.reason === 'unavailable'
        ? `현재 사양에서는 ${name(effect.item)}을(를) 선택할 수 없어 뺐습니다.`
        : `${name(effect.item)}에 필요한 ${effect.because ? name(effect.because) : '품목'}이(가) 없어져 함께 뺐습니다.`;
    case 'replaced': {
      const removed = effect.removed.map(name).join(', ');
      if (effect.reason === 'excludes') {
        return `${name(effect.by)}은(는) ${removed}와(과) 함께 고를 수 없어 ${removed}을(를) 뺐습니다.`;
      }
      if (effect.reason === 'includes') {
        return `${name(effect.by)}에 ${removed}이(가) 포함돼 있어 따로 담지 않습니다.`;
      }
      const kept = effect.added.map(name).join(', ');
      return `${removed} 패키지를 풀고 ${kept}만 개별로 남겼습니다.`;
    }
    case 'remapped': {
      const ref = { slot: effect.slot, id: effect.to } as ItemRef;
      const before = findItem({ slot: effect.slot, id: effect.from } as ItemRef, catalog).label;
      const after = name(ref);
      return effect.reason === 'derived'
        ? `${slotName(effect.slot)}이(가) 내장에 맞춰 ${before}에서 ${after}(으)로 바뀌었습니다.`
        : `${slotName(effect.slot)}을(를) ${before}에서 ${after}(으)로 바꿨습니다.`;
    }
    case 'blocked':
      return `${name(effect.requiredBy)}에 ${name(effect.item)}이(가) 필요해서 해제할 수 없습니다.`;
    case 'unavailable-reason':
      return effect.reason;
    case 'suggestion':
      return `${effect.message} (${formatWon(effect.savings)} 절약)`;
  }
}
