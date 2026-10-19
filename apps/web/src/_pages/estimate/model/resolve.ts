import { CATALOG } from './catalog';
import {
  accessoryRef,
  effectivePackages,
  findItem,
  getAvailability,
  isIncludedByPackage,
  isSelected,
  itemsOf,
  packageRef,
  selectionEquals,
  singleRef,
  sortByCatalog,
} from './selection';
import type {
  AccessoryId,
  Catalog,
  Effect,
  Intent,
  ItemRef,
  PackageId,
  Resolution,
  Selection,
  SingleSlot,
} from './types';
import { SINGLE_SLOTS } from './types';

/** 규칙 연쇄가 안정될 때까지 되풀이하는 상한. 카탈로그가 순환하면 여기서 멈춘다. */
const MAX_PASSES = 8;

interface Draft extends Omit<Selection, 'packages' | 'accessories'> {
  packages: PackageId[];
  accessories: AccessoryId[];
}

interface Context {
  catalog: Catalog;
  /** 변경 전 선택. 복원·검증처럼 비교 대상이 없으면 null이고, 모든 항목을 "새로 고른 것"으로 본다. */
  prev: Selection | null;
  /** 이번 변경을 일으킨 항목. 효과의 `because`로 쓴다. */
  cause: ItemRef | null;
  effects: Effect[];
}

function toDraft(selection: Selection): Draft {
  return {
    ...selection,
    packages: [...selection.packages],
    accessories: [...selection.accessories],
  };
}

function toSelection(draft: Draft, catalog: Catalog): Selection {
  return {
    ...draft,
    packages: sortByCatalog(draft.packages, 'package', catalog),
    accessories: sortByCatalog(draft.accessories, 'accessory', catalog),
  };
}

function wasSelected(ctx: Context, ref: ItemRef): boolean {
  return ctx.prev !== null && isSelected(ctx.prev, ref, ctx.catalog);
}

function removeFrom<T>(list: T[], value: T) {
  const index = list.indexOf(value);
  if (index >= 0) list.splice(index, 1);
}

/** 슬롯의 대체 값. 카탈로그 순서상 첫 번째로 선택 가능한 항목이고, 가니쉬는 내장의 기본 가니쉬를 우선한다. */
function fallbackFor(slot: SingleSlot, draft: Draft, catalog: Catalog): string {
  const selection = toSelection(draft, catalog);
  if (slot === 'garnish') {
    const preferred = findItem(singleRef('interior', draft.interior), catalog).defaultGarnish;
    if (preferred && getAvailability(selection, singleRef(slot, preferred), catalog).available) {
      return preferred;
    }
  }
  const candidate = itemsOf(catalog, slot).find(
    (item) => getAvailability(selection, singleRef(slot, item.id), catalog).available,
  );
  if (!candidate) throw new Error(`선택 가능한 ${slot} 항목이 없습니다.`);
  return candidate.id;
}

function setSingle(draft: Draft, slot: SingleSlot, id: string) {
  (draft as unknown as Record<string, string>)[slot] = id;
}

function remapSingles(draft: Draft, ctx: Context) {
  for (const slot of SINGLE_SLOTS) {
    const current = draft[slot];

    // 사용자가 따로 고르지 않은 가니쉬(= 이전 내장의 기본값)는 새 내장의 기본값을 따라간다.
    if (slot === 'garnish' && ctx.prev && draft.interior !== ctx.prev.interior) {
      const prevDefault = findItem(
        singleRef('interior', ctx.prev.interior),
        ctx.catalog,
      ).defaultGarnish;
      const nextDefault = findItem(
        singleRef('interior', draft.interior),
        ctx.catalog,
      ).defaultGarnish;
      if (current === prevDefault && nextDefault && current !== nextDefault) {
        draft.garnish = nextDefault as Draft['garnish'];
        ctx.effects.push({
          kind: 'remapped',
          slot,
          from: current,
          to: nextDefault,
          reason: 'derived',
          because: ctx.cause,
        });
        continue;
      }
    }

    const availability = getAvailability(
      toSelection(draft, ctx.catalog),
      singleRef(slot, current),
      ctx.catalog,
    );
    if (availability.available) continue;
    const to = fallbackFor(slot, draft, ctx.catalog);
    setSingle(draft, slot, to);
    ctx.effects.push({
      kind: 'remapped',
      slot,
      from: current,
      to,
      reason: 'unavailable',
      because: ctx.cause,
    });
  }
}

