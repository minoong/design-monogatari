import { describe, expect, it } from 'vitest';

import { CATALOG } from './catalog';
import { defaults } from './helpers.test-util';
import { calculateQuote } from './quote';
import { explainTax, feeRows } from './tax-explain';

const taxable = { taxType: 'taxable', region: 'seoul' } as const;
const exempt = { taxType: 'exempt', region: 'seoul' } as const;

const amountOf = (steps: ReturnType<typeof explainTax>, label: string) =>
  steps.find((step) => step.label === label)!.amount;

describe('explainTax', () => {
  it('공급가액과 부가세를 더하면 소비자가가 되고, 결과 표와 같은 금액을 쓴다', () => {
    const steps = explainTax(defaults(), taxable);
    const quote = calculateQuote(defaults(), taxable);
    expect(amountOf(steps, '공급가액') + amountOf(steps, '부가세')).toBe(quote.listPrice);
    expect(amountOf(steps, '소비자가 합계')).toBe(quote.listPrice);
    expect(amountOf(steps, '차량 가격')).toBe(quote.vehiclePrice);
    expect(amountOf(steps, '취득세')).toBe(quote.acquisitionTax);
  });

  it('면세는 차량 가격이 공급가액과 같고 취득세는 그대로다', () => {
    const steps = explainTax(defaults(), exempt);
    expect(amountOf(steps, '차량 가격')).toBe(amountOf(steps, '공급가액'));
    expect(amountOf(steps, '취득세')).toBe(amountOf(explainTax(defaults(), taxable), '취득세'));
  });

  it('계산식 문장에 카탈로그의 세율이 들어간다', () => {
    const steps = explainTax(defaults(), taxable);
    expect(steps.find((step) => step.label === '취득세')!.formula).toContain(
      `${CATALOG.tax.acquisitionPercent}%`,
    );
  });
});

describe('feeRows', () => {
  it('지역마다 탁송료와 공통 비용을 더한 합계를 낸다', () => {
    const rows = feeRows();
    expect(rows.map((row) => row.region)).toEqual(CATALOG.regions.map((region) => region.id));
    for (const row of rows) {
      expect(row.total).toBe(row.delivery + row.fixed);
      const quote = calculateQuote(defaults(), { taxType: 'taxable', region: row.region });
      expect(quote.feesTotal).toBe(row.total);
    }
  });
});
