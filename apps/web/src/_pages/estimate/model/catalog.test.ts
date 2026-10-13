import { describe, expect, it } from 'vitest';

import { CATALOG } from './catalog';
import { createDefaultSelection } from './resolve';
import { getAvailability, singleRef } from './selection';
import { SINGLE_SLOTS } from './types';

describe('카탈로그 무결성', () => {
  const slots = [...SINGLE_SLOTS, 'package', 'accessory'] as const;

  it('금액은 모두 0 이상의 정수다', () => {
    expect(Number.isInteger(CATALOG.basePrice)).toBe(true);
    for (const slot of slots) {
      for (const item of CATALOG[slot]) {
        expect(Number.isInteger(item.price) && item.price >= 0, `${slot}/${item.id}`).toBe(true);
      }
    }
  });

  it('URL 코드는 슬롯 안에서 유일하다', () => {
    for (const slot of slots) {
      const codes = CATALOG[slot].map((item) => item.code);
      expect(new Set(codes).size, slot).toBe(codes.length);
    }
  });

  it('코드 길이: 단일 선택 1자, 패키지·액세서리 2자', () => {
    for (const slot of SINGLE_SLOTS) {
      for (const item of CATALOG[slot]) expect(item.code).toHaveLength(1);
    }
    for (const slot of ['package', 'accessory'] as const) {
      for (const item of CATALOG[slot]) expect(item.code).toHaveLength(2);
    }
  });

  it('가용 조건이 있으면 비활성 사유도 있다', () => {
    for (const slot of slots) {
      for (const item of CATALOG[slot]) {
        if (item.availableWhen) expect(item.unavailableReason, `${slot}/${item.id}`).toBeTruthy();
      }
    }
  });

  it('규칙이 가리키는 패키지·가니쉬는 모두 존재한다', () => {
    const packageIds = new Set(CATALOG.package.map((item) => item.id));
    const garnishIds = new Set(CATALOG.garnish.map((item) => item.id));
    for (const slot of slots) {
      for (const item of CATALOG[slot]) {
        for (const id of [
          ...(item.requires?.packages ?? []),
          ...(item.excludes ?? []),
          ...(item.includes ?? []),
        ]) {
          expect(packageIds.has(id), `${slot}/${item.id} → ${id}`).toBe(true);
        }
        if (item.defaultGarnish) expect(garnishIds.has(item.defaultGarnish)).toBe(true);
      }
    }
    for (const rule of CATALOG.suggestions) {
      for (const id of [...rule.trigger, rule.suggest]) expect(packageIds.has(id)).toBe(true);
    }
  });

  it('내장마다 선택 가능한 기본 가니쉬가 있다', () => {
    for (const interior of CATALOG.interior) {
      const selection = { ...createDefaultSelection(), interior: interior.id };
      expect(interior.defaultGarnish).toBeDefined();
      const availability = getAvailability(
        selection,
        singleRef('garnish', interior.defaultGarnish!),
      );
      expect(availability.available, interior.id).toBe(true);
    }
  });

  it('각 슬롯의 첫 항목은 기본 선택에서 항상 선택 가능하다', () => {
    const selection = createDefaultSelection();
    for (const slot of SINGLE_SLOTS) {
      expect(selection[slot]).toBe(CATALOG[slot][0]!.id);
    }
    expect(selection.packages).toEqual([]);
    expect(selection.accessories).toEqual([]);
  });
});