function dropUnavailableMulti(draft: Draft, ctx: Context) {
  const check = (ref: ItemRef, list: string[]) => {
    const selection = toSelection(draft, ctx.catalog);
    if (getAvailability(selection, ref, ctx.catalog).available) return;
    removeFrom(list, ref.id);
    ctx.effects.push({
      kind: 'auto-removed',
      item: ref,
      reason: 'unavailable',
      because: ctx.cause,
    });
  };
  for (const id of [...draft.packages]) check(packageRef(id), draft.packages);
  for (const id of [...draft.accessories]) check(accessoryRef(id), draft.accessories);
}

function resolveExcludes(draft: Draft, ctx: Context) {
  for (const a of [...draft.packages]) {
    for (const b of findItem(packageRef(a), ctx.catalog).excludes ?? []) {
      if (!draft.packages.includes(a) || !draft.packages.includes(b)) continue;
      const aRef = packageRef(a);
      const bRef = packageRef(b);
      const aIsNew = !wasSelected(ctx, aRef);
      const bIsNew = !wasSelected(ctx, bRef);
      const order = itemsOf(ctx.catalog, 'package').map((item) => item.id);
      // 방금 고른 쪽을 남기고, 둘 다 새로 고른 것(복원)이면 카탈로그 순서상 앞선 쪽을 남긴다.
      const keepA = aIsNew !== bIsNew ? aIsNew : order.indexOf(a) < order.indexOf(b);
      const [keep, drop] = keepA ? [a, b] : [b, a];
      removeFrom(draft.packages, drop);
      ctx.effects.push({
        kind: 'replaced',
        removed: [packageRef(drop)],
        added: wasSelected(ctx, packageRef(keep)) ? [] : [packageRef(keep)],
        by: packageRef(keep),
        reason: 'excludes',
      });
    }
  }
}

function absorbIncludes(draft: Draft, ctx: Context) {
  for (const owner of [...draft.packages]) {
    const members = (findItem(packageRef(owner), ctx.catalog).includes ?? []).filter((member) =>
      draft.packages.includes(member),
    );
    if (members.length === 0) continue;
    for (const member of members) removeFrom(draft.packages, member);
    ctx.effects.push({
      kind: 'replaced',
      removed: members.map(packageRef),
      added: wasSelected(ctx, packageRef(owner)) ? [] : [packageRef(owner)],
      by: packageRef(owner),
      reason: 'includes',
    });
  }
}

/** 막아야 하면 그 효과들을, 아니면 null을 돌려준다. */
function enforceRequires(draft: Draft, ctx: Context): Effect[] | null {
  const dependents: ItemRef[] = [
    ...SINGLE_SLOTS.map((slot) => singleRef(slot, draft[slot])),
    ...draft.packages.map(packageRef),
    ...draft.accessories.map(accessoryRef),
  ];

  for (const dependent of dependents) {
    const requirement = findItem(dependent, ctx.catalog).requires;
    if (!requirement) continue;
    const effective = effectivePackages(draft, ctx.catalog);
    const missing = requirement.packages.filter((id) => !effective.has(id));
    if (missing.length === 0) continue;

    if (!wasSelected(ctx, dependent)) {
      const selection = toSelection(draft, ctx.catalog);
      const blocking = missing
        .map((id) => ({
          id,
          availability: getAvailability(selection, packageRef(id), ctx.catalog),
        }))
        .find((entry) => !entry.availability.available);
      if (!blocking) {
        for (const id of missing) {
          draft.packages.push(id);
          ctx.effects.push({ kind: 'auto-added', item: packageRef(id), because: dependent });
        }
        continue;
      }
      if (ctx.prev !== null && !blocking.availability.available) {
        return [
          { kind: 'unavailable-reason', item: dependent, reason: blocking.availability.reason },
        ];
      }
    } else if (requirement.onMissing === 'block') {
      return [{ kind: 'blocked', item: packageRef(missing[0]!), requiredBy: dependent }];
    }

    // 연쇄 해제: 필요한 패키지가 사라졌거나 복원 중 채울 수 없으면 의존하는 쪽을 되돌린다.
    const because = packageRef(missing[0]!);
    if (dependent.slot === 'package') {
      removeFrom(draft.packages, dependent.id);
      ctx.effects.push({
        kind: 'auto-removed',
        item: dependent,
        reason: 'requirement-removed',
        because,
      });
    } else if (dependent.slot === 'accessory') {
      removeFrom(draft.accessories, dependent.id);
      ctx.effects.push({
        kind: 'auto-removed',
        item: dependent,
        reason: 'requirement-removed',
        because,
      });
    } else {
      const to = fallbackFor(dependent.slot, draft, ctx.catalog);
      setSingle(draft, dependent.slot, to);
      ctx.effects.push({
        kind: 'remapped',
        slot: dependent.slot,
        from: dependent.id,
        to,
        reason: 'requirement-removed',
        because,
      });
    }
  }
  return null;
}

