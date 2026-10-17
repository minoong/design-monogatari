import { describe, expect, it } from 'vitest';

import { CATALOG } from './catalog';
import { CODEC_VERSION, decodeEstimate, encodeEstimate } from './codec';
import { apply, defaults } from './helpers.test-util';
import { resolveSelection } from './resolve';
import type { EstimateState, Intent, QuoteOptions } from './types';
import { SINGLE_SLOTS } from './types';

const state = (
  selection = defaults(),
  quoteOptions: QuoteOptions = { taxType: 'taxable', region: 'seoul' },
): EstimateState => ({ selection, quoteOptions });

describe('encodeEstimate', () => {
  it('기본 선택은 버전과 8자 위치 코드만 가진다', () => {
    expect(encodeEstimate(state())).toBe(`v=${CODEC_VERSION}&c=GCW95KCS`);
  });

  it('패키지·액세서리는 2자 코드를 카탈로그 순서로 잇는다', () => {
    const selection = apply(
      defaults(),
      { type: 'add', slot: 'accessories', id: 'dashcam' },
      { type: 'add', slot: 'packages', id: 'popular' },
      { type: 'add', slot: 'accessories', id: 'floor-mat' },
    );
    expect(encodeEstimate(state(selection))).toBe(`v=1&c=GCW95KCS&p=pp&a=fmdc`);
  });

  it('기본값이 아닌 지역·과세 구분만 담는다', () => {
    const encoded = encodeEstimate(state(defaults(), { taxType: 'exempt', region: 'jeju' }));
    expect(encoded).toBe('v=1&c=GCW95KCS&r=jeju&t=exempt');
  });

  it('같은 선택은 항상 같은 문자열이다', () => {
    const a = apply(
      defaults(),
      { type: 'add', slot: 'packages', id: 'hud' },
      { type: 'add', slot: 'packages', id: 'panorama' },
    );
    const b = apply(
      defaults(),
      { type: 'add', slot: 'packages', id: 'panorama' },
      { type: 'add', slot: 'packages', id: 'hud' },
    );
    expect(encodeEstimate(state(a))).toBe(encodeEstimate(state(b)));
  });
});

describe('왕복: decode(encode(x))는 x와 같다', () => {
  const allIntents = (): Intent[] => [
    ...SINGLE_SLOTS.flatMap((slot) =>
      CATALOG[slot].map((item) => ({ type: 'set', slot, id: item.id }) as Intent),
    ),
    ...CATALOG.package.map((item) => ({ type: 'add', slot: 'packages', id: item.id }) as Intent),
    ...CATALOG.accessory.map(
      (item) => ({ type: 'add', slot: 'accessories', id: item.id }) as Intent,
    ),
  ];

  it('의도 두 번까지 도달 가능한 모든 상태', () => {
    let count = 0;
    for (const first of allIntents()) {
      const one = resolveSelection(defaults(), first);
      if (one.status === 'blocked') continue;
      for (const second of allIntents()) {
        const two = resolveSelection(one.next, second);
        if (two.status === 'blocked') continue;
        const original = state(two.next);
        const decoded = decodeEstimate(encodeEstimate(original));
        expect(decoded.state).toEqual(original);
        expect(decoded.issues).toEqual([]);
        expect(decoded.effects).toEqual([]);
        count += 1;
      }
    }
    expect(count).toBeGreaterThan(500);
  });

  it('지역·과세 구분도 왕복한다', () => {
    for (const region of CATALOG.regions) {
      for (const taxType of ['taxable', 'exempt'] as const) {
        const original = state(defaults(), { taxType, region: region.id });
        expect(decodeEstimate(encodeEstimate(original)).state).toEqual(original);
      }
    }
  });

  it('URLSearchParams와 Next의 searchParams 객체를 모두 받는다', () => {
    const original = state(
      apply(
        defaults(),
        { type: 'set', slot: 'trim', id: 'sport' },
        { type: 'add', slot: 'packages', id: 'popular' },
      ),
      { taxType: 'exempt', region: 'busan' },
    );
    const query = encodeEstimate(original);
    expect(decodeEstimate(new URLSearchParams(query)).state).toEqual(original);
    expect(decodeEstimate(Object.fromEntries(new URLSearchParams(query))).state).toEqual(original);
  });
});

