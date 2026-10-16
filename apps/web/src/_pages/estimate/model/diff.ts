import { CATALOG } from './catalog';
import { SLOT_LABEL } from './describe';
import { calculateQuote } from './quote';
import { accessoryRef, findItem, packageRef, singleRef } from './selection';
import type { Catalog, QuoteOptions, Selection, Won } from './types';
import { SINGLE_SLOTS } from './types';

export interface DiffRow {
  label: string;
  /** 없으면 새로 추가되는 항목 */
  before?: string;
  /** 없으면 빠지는 항목 */
  after?: string;
}

export interface SelectionDiff {
  rows: readonly DiffRow[];
  /** 소비자가 합계 변동 */
  priceDelta: Won;
}

/** 확인 창에 보일 변경 내용: 슬롯별 이전·이후와 합계 변동. */
export function diffSelections(
  prev: Selection,
  next: Selection,
  quoteOptions: QuoteOptions,
  catalog: Catalog = CATALOG,
): SelectionDiff {
  const rows: DiffRow[] = [];

  for (const slot of SINGLE_SLOTS) {
    if (prev[slot] === next[slot]) continue;
    rows.push({
      label: SLOT_LABEL[slot],
      before: findItem(singleRef(slot, prev[slot]), catalog).label,
      after: findItem(singleRef(slot, next[slot]), catalog).label,
    });
  }
  const packageLabel = (id: Selection['packages'][number]) =>
    findItem(packageRef(id), catalog).label;
  for (const id of prev.packages) {
    if (!next.packages.includes(id))
      rows.push({ label: SLOT_LABEL.package, before: packageLabel(id) });
  }
  for (const id of next.packages) {
    if (!prev.packages.includes(id))
      rows.push({ label: SLOT_LABEL.package, after: packageLabel(id) });
  }
  const accessoryLabel = (id: Selection['accessories'][number]) =>
    findItem(accessoryRef(id), catalog).label;
  for (const id of prev.accessories) {
    if (!next.accessories.includes(id)) {
      rows.push({ label: SLOT_LABEL.accessory, before: accessoryLabel(id) });
    }
  }
  for (const id of next.accessories) {
    if (!prev.accessories.includes(id)) {
      rows.push({ label: SLOT_LABEL.accessory, after: accessoryLabel(id) });
    }
  }

  const priceDelta =
    calculateQuote(next, quoteOptions, catalog).listPrice -
    calculateQuote(prev, quoteOptions, catalog).listPrice;
  return { rows, priceDelta };
}
