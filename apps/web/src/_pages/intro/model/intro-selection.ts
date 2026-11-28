// 견적 화면의 규칙 모델을 공개 진입점(`index.model`)으로만, 한 방향으로 가져다 쓴다. 인트로가 규칙을 따로 갖지 않게 하려는 것이다.
import {
  CATALOG,
  createDefaultSelection,
  describeEffect,
  type Intent,
  resolveSelection,
  type Selection,
  type SingleSlot,
} from '../../estimate/index.model';

/** 인트로에서 직접 고를 수 있는 항목의 자리. 견적 화면의 일부만 맛보게 한다. */
export type IntroSlot = Extract<SingleSlot, 'trim' | 'color' | 'wheel' | 'interior'>;

export interface IntroChange {
  selection: Selection;
  /** 이번 선택으로 함께 바뀐 항목을 알리는 문장. 바뀐 것이 없으면 비어 있다. */
  sentences: readonly string[];
  /** 선택이 막혔을 때의 이유. 막히지 않았으면 null이고 선택은 그대로 반영된다. */
  blockedReason: string | null;
}

export function createIntroSelection(): Selection {
  return createDefaultSelection(CATALOG);
}

/**
 * 인트로에서 한 항목을 고른다. 견적 화면은 다른 선택이 함께 바뀔 때 확인 창을 띄우지만, 인트로는 맛보기라서
 * 바로 반영하고 무엇이 바뀌었는지 문장으로 알린다. 바뀐 항목은 항상 문장으로 돌려주므로 조용히 바뀌는 일은 없다.
 */
export function chooseInIntro(selection: Selection, slot: IntroSlot, id: string): IntroChange {
  const result = resolveSelection(selection, { type: 'set', slot, id } as Intent);
  const sentences = result.effects
    // 패키지 제안은 인트로에 없는 개념이라 걸러 둔다.
    .filter((effect) => effect.kind !== 'suggestion')
    .map((effect) => describeEffect(effect));

  if (result.status === 'blocked') {
    return { selection, sentences: [], blockedReason: sentences[0] ?? '선택할 수 없습니다.' };
  }
  return { selection: result.next, sentences, blockedReason: null };
}