describe('잘못된 입력은 던지지 않고 기본값으로 복구하며 알린다', () => {
  it('쿼리가 없으면 기본 선택이고 오류가 아니다', () => {
    const result = decodeEstimate(new URLSearchParams());
    expect(result.state.selection).toEqual(defaults());
    expect(result.issues).toEqual([]);
  });

  it('지원하지 않는 버전은 통째로 기본값이다', () => {
    const result = decodeEstimate(new URLSearchParams('v=9&c=PSBN4CM'));
    expect(result.state.selection).toEqual(defaults());
    expect(result.issues).toEqual([{ kind: 'unsupported-version', version: '9' }]);
  });

  it('버전이 없는 쿼리도 지원하지 않는 것으로 본다', () => {
    const result = decodeEstimate(new URLSearchParams('c=GCW95KC'));
    expect(result.issues).toEqual([{ kind: 'unsupported-version', version: '' }]);
  });

  it('위치 코드 길이가 틀리면 기본값이다', () => {
    const result = decodeEstimate(new URLSearchParams('v=1&c=GC'));
    expect(result.state.selection).toEqual(defaults());
    expect(result.issues).toEqual([{ kind: 'malformed', field: 'c', value: 'GC' }]);
  });

  it('알 수 없는 위치 코드는 그 슬롯만 기본값이고 나머지는 살린다', () => {
    const result = decodeEstimate(new URLSearchParams('v=1&c=PSZ95KC'));
    expect(result.issues).toEqual([{ kind: 'unknown-code', field: 'color', code: 'Z' }]);
    expect(result.state.selection).toMatchObject({
      powertrain: 'phev',
      trim: 'sport',
      color: 'white',
    });
  });

  it('알 수 없는 패키지 코드와 홀수 길이를 보고한다', () => {
    const result = decodeEstimate(new URLSearchParams('v=1&c=GCW95KC&p=ppzz&a=fmx'));
    expect(result.state.selection.packages).toEqual(['popular']);
    expect(result.state.selection.accessories).toEqual(['floor-mat']);
    expect(result.issues).toEqual([
      { kind: 'unknown-code', field: 'package', code: 'zz' },
      { kind: 'malformed', field: 'a', value: 'fmx' },
      { kind: 'unknown-code', field: 'accessory', code: 'x' },
    ]);
  });

  it('알 수 없는 지역·과세 구분은 기본값이다', () => {
    const result = decodeEstimate(new URLSearchParams('v=1&c=GCW95KC&r=mars&t=free'));
    expect(result.state.quoteOptions).toEqual({ taxType: 'taxable', region: 'seoul' });
    expect(result.issues).toEqual([
      { kind: 'unknown-code', field: 'region', code: 'mars' },
      { kind: 'unknown-code', field: 'tax', code: 'free' },
    ]);
  });

  it('중복된 코드는 한 번만 담는다', () => {
    const result = decodeEstimate(new URLSearchParams('v=1&c=GCW95KC&a=fmfm'));
    expect(result.state.selection.accessories).toEqual(['floor-mat']);
  });

  it('해석은 되지만 규칙에 어긋나는 링크는 고쳐서 열고 효과로 알린다', () => {
    // 컴포트 트림에는 없는 브론즈 + 컴포트 패키지 없는 4인승
    const result = decodeEstimate(new URLSearchParams('v=1&c=GCR94KC'));
    expect(result.issues).toEqual([]);
    expect(result.state.selection).toMatchObject({
      trim: 'comfort',
      color: 'white',
      seat: 'four',
      packages: ['comfort-rear'],
    });
    expect(result.effects.map((effect) => effect.kind).sort()).toEqual(['auto-added', 'remapped']);
  });

  it('고친 결과는 다시 왕복해도 같다', () => {
    const first = decodeEstimate(new URLSearchParams('v=1&c=GCR94KC&p=slsr'));
    const second = decodeEstimate(encodeEstimate(first.state));
    expect(second.state).toEqual(first.state);
    expect(second.effects).toEqual([]);
  });
});

describe('캘리퍼가 생기기 전의 7자 링크', () => {
  it('열리고, 캘리퍼는 기본값으로 둔다', () => {
    const result = decodeEstimate('v=1&c=GCW95KC&p=pp&a=fm');
    expect(result.issues).toEqual([]);
    expect(result.state.selection.caliper).toBe('standard');
    expect(result.state.selection.packages).toEqual(['popular']);
  });

  it('길이가 7도 8도 아니면 잘못된 입력으로 알린다', () => {
    const result = decodeEstimate('v=1&c=GCW95K');
    expect(result.issues).toContainEqual({ kind: 'malformed', field: 'c', value: 'GCW95K' });
  });

  it('캘리퍼를 고른 선택은 8번째 글자에 담긴다', () => {
    const selection = apply(
      defaults(),
      { type: 'set', slot: 'trim', id: 'sport' },
      { type: 'set', slot: 'caliper', id: 'red' },
    );
    const encoded = encodeEstimate(state(selection));
    expect(encoded).toBe('v=1&c=GSW95KCR');
    expect(decodeEstimate(encoded).state.selection.caliper).toBe('red');
  });

  it('컴포트 트림에서는 쓸 수 없는 캘리퍼 코드를 기본값으로 고치고 알린다', () => {
    const result = decodeEstimate('v=1&c=GCW95KCR');
    expect(result.state.selection.caliper).toBe('standard');
    expect(result.effects.some((effect) => effect.kind === 'remapped')).toBe(true);
  });
});
