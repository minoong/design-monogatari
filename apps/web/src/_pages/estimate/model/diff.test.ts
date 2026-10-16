import { describe, expect, it } from 'vitest';

import { diffSelections } from './diff';
import { apply, defaults } from './helpers.test-util';

const options = { taxType: 'taxable', region: 'seoul' } as const;

describe('diffSelections', () => {
  it('바뀐 슬롯만 이전과 이후를 담는다', () => {
    const prev = apply(defaults(), { type: 'set', slot: 'trim', id: 'sport' });
    const next = apply(prev, { type: 'set', slot: 'wheel', id: 'w20' });
    const { rows } = diffSelections(prev, next, options);
    expect(rows).toEqual([{ label: '휠', before: '19인치 기본 휠', after: '20인치 알로이 휠' }]);
  });

  it('추가와 삭제된 패키지·액세서리는 한쪽만 담는다', () => {
    const prev = defaults();
    const next = apply(
      prev,
      { type: 'add', slot: 'packages', id: 'hud' },
      { type: 'add', slot: 'accessories', id: 'dashcam' },
    );
    const { rows } = diffSelections(prev, next, options);
    expect(rows).toEqual([
      { label: '선택 품목', after: '헤드업 디스플레이' },
      { label: '액세서리', after: '빌트인 블랙박스' },
    ]);
    expect(diffSelections(next, prev, options).rows).toEqual([
      { label: '선택 품목', before: '헤드업 디스플레이' },
      { label: '액세서리', before: '빌트인 블랙박스' },
    ]);
  });

  it('합계 변동은 소비자가 기준이고 반대 방향이면 부호가 반대다', () => {
    const prev = defaults();
    const next = apply(prev, { type: 'add', slot: 'packages', id: 'hud' });
    expect(diffSelections(prev, next, options).priceDelta).toBe(1_500_000);
    expect(diffSelections(next, prev, options).priceDelta).toBe(-1_500_000);
  });

  it('같은 선택이면 변경이 없다', () => {
    const selection = defaults();
    expect(diffSelections(selection, selection, options)).toEqual({ rows: [], priceDelta: 0 });
  });
});
