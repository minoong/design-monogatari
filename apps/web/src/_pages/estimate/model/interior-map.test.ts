import { INTERIOR_SWATCHES } from '@repo/vehicle-3d/interiors';
import { describe, expect, it } from 'vitest';

import { CATALOG } from './catalog';
import { interiorSwatchOf } from './interior-map';

describe('interior-map', () => {
  it('카탈로그의 모든 내장 색이 3D 실내 색과 짝지어져 있다', () => {
    for (const item of CATALOG.interior) {
      expect(interiorSwatchOf(item.id).id).toBe(item.id);
    }
  });

  it('3D 실내 색 중 카탈로그에 없는 것이 없다', () => {
    const ids = CATALOG.interior.map((item) => item.id);
    for (const swatch of INTERIOR_SWATCHES) {
      expect(ids).toContain(swatch.id);
    }
  });

  it('검정은 시트를 칠하지 않는다(모델 원래 검정)', () => {
    const { surfaces } = interiorSwatchOf('black');
    expect(surfaces && 'seat' in surfaces).toBe(false);
  });
});
