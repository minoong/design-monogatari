import { CATALOG } from './catalog';
import { findItem, packageRef, singleRef } from './selection';
import type { Catalog, ItemRef, QuoteOptions, Selection, Won } from './types';
import { SINGLE_SLOTS } from './types';

export interface QuoteLine {
  item: ItemRef | { slot: 'base'; id: 'base' };
  label: string;
  amount: Won;
}

export interface Quote {
  /** 항목별 금액. 0원 항목도 포함하므로 표시할 때 걸러 쓴다. */
  lines: readonly QuoteLine[];
  /** 부가세가 포함된 소비자가 합계 */
  listPrice: Won;
  /** 면세일 때 빠지는 부가세. 과세면 0 */
  vatExemption: Won;
  /** 실제로 내는 차량 가격 */
  vehiclePrice: Won;
  acquisitionTax: Won;
  fees: { delivery: Won; stampDuty: Won; plate: Won; agency: Won };
  feesTotal: Won;
  total: Won;
}

/** 모든 세금 계산의 반올림은 여기 한 곳이다: 원 미만 버림. */
function percentOf(amount: Won, percent: number): Won {
  return Math.floor((amount * percent) / 100);
}

/**
 * 견적 금액을 계산한다.
 *
 * 세금 공식은 **포트폴리오용으로 단순화한 가상 규칙**이며 실제 세법과 다르다.
 * - 소비자가에는 부가세가 포함돼 있다. 공급가액 = 소비자가 ÷ (1 + 부가세율), 원 미만 버림.
 * - 면세이면 부가세(소비자가 − 공급가액)를 뺀다.
 * - 취득세 = 공급가액 × 취득세율(과세·면세 모두 동일), 원 미만 버림.
 * - 부대비용 = 지역별 탁송료 + 증지대 + 번호판 + 대행 수수료.
 */
export function calculateQuote(
  selection: Selection,
  options: QuoteOptions,
  catalog: Catalog = CATALOG,
): Quote {
  const lines: QuoteLine[] = [
    { item: { slot: 'base', id: 'base' }, label: catalog.modelName, amount: catalog.basePrice },
  ];

  for (const slot of SINGLE_SLOTS) {
    const ref = singleRef(slot, selection[slot]);
    const item = findItem(ref, catalog);
    lines.push({ item: ref, label: item.label, amount: item.price });
  }
  // 직접 고른 패키지만 가격에 들어간다. 다른 패키지에 포함된 항목은 이미 그 가격에 담겨 있다.
  for (const id of selection.packages) {
    const item = findItem(packageRef(id), catalog);
    lines.push({ item: packageRef(id), label: item.label, amount: item.price });
  }
  for (const id of selection.accessories) {
    const ref: ItemRef = { slot: 'accessory', id };
    const item = findItem(ref, catalog);
    lines.push({ item: ref, label: item.label, amount: item.price });
  }

  const listPrice = lines.reduce((sum, line) => sum + line.amount, 0);
  const supplyValue = Math.floor((listPrice * 100) / (100 + catalog.tax.vatPercent));
  const vatExemption = options.taxType === 'exempt' ? listPrice - supplyValue : 0;
  const vehiclePrice = listPrice - vatExemption;
  const acquisitionTax = percentOf(supplyValue, catalog.tax.acquisitionPercent);

  const region = catalog.regions.find((candidate) => candidate.id === options.region);
  if (!region) throw new Error(`알 수 없는 지역: ${options.region}`);
  const fees = { delivery: region.delivery, ...catalog.fees };
  const feesTotal = fees.delivery + fees.stampDuty + fees.plate + fees.agency;

  return {
    lines,
    listPrice,
    vatExemption,
    vehiclePrice,
    acquisitionTax,
    fees,
    feesTotal,
    total: vehiclePrice + acquisitionTax + feesTotal,
  };
}
