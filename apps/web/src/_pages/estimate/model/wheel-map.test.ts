import { describe, expect, it } from 'vitest';

import { CATALOG } from './catalog';
import { WHEEL_INCH } from './wheel-map';

describe('wheel-map', () => {
  it('카탈로그의 모든 휠이 인치와 짝지어져 있고 라벨의 인치와 같다', () => {
    for (const wheel of CATALOG.wheel) {
      expect(WHEEL_INCH[wheel.id]).toBeDefined();
      expect(wheel.label.startsWith(`${WHEEL_INCH[wheel.id]}인치`)).toBe(true);
    }
  });
});
