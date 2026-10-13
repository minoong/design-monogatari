import { describe, expect, it } from 'vitest';

import { CATALOG } from './catalog';
import { describeEffect } from './describe';
import { apply, defaults, kinds } from './helpers.test-util';
import { normalizeSelection, resolveSelection } from './resolve';
import { effectivePackages, isIncludedByPackage } from './selection';
import type { Intent, Selection } from './types';
import { SINGLE_SLOTS } from './types';

const sportGasoline = () => apply(defaults(), { type: 'set', slot: 'trim', id: 'sport' });

describe('resolveSelection — 기본 동작', () => {
  it('이미 그 상태이면 아무것도 바꾸지 않는다', () => {
    const prev = defaults();
    const result = resolveSelection(prev, { type: 'set', slot: 'color', id: 'white' });
    expect(result).toEqual({ status: 'applied', next: prev, effects: [] });
  });

  it('이전 선택을 변경하지 않는다', () => {
    const prev = defaults();
    const snapshot = JSON.stringify(prev);
    resolveSelection(prev, { type: 'set', slot: 'seat', id: 'four' });
    expect(JSON.stringify(prev)).toBe(snapshot);
  });

  it('단순 선택은 확인 없이 적용된다', () => {
    const result = resolveSelection(defaults(), { type: 'set', slot: 'color', id: 'blue' });
    expect(result.status).toBe('applied');
    expect(result.next.color).toBe('blue');
    expect(result.effects).toEqual([]);
  });

  it('액세서리는 담고 뺀다', () => {
    const added = apply(defaults(), { type: 'add', slot: 'accessories', id: 'dashcam' });
    expect(added.accessories).toEqual(['dashcam']);
    const removed = apply(added, { type: 'remove', slot: 'accessories', id: 'dashcam' });
    expect(removed.accessories).toEqual([]);
  });

  it('패키지와 액세서리는 카탈로그 순서로 정렬된다', () => {
    const selection = apply(
      defaults(),
      { type: 'add', slot: 'packages', id: 'panorama' },
      { type: 'add', slot: 'packages', id: 'comfort-rear' },
      { type: 'add', slot: 'accessories', id: 'dashcam' },
      { type: 'add', slot: 'accessories', id: 'floor-mat' },
    );
    expect(selection.packages).toEqual(['comfort-rear', 'panorama']);
    expect(selection.accessories).toEqual(['floor-mat', 'dashcam']);
  });
});

describe('규칙: 필수 동반(requires)', () => {
  it('4인승을 고르면 뒷좌석 컴포트 패키지가 자동으로 담기고 확인을 요구한다', () => {
    const result = resolveSelection(defaults(), { type: 'set', slot: 'seat', id: 'four' });
    expect(result.status).toBe('needs-confirmation');
    expect(result.next.seat).toBe('four');
    expect(result.next.packages).toEqual(['comfort-rear']);
    expect(result.effects).toEqual([
      {
        kind: 'auto-added',
        item: { slot: 'package', id: 'comfort-rear' },
        because: { slot: 'seat', id: 'four' },
      },
    ]);
  });

  it('필요로 하는 항목이 남아 있는 동안 패키지 해제는 막힌다', () => {
    const prev = apply(defaults(), { type: 'set', slot: 'seat', id: 'four' });
    const result = resolveSelection(prev, { type: 'remove', slot: 'packages', id: 'comfort-rear' });
    expect(result.status).toBe('blocked');
    expect(result.next).toBe(prev);
    expect(result.effects).toEqual([
      {
        kind: 'blocked',
        item: { slot: 'package', id: 'comfort-rear' },
        requiredBy: { slot: 'seat', id: 'four' },
      },
    ]);
  });

  it('5인승으로 돌린 뒤에는 패키지를 해제할 수 있다', () => {
    const selection = apply(
      defaults(),
      { type: 'set', slot: 'seat', id: 'four' },
      { type: 'set', slot: 'seat', id: 'five' },
      { type: 'remove', slot: 'packages', id: 'comfort-rear' },
    );
    expect(selection.packages).toEqual([]);
  });

  it('선행 패키지가 필요한 휠: 고르면 패키지가 자동으로 담긴다', () => {
    const result = resolveSelection(sportGasoline(), { type: 'set', slot: 'wheel', id: 'w21' });
    expect(result.status).toBe('needs-confirmation');
    expect(result.next.packages).toEqual(['popular']);
  });

  it('선행 패키지를 해제하면 휠이 조용히 사라지지 않고 되돌린 사실이 효과로 남는다', () => {
    const prev = apply(sportGasoline(), { type: 'set', slot: 'wheel', id: 'w21' });
    const result = resolveSelection(prev, { type: 'remove', slot: 'packages', id: 'popular' });
    expect(result.status).toBe('needs-confirmation');
    expect(result.next.wheel).toBe('w19');
    expect(result.effects).toContainEqual({
      kind: 'remapped',
      slot: 'wheel',
      from: 'w21',
      to: 'w19',
      reason: 'requirement-removed',
      because: { slot: 'package', id: 'popular' },
    });
  });
});

