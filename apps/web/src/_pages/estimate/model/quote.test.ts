import { describe, expect, it } from 'vitest';

import { CATALOG } from './catalog';
import { formatWon } from './format';
import { apply, defaults } from './helpers.test-util';
import { calculateQuote } from './quote';

const seoulTaxable = { taxType: 'taxable', region: 'seoul' } as const;

describe('calculateQuote', () => {
  it('기본 선택은 기본가와 같다', () => {
    const quote = calculateQuote(defaults(), seoulTaxable);
    expect(quote.listPrice).toBe(CATALOG.basePrice);
    expect(quote.vehiclePrice).toBe(90_000_000);
  });

  it('선택한 항목 금액을 모두 더한다', () => {
    const selection = apply(
      defaults(),
      { type: 'set', slot: 'powertrain', id: 'phev' }, // +14,000,000
      { type: 'set', slot: 'trim', id: 'sport' }, // +8,500,000
      { type: 'set', slot: 'color', id: 'matte-gray' }, // +8,000,000
      { type: 'add', slot: 'accessories', id: 'dashcam' }, // +400,000
    );
    expect(calculateQuote(selection, seoulTaxable).listPrice).toBe(
      90_000_000 + 14_000_000 + 8_500_000 + 8_000_000 + 400_000,
    );
  });

  it('패키지에 포함된 항목은 따로 더하지 않는다', () => {
    const separate = apply(
      defaults(),
      { type: 'add', slot: 'packages', id: 'driving-assist' },
      { type: 'add', slot: 'packages', id: 'hud' },
    );
    const bundled = apply(defaults(), { type: 'add', slot: 'packages', id: 'popular' });
    expect(calculateQuote(separate, seoulTaxable).listPrice - CATALOG.basePrice).toBe(4_300_000);
    expect(calculateQuote(bundled, seoulTaxable).listPrice - CATALOG.basePrice).toBe(3_600_000);
  });

  it('과세: 취득세는 공급가액의 7%를 원 미만 버림한다', () => {
    const quote = calculateQuote(defaults(), seoulTaxable);
    // 90,000,000 ÷ 1.1 = 81,818,181.8… → 81,818,181, × 7% = 5,727,272.67 → 5,727,272
    expect(quote.vatExemption).toBe(0);
    expect(quote.acquisitionTax).toBe(5_727_272);
  });

  it('면세: 부가세만 빠지고 취득세는 그대로다', () => {
    const quote = calculateQuote(defaults(), { taxType: 'exempt', region: 'seoul' });
    expect(quote.vatExemption).toBe(90_000_000 - 81_818_181);
    expect(quote.vehiclePrice).toBe(81_818_181);
    expect(quote.acquisitionTax).toBe(5_727_272);
  });

  it('부대비용은 지역 탁송료와 고정 비용의 합이다', () => {
    const jeju = calculateQuote(defaults(), { taxType: 'taxable', region: 'jeju' });
    expect(jeju.fees).toEqual({
      delivery: 900_000,
      stampDuty: 3_000,
      plate: 12_000,
      agency: 150_000,
    });
    expect(jeju.feesTotal).toBe(1_065_000);
  });

  it('총액 = 차량 가격 + 취득세 + 부대비용, 모두 정수', () => {
    const quote = calculateQuote(
      apply(defaults(), { type: 'add', slot: 'packages', id: 'panorama' }),
      { taxType: 'exempt', region: 'busan' },
    );
    expect(quote.total).toBe(quote.vehiclePrice + quote.acquisitionTax + quote.feesTotal);
    for (const value of [quote.listPrice, quote.vehiclePrice, quote.acquisitionTax, quote.total]) {
      expect(Number.isInteger(value)).toBe(true);
    }
  });
});

describe('formatWon', () => {
  it('천 단위 쉼표를 넣는다', () => {
    expect(formatWon(0)).toBe('0원');
    expect(formatWon(1_500_000)).toBe('1,500,000원');
    expect(formatWon(-700_000)).toBe('-700,000원');
  });

  it('정수가 아니면 던진다', () => {
    expect(() => formatWon(1.5)).toThrow();
  });
});
