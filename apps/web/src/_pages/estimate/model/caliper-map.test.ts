import { CALIPER_SWATCHES } from '@repo/vehicle-3d/calipers';
import { describe, expect, it } from 'vitest';

import { caliperSwatchOf } from './caliper-map';
import { CATALOG } from './catalog';

describe('caliper-map', () => {
  it('카탈로그의 모든 캘리퍼가 3D 캘리퍼 색과 짝지어져 있다', () => {
    for (const item of CATALOG.caliper) {
      expect(caliperSwatchOf(item.id).id).toBe(item.id);
    }
  });

  it('3D 캘리퍼 색 중 카탈로그에 없는 것이 없다', () => {
    const ids = CATALOG.caliper.map((item) => item.id);
    for (const swatch of CALIPER_SWATCHES) {
      expect(ids).toContain(swatch.id);
    }
  });

  it('기본도 칠한다(모델 원래 캘리퍼는 거의 검정이라 칩의 회색과 달라 보인다)', () => {
    expect(caliperSwatchOf('standard').surface?.color).toBe(caliperSwatchOf('standard').hex);
  });
});