describe('규칙: 상위 선택 변경 시 재매핑(availableWhen)', () => {
  it('트림을 바꾸면 쓸 수 없게 된 휠·외장·내장·가니쉬가 기본 쪽으로 되돌아간다', () => {
    const prev = apply(
      sportGasoline(),
      { type: 'set', slot: 'wheel', id: 'w20' },
      { type: 'set', slot: 'color', id: 'bronze' },
      { type: 'set', slot: 'interior', id: 'brown' },
    );
    expect(prev.garnish).toBe('wood');

    const result = resolveSelection(prev, { type: 'set', slot: 'trim', id: 'comfort' });
    expect(result.status).toBe('needs-confirmation');
    expect(result.next).toMatchObject({
      trim: 'comfort',
      wheel: 'w19',
      color: 'white',
      interior: 'black',
      garnish: 'carbon',
    });
    const remapped = result.effects.filter((effect) => effect.kind === 'remapped');
    expect(remapped.map((effect) => effect.slot)).toEqual([
      'color',
      'wheel',
      'interior',
      'garnish',
    ]);
    // 가니쉬는 사용자가 따로 고른 값이 아니라 내장을 따라간 것이다.
    expect(remapped.find((effect) => effect.slot === 'garnish')).toMatchObject({
      reason: 'derived',
    });
  });

  it('파워트레인을 바꾸면 그 파워트레인에서 불가한 휠이 되돌아가고 액세서리는 알림과 함께 빠진다', () => {
    const prev = apply(
      sportGasoline(),
      { type: 'set', slot: 'wheel', id: 'w21' },
      { type: 'add', slot: 'accessories', id: 'tow-hitch' },
    );
    const result = resolveSelection(prev, { type: 'set', slot: 'powertrain', id: 'phev' });
    expect(result.status).toBe('needs-confirmation');
    expect(result.next.wheel).toBe('w19');
    expect(result.next.accessories).toEqual([]);
    expect(kinds(result)).toEqual(expect.arrayContaining(['remapped', 'auto-removed']));
    // 21인치 휠이 사라지면 필요했던 파퓰러 패키지만 남는다. 패키지 자체는 사용자가 고른 것이라 유지한다.
    expect(result.next.packages).toEqual(['popular']);
  });

  it('외장 색을 바꾸면 어울리지 않게 된 내장이 되돌아간다(색×색 제약)', () => {
    const prev = apply(
      defaults(),
      { type: 'set', slot: 'color', id: 'white' },
      { type: 'set', slot: 'interior', id: 'cream' },
    );
    const result = resolveSelection(prev, { type: 'set', slot: 'color', id: 'black' });
    expect(result.status).toBe('needs-confirmation');
    expect(result.next.interior).toBe('black');
    expect(result.next.garnish).toBe('carbon');
  });

  it('고르려는 항목이 지금 조합에서 불가하면 사유와 대안 트림을 돌려준다', () => {
    const prev = defaults();
    const result = resolveSelection(prev, { type: 'set', slot: 'color', id: 'bronze' });
    expect(result.status).toBe('blocked');
    expect(result.next).toBe(prev);
    expect(result.effects).toEqual([
      {
        kind: 'unavailable-reason',
        item: { slot: 'color', id: 'bronze' },
        reason: '스포트 트림에서만 선택할 수 있어요.',
        alternativeTrim: 'sport',
      },
    ]);
  });

  it('내장 색×외장 색 불가 조합도 막고 사유를 준다', () => {
    const result = resolveSelection(defaults(), { type: 'set', slot: 'interior', id: 'brown' });
    expect(result.status).toBe('blocked');
    expect(result.effects[0]).toMatchObject({ kind: 'unavailable-reason' });
  });
});

