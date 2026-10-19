import { RIM_FINISH_SWATCHES } from '@repo/vehicle-3d/rim-finishes';
import { describe, expect, it } from 'vitest';

import { CATALOG } from './catalog';
import { rimFinishSwatchOf } from './rim-map';

describe('rim-map', () => {
  it('카탈로그의 모든 휠 마감이 3D 림 마감과 짝지어져 있다', () => {
    for (const item of CATALOG.rimFinish) {
      expect(rimFinishSwatchOf(item.id).id).toBe(item.id);
    }
  });

  it('3D 림 마감 중 카탈로그에 없는 것이 없다', () => {
    const ids = CATALOG.rimFinish.map((item) => item.id);
    for (const swatch of RIM_FINISH_SWATCHES) {
      expect(ids).toContain(swatch.id);
    }
  });

  it('기본은 모델 원래 림이라 따로 칠하지 않는다', () => {
    expect(rimFinishSwatchOf('standard').surface).toBeNull();
  });
});
