import { describe, expect, it } from 'vitest';

import { CATALOG } from './catalog';
import { COLOR_PAINT, paintSwatchOf } from './paint-map';

describe('paint-map', () => {
  it('카탈로그의 모든 외장 색이 도장과 짝지어져 있다', () => {
    for (const color of CATALOG.color) {
      expect(COLOR_PAINT[color.id]).toBeDefined();
      expect(paintSwatchOf(color.id).hex).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it('서로 다른 색은 서로 다른 도장을 쓴다', () => {
    const paints = new Set(CATALOG.color.map((color) => COLOR_PAINT[color.id]));
    expect(paints.size).toBe(CATALOG.color.length);
  });
});