describe('규칙: 파생 값(내장 → 가니쉬)', () => {
  it('기본 가니쉬를 쓰던 중이면 새 내장의 기본 가니쉬를 따라가고 확인은 필요 없다', () => {
    const result = resolveSelection(defaults(), { type: 'set', slot: 'color', id: 'pearl' });
    expect(result.status).toBe('applied');

    const prev = apply(defaults(), { type: 'set', slot: 'color', id: 'pearl' });
    const next = resolveSelection(prev, { type: 'set', slot: 'interior', id: 'cream' });
    expect(next.status).toBe('applied');
    expect(next.next.garnish).toBe('wood');
    expect(next.effects).toEqual([
      {
        kind: 'remapped',
        slot: 'garnish',
        from: 'carbon',
        to: 'wood',
        reason: 'derived',
        because: { slot: 'interior', id: 'cream' },
      },
    ]);
  });

  it('사용자가 따로 고른 가니쉬는 새 내장에서도 쓸 수 있으면 유지한다', () => {
    const prev = apply(
      defaults(),
      { type: 'set', slot: 'color', id: 'pearl' },
      { type: 'set', slot: 'garnish', id: 'metal' },
    );
    const result = resolveSelection(prev, { type: 'set', slot: 'interior', id: 'cream' });
    expect(result.next.garnish).toBe('metal');
    expect(result.effects).toEqual([]);
  });
});

describe('규칙: 패키지 포함(includes)', () => {
  it('상위 패키지를 담으면 이미 담은 구성 항목은 따로 담지 않고 알려 준다', () => {
    const prev = apply(defaults(), { type: 'add', slot: 'packages', id: 'hud' });
    const result = resolveSelection(prev, { type: 'add', slot: 'packages', id: 'popular' });
    expect(result.status).toBe('needs-confirmation');
    expect(result.next.packages).toEqual(['popular']);
    expect(result.effects).toEqual([
      {
        kind: 'replaced',
        removed: [{ slot: 'package', id: 'hud' }],
        added: [{ slot: 'package', id: 'popular' }],
        by: { slot: 'package', id: 'popular' },
        reason: 'includes',
      },
    ]);
  });

  it('포함된 항목은 체크된 채 잠긴다', () => {
    const selection = apply(defaults(), { type: 'add', slot: 'packages', id: 'popular' });
    expect([...effectivePackages(selection)].sort()).toEqual(['driving-assist', 'hud', 'popular']);
    expect(isIncludedByPackage(selection, 'hud')).toBe('popular');
    expect(isIncludedByPackage(selection, 'popular')).toBeNull();
  });

  it('이미 포함된 항목을 또 담아도 달라지지 않는다', () => {
    const prev = apply(defaults(), { type: 'add', slot: 'packages', id: 'popular' });
    const result = resolveSelection(prev, { type: 'add', slot: 'packages', id: 'hud' });
    expect(result).toEqual({ status: 'applied', next: prev, effects: [] });
  });

  it('포함된 항목을 해제하면 패키지를 풀고 나머지 구성 항목은 개별로 남긴다', () => {
    const prev = apply(defaults(), { type: 'add', slot: 'packages', id: 'popular' });
    const result = resolveSelection(prev, { type: 'remove', slot: 'packages', id: 'hud' });
    expect(result.status).toBe('needs-confirmation');
    expect(result.next.packages).toEqual(['driving-assist']);
    expect(result.effects).toEqual([
      {
        kind: 'replaced',
        removed: [{ slot: 'package', id: 'popular' }],
        added: [{ slot: 'package', id: 'driving-assist' }],
        by: { slot: 'package', id: 'hud' },
        reason: 'ungroup',
      },
    ]);
  });
});

