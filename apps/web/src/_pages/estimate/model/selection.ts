import { CATALOG } from './catalog';
import type {
  AccessoryId,
  Catalog,
  CatalogItem,
  Condition,
  ItemRef,
  PackageId,
  Selection,
  SingleSlot,
} from './types';
import { SINGLE_SLOTS } from './types';

export type Availability = { available: true } | { available: false; reason: string };

const DEFAULT_UNAVAILABLE_REASON = '현재 사양 조합에서는 선택할 수 없어요.';

export function itemsOf(catalog: Catalog, slot: ItemRef['slot']): readonly CatalogItem<string>[] {
  return catalog[slot];
}

export function findItem(ref: ItemRef, catalog: Catalog = CATALOG): CatalogItem<string> {
  const item = itemsOf(catalog, ref.slot).find((candidate) => candidate.id === ref.id);
  if (!item) throw new Error(`알 수 없는 항목: ${ref.slot}/${ref.id}`);
  return item;
}

export function singleRef(slot: SingleSlot, id: string): ItemRef {
  return { slot, id } as ItemRef;
}

export function packageRef(id: PackageId): ItemRef {
  return { slot: 'package', id };
}

export function accessoryRef(id: AccessoryId): ItemRef {
  return { slot: 'accessory', id };
}

/** 직접 고른 패키지와, 그 패키지가 포함하는 패키지를 합친 집합. */
export function effectivePackages(
  selection: Pick<Selection, 'packages'>,
  catalog: Catalog = CATALOG,
): Set<PackageId> {
  const result = new Set<PackageId>();
  const visit = (id: PackageId) => {
    if (result.has(id)) return;
    result.add(id);
    const item = findItem(packageRef(id), catalog);
    for (const included of item.includes ?? []) visit(included);
  };
  for (const id of selection.packages) visit(id);
  return result;
}

/** 다른 패키지에 포함돼 잠긴 패키지인지. 직접 고른 것은 잠기지 않는다. */
export function isIncludedByPackage(
  selection: Pick<Selection, 'packages'>,
  id: PackageId,
  catalog: Catalog = CATALOG,
): PackageId | null {
  if (selection.packages.includes(id)) return null;
  for (const owner of selection.packages) {
    if (effectivePackages({ packages: [owner] }, catalog).has(id)) return owner;
  }
  return null;
}

export function isSelected(
  selection: Selection,
  ref: ItemRef,
  catalog: Catalog = CATALOG,
): boolean {
  if (ref.slot === 'package') return effectivePackages(selection, catalog).has(ref.id);
  if (ref.slot === 'accessory') return selection.accessories.includes(ref.id);
  return selection[ref.slot] === ref.id;
}

function matches(condition: Condition, selection: Selection): boolean {
  return (Object.keys(condition) as (keyof Condition)[]).every((key) => {
    const accepted = condition[key] as readonly string[] | undefined;
    return accepted === undefined || accepted.includes(selection[key]);
  });
}

export function getAvailability(
  selection: Selection,
  ref: ItemRef,
  catalog: Catalog = CATALOG,
): Availability {
  const item = findItem(ref, catalog);
  if (!item.availableWhen || matches(item.availableWhen, selection)) return { available: true };
  return { available: false, reason: item.unavailableReason ?? DEFAULT_UNAVAILABLE_REASON };
}

export function sortByCatalog<Id extends string>(
  ids: readonly Id[],
  slot: 'package' | 'accessory',
  catalog: Catalog = CATALOG,
): Id[] {
  const order = itemsOf(catalog, slot).map((item) => item.id as string);
  return [...new Set(ids)].sort((a, b) => order.indexOf(a) - order.indexOf(b));
}

export function selectionEquals(a: Selection, b: Selection): boolean {
  return (
    SINGLE_SLOTS.every((slot) => a[slot] === b[slot]) &&
    a.packages.join() === b.packages.join() &&
    a.accessories.join() === b.accessories.join()
  );
}
