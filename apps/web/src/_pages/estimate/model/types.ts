/** 원 단위 정수. 소수·문자열 계산은 하지 않는다. */
export type Won = number;

export type PowertrainId = 'gasoline' | 'phev';
export type TrimId = 'comfort' | 'sport';
export type ColorId =
  'white' | 'black' | 'gray' | 'blue' | 'green' | 'pearl' | 'bronze' | 'matte-gray';
export type WheelId = 'w19' | 'w20' | 'w21';
export type SeatId = 'five' | 'four';
export type InteriorId = 'black' | 'cream' | 'brown';
export type GarnishId = 'carbon' | 'wood' | 'metal';
export type CaliperId = 'standard' | 'blue' | 'red' | 'black' | 'yellow' | 'gold';
export type RimFinishId = 'standard' | 'silver' | 'gray' | 'bronze';
export type PackageId =
  'comfort-rear' | 'driving-assist' | 'hud' | 'popular' | 'panorama' | 'sky-lounge';
export type AccessoryId = 'floor-mat' | 'dashcam' | 'tow-hitch';
export type RegionId = 'seoul' | 'gyeonggi' | 'busan' | 'jeju';
export type TaxType = 'taxable' | 'exempt';

export const SINGLE_SLOTS = [
  'powertrain',
  'trim',
  'color',
  'wheel',
  'seat',
  'interior',
  'garnish',
  // 코드는 가장 뒤에 붙인다(이전 7자리 링크가 그대로 열리도록 codec.ts가 길이 7을 받아 준다).
  'caliper',
  // 가장 뒤에 붙인다. 이전 길이의 링크는 codec.ts가 받아 주고 빠진 슬롯은 기본값으로 둔다.
  'rimFinish',
] as const;
export type SingleSlot = (typeof SINGLE_SLOTS)[number];

export interface Selection {
  powertrain: PowertrainId;
  trim: TrimId;
  color: ColorId;
  wheel: WheelId;
  seat: SeatId;
  interior: InteriorId;
  garnish: GarnishId;
  caliper: CaliperId;
  rimFinish: RimFinishId;
  /** 사용자가 직접 고른 패키지. 다른 패키지에 포함된 항목은 여기 넣지 않는다. */
  packages: readonly PackageId[];
  accessories: readonly AccessoryId[];
}

export type ItemRef =
  | { [S in SingleSlot]: { slot: S; id: Selection[S] } }[SingleSlot]
  | { slot: 'package'; id: PackageId }
  | { slot: 'accessory'; id: AccessoryId };

export type Intent =
  | { [S in SingleSlot]: { type: 'set'; slot: S; id: Selection[S] } }[SingleSlot]
  | { type: 'add' | 'remove'; slot: 'packages'; id: PackageId }
  | { type: 'add' | 'remove'; slot: 'accessories'; id: AccessoryId };

/** 다른 슬롯의 값으로 가용성을 선언한다. 키끼리는 AND, 각 키의 값들은 OR. */
export interface Condition {
  powertrain?: readonly PowertrainId[];
  trim?: readonly TrimId[];
  color?: readonly ColorId[];
  wheel?: readonly WheelId[];
  interior?: readonly InteriorId[];
}

export interface CatalogItem<Id extends string> {
  id: Id;
  /** URL 코드. 같은 슬롯 안에서 유일하다. 단일 선택은 1자, 패키지·액세서리는 2자. */
  code: string;
  label: string;
  description?: string;
  price: Won;
  /** 색상 묶음 제목(글로시/메탈릭/무광) 같은 표시용 그룹. */
  group?: string;
  availableWhen?: Condition;
  /** `availableWhen`이 있으면 필수. 비활성 사유를 UI가 그대로 보여 준다. */
  unavailableReason?: string;
  /** 이 항목을 고르려면 필요한 패키지. */
  requires?: { packages: readonly PackageId[]; onMissing: 'block' | 'cascade' };
  /** 함께 고를 수 없는 패키지. */
  excludes?: readonly PackageId[];
  /** 이 패키지에 포함된 패키지. */
  includes?: readonly PackageId[];
  /** 내장 색의 기본 가니쉬. */
  defaultGarnish?: GarnishId;
}

export interface SuggestionRule {
  id: string;
  /** 모두 직접 선택돼 있으면 발동한다. */
  trigger: readonly PackageId[];
  suggest: PackageId;
  message: string;
}

export interface RegionInfo {
  id: RegionId;
  label: string;
  /** 탁송료 */
  delivery: Won;
}

export interface Catalog {
  modelName: string;
  basePrice: Won;
  powertrain: readonly CatalogItem<PowertrainId>[];
  trim: readonly CatalogItem<TrimId>[];
  color: readonly CatalogItem<ColorId>[];
  wheel: readonly CatalogItem<WheelId>[];
  seat: readonly CatalogItem<SeatId>[];
  interior: readonly CatalogItem<InteriorId>[];
  garnish: readonly CatalogItem<GarnishId>[];
  caliper: readonly CatalogItem<CaliperId>[];
  rimFinish: readonly CatalogItem<RimFinishId>[];
  package: readonly CatalogItem<PackageId>[];
  accessory: readonly CatalogItem<AccessoryId>[];
  suggestions: readonly SuggestionRule[];
  regions: readonly RegionInfo[];
  fees: { stampDuty: Won; plate: Won; agency: Won };
  tax: {
    /** 차량 가격에 포함된 부가세율(%) */
    vatPercent: number;
    /** 공급가액에 붙는 취득세율(%) */
    acquisitionPercent: number;
  };
}

export type Effect =
  | { kind: 'auto-added'; item: ItemRef; because: ItemRef }
  | {
      kind: 'auto-removed';
      item: ItemRef;
      reason: 'unavailable' | 'requirement-removed';
      because: ItemRef | null;
    }
  | {
      kind: 'replaced';
      removed: readonly ItemRef[];
      added: readonly ItemRef[];
      by: ItemRef;
      reason: 'excludes' | 'includes' | 'ungroup';
    }
  | {
      kind: 'remapped';
      slot: SingleSlot;
      from: string;
      to: string;
      /** `derived`는 사용자가 따로 고르지 않은 값이 따라 바뀐 것이라 확인이 필요 없다. */
      reason: 'unavailable' | 'derived' | 'requirement-removed';
      because: ItemRef | null;
    }
  /** 다른 선택이 필요로 하는 항목을 해제하려 해서 막았다. */
  | { kind: 'blocked'; item: ItemRef; requiredBy: ItemRef }
  /** 현재 사양 조합에서는 고를 수 없다. */
  | { kind: 'unavailable-reason'; item: ItemRef; reason: string; alternativeTrim?: TrimId }
  | { kind: 'suggestion'; ruleId: string; message: string; intent: Intent; savings: Won };

export type ResolutionStatus = 'applied' | 'needs-confirmation' | 'blocked';

export interface Resolution {
  status: ResolutionStatus;
  /** `blocked`이면 `prev`와 같다. `needs-confirmation`이면 확인 시 커밋할 값이다. */
  next: Selection;
  effects: readonly Effect[];
}

export interface QuoteOptions {
  taxType: TaxType;
  region: RegionId;
}

export interface EstimateState {
  selection: Selection;
  quoteOptions: QuoteOptions;
}