describe('규칙: 대안 제안(suggestWhen)', () => {
  it('구성 항목을 따로 모두 고르면 더 저렴한 패키지를 제안하되 선택은 그대로 적용한다', () => {
    const prev = apply(defaults(), { type: 'add', slot: 'packages', id: 'driving-assist' });
    const result = resolveSelection(prev, { type: 'add', slot: 'packages', id: 'hud' });
    expect(result.status).toBe('applied');
    expect(result.next.packages).toEqual(['driving-assist', 'hud']);
    expect(result.effects).toEqual([
      {
        kind: 'suggestion',
        ruleId: 'popular-bundle',
        message: CATALOG.suggestions[0]!.message,
        intent: { type: 'add', slot: 'packages', id: 'popular' },
        savings: 700_000,
      },
    ]);
  });

  it('제안을 수락하면 패키지로 합쳐진다', () => {
    const prev = apply(
      defaults(),
      { type: 'add', slot: 'packages', id: 'driving-assist' },
      { type: 'add', slot: 'packages', id: 'hud' },
    );
    const result = resolveSelection(prev, { type: 'add', slot: 'packages', id: 'popular' });
    expect(result.next.packages).toEqual(['popular']);
    expect(result.effects[0]).toMatchObject({ kind: 'replaced', reason: 'includes' });
  });

  it('하나만 고른 상태에서는 제안하지 않는다', () => {
    const result = resolveSelection(defaults(), { type: 'add', slot: 'packages', id: 'hud' });
    expect(result.effects).toEqual([]);
  });
});

describe('규칙: 상호 배타(excludes)', () => {
  it('배타 관계의 패키지를 고르면 기존 것을 빼는 교체로 확인을 요구한다', () => {
    const prev = apply(sportGasoline(), { type: 'add', slot: 'packages', id: 'panorama' });
    const result = resolveSelection(prev, { type: 'add', slot: 'packages', id: 'sky-lounge' });
    expect(result.status).toBe('needs-confirmation');
    expect(result.next.packages).toEqual(['sky-lounge']);
    expect(result.effects).toEqual([
      {
        kind: 'replaced',
        removed: [{ slot: 'package', id: 'panorama' }],
        added: [{ slot: 'package', id: 'sky-lounge' }],
        by: { slot: 'package', id: 'sky-lounge' },
        reason: 'excludes',
      },
    ]);
  });

  it('반대 방향으로도 교체된다', () => {
    const prev = apply(sportGasoline(), { type: 'add', slot: 'packages', id: 'sky-lounge' });
    const result = resolveSelection(prev, { type: 'add', slot: 'packages', id: 'panorama' });
    expect(result.next.packages).toEqual(['panorama']);
  });
});

describe('효과 문구', () => {
  it('모든 효과가 한 문장으로 설명된다', () => {
    const results = [
      resolveSelection(defaults(), { type: 'set', slot: 'seat', id: 'four' }),
      resolveSelection(defaults(), { type: 'set', slot: 'color', id: 'bronze' }),
      resolveSelection(apply(defaults(), { type: 'set', slot: 'seat', id: 'four' }), {
        type: 'remove',
        slot: 'packages',
        id: 'comfort-rear',
      }),
      resolveSelection(apply(defaults(), { type: 'add', slot: 'packages', id: 'popular' }), {
        type: 'remove',
        slot: 'packages',
        id: 'hud',
      }),
    ];
    for (const result of results) {
      for (const effect of result.effects) expect(describeEffect(effect).length).toBeGreaterThan(5);
    }
  });
});

