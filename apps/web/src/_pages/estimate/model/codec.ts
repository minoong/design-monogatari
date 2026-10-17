import { CATALOG } from './catalog';
import { createDefaultSelection, normalizeSelection } from './resolve';
import { itemsOf, sortByCatalog } from './selection';
import type {
  AccessoryId,
  Catalog,
  Effect,
  EstimateState,
  PackageId,
  QuoteOptions,
  RegionId,
  Selection,
  SingleSlot,
  TaxType,
} from './types';
import { SINGLE_SLOTS } from './types';

/** URL 형식 버전. 코드 체계를 바꾸면 올리고, 이전 버전 링크는 기본값으로 복구한다. */
export const CODEC_VERSION = '1';

/** 캘리퍼가 생기기 전의 위치 코드 슬롯(앞 7개). 이 길이의 링크도 열려야 한다. */
const LEGACY_POSITIONAL_SLOTS = SINGLE_SLOTS.slice(0, -1);

const MULTI_CODE_LENGTH = 2;
const DEFAULT_QUOTE_OPTIONS: QuoteOptions = { taxType: 'taxable', region: 'seoul' };
const TAX_CODES: Record<TaxType, string> = { taxable: 'taxable', exempt: 'exempt' };

export type DecodeIssue =
  | { kind: 'unsupported-version'; version: string }
  | { kind: 'malformed'; field: 'c' | 'p' | 'a'; value: string }
  | {
      kind: 'unknown-code';
      field: SingleSlot | 'package' | 'accessory' | 'region' | 'tax';
      code: string;
    };

export interface DecodeResult {
  state: EstimateState;
  /** 해석하지 못해 기본값으로 되돌린 입력 */
  issues: readonly DecodeIssue[];
  /** 해석은 됐지만 현재 규칙과 맞지 않아 조정한 내용 */
  effects: readonly Effect[];
}

type ParamsSource = URLSearchParams | Record<string, string | readonly string[] | undefined>;

/** 쿼리 문자열, `URLSearchParams`, 또는 Next의 `searchParams` 객체. */
export type SearchParamsInput = string | ParamsSource;

function read(input: ParamsSource, key: string): string | undefined {
  if (input instanceof URLSearchParams) return input.get(key) ?? undefined;
  const value = input[key];
  return Array.isArray(value) ? value[0] : (value as string | undefined);
}

function isEmpty(input: ParamsSource): boolean {
  return input instanceof URLSearchParams
    ? [...input.keys()].length === 0
    : Object.values(input).every((value) => value === undefined);
}

/**
 * 선택 전체를 쿼리 문자열로 만든다. 예: `v=1&c=GCW95KC&p=rcpp&a=fm`
 *
 * - `c`: 파워트레인·트림·외장·휠·시트·내장·가니쉬·브레이크 캘리퍼의 1자 코드를 이 순서로 이어 붙인 8자.
 *   캘리퍼가 생기기 전에 만든 7자 링크도 열린다(`decodeEstimate`가 캘리퍼를 기본값으로 둔다).
 * - `p`, `a`: 패키지·액세서리의 2자 코드를 카탈로그 순서로 이어 붙인다. 비면 생략한다.
 * - `r`, `t`: 지역과 과세 구분. 기본값(서울·과세)이면 생략한다.
 */
export function encodeEstimate(state: EstimateState, catalog: Catalog = CATALOG): string {
  const code = (slot: SingleSlot) => {
    const item = catalog[slot].find((candidate) => candidate.id === state.selection[slot]);
    if (!item) throw new Error(`알 수 없는 항목: ${slot}/${state.selection[slot]}`);
    return item.code;
  };
  const multi = (slot: 'package' | 'accessory', ids: readonly string[]) =>
    sortByCatalog(ids as readonly PackageId[], slot as 'package', catalog)
      .map((id) => itemsOf(catalog, slot).find((item) => item.id === id)!.code)
      .join('');

  const params = new URLSearchParams();
  params.set('v', CODEC_VERSION);
  params.set('c', SINGLE_SLOTS.map(code).join(''));
  const packages = multi('package', state.selection.packages);
  const accessories = multi('accessory', state.selection.accessories);
  if (packages) params.set('p', packages);
  if (accessories) params.set('a', accessories);
  if (state.quoteOptions.region !== DEFAULT_QUOTE_OPTIONS.region) {
    params.set('r', state.quoteOptions.region);
  }
  if (state.quoteOptions.taxType !== DEFAULT_QUOTE_OPTIONS.taxType) {
    params.set('t', TAX_CODES[state.quoteOptions.taxType]);
  }
  return params.toString();
}