function normalize(draft: Draft, ctx: Context): Effect[] | null {
  for (let pass = 0; pass < MAX_PASSES; pass += 1) {
    const before = JSON.stringify(toSelection(draft, ctx.catalog));
    remapSingles(draft, ctx);
    dropUnavailableMulti(draft, ctx);
    resolveExcludes(draft, ctx);
    absorbIncludes(draft, ctx);
    const blocked = enforceRequires(draft, ctx);
    if (blocked) return blocked;
    if (JSON.stringify(toSelection(draft, ctx.catalog)) === before) return null;
  }
  throw new Error('규칙이 수렴하지 않습니다. 카탈로그에 순환하는 규칙이 있는지 확인하십시오.');
}

function findAlternativeTrim(
  selection: Selection,
  ref: ItemRef,
  catalog: Catalog,
): Selection['trim'] | undefined {
  if (ref.slot === 'trim') return undefined;
  return catalog.trim
    .map((trim) => trim.id)
    .find(
      (id) =>
        id !== selection.trim &&
        getAvailability({ ...selection, trim: id }, ref, catalog).available,
    );
}

function intentRef(intent: Intent): ItemRef {
  if (intent.type === 'set') return singleRef(intent.slot, intent.id);
  return intent.slot === 'packages' ? packageRef(intent.id) : accessoryRef(intent.id);
}

/** 이번 변경으로 직접 바뀐 상태를 만든다. 이미 그 상태이면 null. */
function applyIntent(
  prev: Selection,
  intent: Intent,
  ctx: Context,
): { draft: Draft } | { draft: null } {
  const draft = toDraft(prev);
  if (intent.type === 'set') {
    if (prev[intent.slot] === intent.id) return { draft: null };
    setSingle(draft, intent.slot, intent.id);
    return { draft };
  }

  if (intent.slot === 'accessories') {
    const has = prev.accessories.includes(intent.id);
    if (intent.type === 'add' ? has : !has) return { draft: null };
    if (intent.type === 'add') draft.accessories.push(intent.id);
    else removeFrom(draft.accessories, intent.id);
    return { draft };
  }

  const effective = effectivePackages(prev, ctx.catalog);
  if (intent.type === 'add') {
    if (effective.has(intent.id)) return { draft: null };
    draft.packages.push(intent.id);
    return { draft };
  }

  if (!effective.has(intent.id)) return { draft: null };
  if (prev.packages.includes(intent.id)) {
    removeFrom(draft.packages, intent.id);
    return { draft };
  }

  // 포함돼 잠긴 항목을 해제하면 패키지를 풀고, 나머지 구성 항목은 개별 선택으로 남긴다.
  const owner = isIncludedByPackage(prev, intent.id, ctx.catalog);
  if (!owner) return { draft: null };
  removeFrom(draft.packages, owner);
  const kept = (findItem(packageRef(owner), ctx.catalog).includes ?? []).filter(
    (member) => member !== intent.id,
  );
  draft.packages.push(...kept);
  ctx.effects.push({
    kind: 'replaced',
    removed: [packageRef(owner)],
    added: kept.map(packageRef),
    by: intentRef(intent),
    reason: 'ungroup',
  });
  return { draft };
}