describe('normalizeSelection', () => {
  it('모자란 필수 패키지는 채우고 효과로 알린다', () => {
    const broken: Selection = { ...defaults(), seat: 'four' };
    const { selection, effects } = normalizeSelection(broken);
    expect(selection.packages).toEqual(['comfort-rear']);
    expect(kinds({ status: 'applied', next: selection, effects })).toEqual(['auto-added']);
  });

  it('충돌하는 패키지는 카탈로그 순서상 앞선 쪽을 남긴다', () => {
    const broken: Selection = {
      ...defaults(),
      trim: 'sport',
      packages: ['panorama', 'sky-lounge'],
    };
    expect(normalizeSelection(broken).selection.packages).toEqual(['panorama']);
  });

  it('이미 올바른 선택은 그대로 둔다', () => {
    const selection = apply(sportGasoline(), { type: 'add', slot: 'packages', id: 'popular' });
    expect(normalizeSelection(selection)).toEqual({ selection, effects: [] });
  });
});

describe('불변식: 어떤 변경이든 결과는 항상 규칙에 맞는 상태다', () => {
  const allIntents = (): Intent[] => [
    ...SINGLE_SLOTS.flatMap((slot) =>
      CATALOG[slot].map((item) => ({ type: 'set', slot, id: item.id }) as Intent),
    ),
    ...CATALOG.package.flatMap(
      (item) =>
        [
          { type: 'add', slot: 'packages', id: item.id },
          { type: 'remove', slot: 'packages', id: item.id },
        ] as Intent[],
    ),
    ...CATALOG.accessory.flatMap(
      (item) =>
        [
          { type: 'add', slot: 'accessories', id: item.id },
          { type: 'remove', slot: 'accessories', id: item.id },
        ] as Intent[],
    ),
  ];

  /** 기본값에서 의도 두 번까지 따라가 만든 상태들(막힌 변경은 건너뛴다). */
  const reachableStates = (): Selection[] => {
    const seen = new Map<string, Selection>();
    const add = (selection: Selection) => seen.set(JSON.stringify(selection), selection);
    const start = defaults();
    add(start);
    for (const first of allIntents()) {
      const one = resolveSelection(start, first);
      if (one.status === 'blocked') continue;
      add(one.next);
      for (const second of allIntents()) {
        const two = resolveSelection(one.next, second);
        if (two.status !== 'blocked') add(two.next);
      }
    }
    return [...seen.values()];
  };

  it('결과를 다시 정규화해도 달라지지 않는다', () => {
    const states = reachableStates();
    expect(states.length).toBeGreaterThan(100);
    for (const state of states) {
      for (const intent of allIntents()) {
        const result = resolveSelection(state, intent);
        const again = normalizeSelection(result.next);
        expect(again.effects, JSON.stringify({ state, intent })).toEqual([]);
        expect(again.selection).toEqual(result.next);
      }
    }
  });

  it('막힌 변경은 선택을 바꾸지 않는다', () => {
    for (const state of reachableStates()) {
      for (const intent of allIntents()) {
        const result = resolveSelection(state, intent);
        if (result.status === 'blocked') expect(result.next).toBe(state);
      }
    }
  });

  it('확인 없이 적용되는 변경에는 자동 추가·제거·교체가 없다', () => {
    const silent = new Set(['auto-added', 'auto-removed', 'replaced']);
    for (const state of reachableStates()) {
      for (const intent of allIntents()) {
        const result = resolveSelection(state, intent);
        if (result.status === 'applied') {
          expect(result.effects.some((effect) => silent.has(effect.kind))).toBe(false);
        }
      }
    }
  });
});