function chunk(value: string, size: number): string[] {
  return value.match(new RegExp(`.{1,${size}}`, 'g')) ?? [];
}

/**
 * 쿼리 문자열을 선택으로 복원한다. 잘못된 입력은 던지지 않고 기본값으로 되돌리며 `issues`로 알린다.
 * 해석된 값이 규칙에 어긋나면 규칙에 맞게 고치고 그 내용을 `effects`로 돌려준다.
 */
export function decodeEstimate(
  rawInput: SearchParamsInput,
  catalog: Catalog = CATALOG,
): DecodeResult {
  const input = typeof rawInput === 'string' ? new URLSearchParams(rawInput) : rawInput;
  const issues: DecodeIssue[] = [];
  const defaults = createDefaultSelection(catalog);
  const quoteOptions: QuoteOptions = { ...DEFAULT_QUOTE_OPTIONS };

  // 처음 들어온 방문(쿼리 없음)은 오류가 아니다.
  if (isEmpty(input)) {
    return { state: { selection: defaults, quoteOptions }, issues, effects: [] };
  }

  const version = read(input, 'v');
  if (version !== CODEC_VERSION) {
    issues.push({ kind: 'unsupported-version', version: version ?? '' });
    return { state: { selection: defaults, quoteOptions }, issues, effects: [] };
  }

  const draft: Selection = { ...defaults };
  const positional = read(input, 'c') ?? '';
  // 캘리퍼 슬롯이 추가되기 전의 링크는 마지막 슬롯만 빠진 길이다. 그 슬롯은 기본값으로 둔다.
  const legacyLength = LEGACY_POSITIONAL_SLOTS.length;
  if (positional.length !== SINGLE_SLOTS.length && positional.length !== legacyLength) {
    issues.push({ kind: 'malformed', field: 'c', value: positional });
  } else {
    SINGLE_SLOTS.slice(0, positional.length).forEach((slot, index) => {
      const char = positional[index]!;
      const item = catalog[slot].find((candidate) => candidate.code === char);
      if (item) (draft as unknown as Record<string, string>)[slot] = item.id;
      else issues.push({ kind: 'unknown-code', field: slot, code: char });
    });
  }

  const decodeMulti = <Id extends string>(
    field: 'p' | 'a',
    slot: 'package' | 'accessory',
  ): Id[] => {
    const raw = read(input, field) ?? '';
    if (raw.length % MULTI_CODE_LENGTH !== 0) issues.push({ kind: 'malformed', field, value: raw });
    const ids: Id[] = [];
    for (const code of chunk(raw, MULTI_CODE_LENGTH)) {
      const item = itemsOf(catalog, slot).find((candidate) => candidate.code === code);
      if (item) ids.push(item.id as Id);
      else issues.push({ kind: 'unknown-code', field: slot, code });
    }
    return ids;
  };
  const packages = decodeMulti<PackageId>('p', 'package');
  const accessories = decodeMulti<AccessoryId>('a', 'accessory');

  const region = read(input, 'r');
  if (region !== undefined) {
    if (catalog.regions.some((candidate) => candidate.id === region)) {
      quoteOptions.region = region as RegionId;
    } else issues.push({ kind: 'unknown-code', field: 'region', code: region });
  }
  const tax = read(input, 't');
  if (tax !== undefined) {
    const known = (Object.keys(TAX_CODES) as TaxType[]).find((id) => TAX_CODES[id] === tax);
    if (known) quoteOptions.taxType = known;
    else issues.push({ kind: 'unknown-code', field: 'tax', code: tax });
  }

  const { selection, effects } = normalizeSelection(
    {
      ...draft,
      packages: sortByCatalog(packages, 'package', catalog),
      accessories: sortByCatalog(accessories, 'accessory', catalog),
    },
    catalog,
  );
  return { state: { selection, quoteOptions }, issues, effects };
}