function suggestionsFor(
  draft: Draft,
  intent: Intent,
  catalog: Catalog,
): Extract<Effect, { kind: 'suggestion' }>[] {
  if (intent.type !== 'add' || intent.slot !== 'packages') return [];
  const selection = toSelection(draft, catalog);
  const effective = effectivePackages(selection, catalog);
  const price = (id: PackageId) => findItem(packageRef(id), catalog).price;

  return catalog.suggestions.flatMap((rule) => {
    if (!rule.trigger.includes(intent.id)) return [];
    if (!rule.trigger.every((id) => draft.packages.includes(id))) return [];
    if (effective.has(rule.suggest)) return [];
    if (!getAvailability(selection, packageRef(rule.suggest), catalog).available) return [];
    const savings = rule.trigger.reduce((sum, id) => sum + price(id), 0) - price(rule.suggest);
    if (savings <= 0) return [];
    return [
      {
        kind: 'suggestion' as const,
        ruleId: rule.id,
        message: rule.message,
        intent: { type: 'add', slot: 'packages', id: rule.suggest } satisfies Intent,
        savings,
      },
    ];
  });
}

const CONFIRMING_KINDS = new Set<Effect['kind']>(['auto-added', 'auto-removed', 'replaced']);

function needsConfirmation(effects: readonly Effect[]): boolean {
  return effects.some(
    (effect) =>
      CONFIRMING_KINDS.has(effect.kind) ||
      (effect.kind === 'remapped' && effect.reason !== 'derived'),
  );
}

/**
 * 한 번의 사용자 조작(`intent`)을 규칙에 따라 해석한다.
 *
 * - `applied`: 그대로 커밋하고, `effects`는 인라인 안내로 보여 준다.
 * - `needs-confirmation`: 다른 선택이 자동으로 바뀐다. 모달로 `effects`를 보여 주고 확인하면 `next`를 커밋한다.
 * - `blocked`: 바뀌지 않는다(`next === prev`). `effects`가 이유다.
 */
export function resolveSelection(
  prev: Selection,
  intent: Intent,
  catalog: Catalog = CATALOG,
): Resolution {
  const target = intentRef(intent);
  const ctx: Context = {
    catalog,
    prev,
    cause: intent.type === 'remove' ? null : target,
    effects: [],
  };
  const blocked = (effects: Effect[]): Resolution => ({ status: 'blocked', next: prev, effects });

  // 고르려는 항목이 지금 조합에서 불가하면 사유와 함께 막는다.
  if (intent.type !== 'remove') {
    const availability = getAvailability(prev, target, catalog);
    if (!availability.available) {
      return blocked([
        {
          kind: 'unavailable-reason',
          item: target,
          reason: availability.reason,
          alternativeTrim: findAlternativeTrim(prev, target, catalog),
        },
      ]);
    }
  }

  const { draft } = applyIntent(prev, intent, ctx);
  if (!draft) return { status: 'applied', next: prev, effects: [] };

  const blockedBy = normalize(draft, ctx);
  if (blockedBy) return blocked(blockedBy);

  const next = toSelection(draft, catalog);
  const effects = [...ctx.effects, ...suggestionsFor(draft, intent, catalog)];
  if (selectionEquals(next, prev) && effects.length === 0) {
    return { status: 'applied', next: prev, effects: [] };
  }
  return {
    status: needsConfirmation(effects) ? 'needs-confirmation' : 'applied',
    next,
    effects,
  };
}

/** 모든 슬롯의 첫 항목에서 시작한 기본 선택. */
export function createDefaultSelection(catalog: Catalog = CATALOG): Selection {
  const first = (slot: SingleSlot) => catalog[slot][0]!.id;
  const draft = {
    powertrain: first('powertrain'),
    trim: first('trim'),
    color: first('color'),
    wheel: first('wheel'),
    seat: first('seat'),
    interior: first('interior'),
    garnish: first('garnish'),
    caliper: first('caliper'),
    rimFinish: first('rimFinish'),
    packages: [],
    accessories: [],
  } as Selection;
  return normalizeSelection(draft, catalog).selection;
}

/**
 * 규칙에 맞지 않는 선택(URL 복원 등)을 맞는 상태로 고친다.
 * 비교 대상이 없으므로 모든 항목을 새로 고른 것으로 보고, 모자란 패키지는 채우고 충돌은 정리한다.
 */
export function normalizeSelection(
  selection: Selection,
  catalog: Catalog = CATALOG,
): { selection: Selection; effects: readonly Effect[] } {
  const ctx: Context = { catalog, prev: null, cause: null, effects: [] };
  const draft = toDraft(selection);
  normalize(draft, ctx);
  return { selection: toSelection(draft, catalog), effects: ctx.effects };
}
