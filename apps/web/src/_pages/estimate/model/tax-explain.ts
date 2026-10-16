import { CATALOG } from './catalog';
import { calculateQuote, supplyValueOf } from './quote';
import type { Catalog, QuoteOptions, RegionId, Selection, Won } from './types';

export interface TaxStep {
  label: string;
  /** 어떻게 계산했는지 한 줄 */
  formula: string;
  amount: Won;
}

/**
 * 견적 결과에서 세금이 어떻게 나왔는지 단계별로 풀어 쓴다. 금액은 `calculateQuote`와 같은 함수로 구하므로 결과 표와 어긋나지 않는다.
 * 세금 공식은 포트폴리오용으로 단순화한 가상 규칙이다.
 */
export function explainTax(
  selection: Selection,
  options: QuoteOptions,
  catalog: Catalog = CATALOG,
): TaxStep[] {
  const quote = calculateQuote(selection, options, catalog);
  const supply = supplyValueOf(quote.listPrice, catalog);
  const divisor = (100 + catalog.tax.vatPercent) / 100;

  return [
    {
      label: '소비자가 합계',
      formula: '기본 가격과 선택한 항목을 더한 금액입니다. 부가세가 들어 있습니다.',
      amount: quote.listPrice,
    },
    {
      label: '공급가액',
      formula: `소비자가 ÷ ${divisor}, 원 미만 버림`,
      amount: supply,
    },
    {
      label: '부가세',
      formula: `소비자가 − 공급가액 (${catalog.tax.vatPercent}%)`,
      amount: quote.listPrice - supply,
    },
    {
      label: '차량 가격',
      formula:
        options.taxType === 'exempt'
          ? '면세: 소비자가에서 부가세를 뺀 금액입니다.'
          : '과세: 소비자가 그대로입니다.',
      amount: quote.vehiclePrice,
    },
    {
      label: '취득세',
      formula: `공급가액 × ${catalog.tax.acquisitionPercent}%, 원 미만 버림 (과세와 면세가 같습니다)`,
      amount: quote.acquisitionTax,
    },
  ];
}

export interface FeeRow {
  region: RegionId;
  label: string;
  delivery: Won;
  /** 증지대와 번호판과 대행 수수료. 지역과 상관없이 같다. */
  fixed: Won;
  total: Won;
}

/** 지역별 탁송료와 공통 비용 표. */
export function feeRows(catalog: Catalog = CATALOG): FeeRow[] {
  const fixed = catalog.fees.stampDuty + catalog.fees.plate + catalog.fees.agency;
  return catalog.regions.map((region) => ({
    region: region.id,
    label: region.label,
    delivery: region.delivery,
    fixed,
    total: region.delivery + fixed,
  }));
}
