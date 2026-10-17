import { describe, expect, it } from 'vitest';

import { CATALOG } from './catalog';
import { apply, defaults } from './helpers.test-util';
import { hasSunroof, SUNROOF_PACKAGES } from './roof-map';

describe('roof-map', () => {
  it('선루프 품목은 모두 카탈로그에 있다', () => {
    const ids = CATALOG.package.map((item) => item.id);
    for (const id of SUNROOF_PACKAGES) {
      expect(ids).toContain(id);
    }
  });

  it('기본 선택에는 선루프가 없다', () => {
    expect(hasSunroof(defaults().packages)).toBe(false);
  });

  it('파노라마 선루프를 담으면 선루프가 있다', () => {
    const selection = apply(defaults(), { type: 'add', slot: 'packages', id: 'panorama' });
    expect(hasSunroof(selection.packages)).toBe(true);
  });

  it('스카이 라운지 루프는 스포트 트림에서 담으면 선루프가 있다', () => {
    const selection = apply(
      defaults(),
      { type: 'set', slot: 'trim', id: 'sport' },
      { type: 'add', slot: 'packages', id: 'sky-lounge' },
    );
    expect(hasSunroof(selection.packages)).toBe(true);
  });

  it('선루프 품목을 빼면 다시 없다', () => {
    const selection = apply(
      defaults(),
      { type: 'add', slot: 'packages', id: 'panorama' },
      { type: 'remove', slot: 'packages', id: 'panorama' },
    );
    expect(hasSunroof(selection.packages)).toBe(false);
  });

  it('다른 품목만 담으면 선루프가 없다', () => {
    const selection = apply(defaults(), { type: 'add', slot: 'packages', id: 'hud' });
    expect(hasSunroof(selection.packages)).toBe(false);
  });
});
