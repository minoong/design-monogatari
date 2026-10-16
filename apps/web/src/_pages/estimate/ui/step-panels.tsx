'use client';

import { ColorSwatchGroup } from '@repo/ui/color-swatch-group';
import { CopyButton } from '@repo/ui/copy-button';
import { Label } from '@repo/ui/label';
import { NativeSelect } from '@repo/ui/native-select';
import { OptionGroup, OptionRow } from '@repo/ui/option-row';
import { PackageRow } from '@repo/ui/package-row';
import { PriceBreakdown, PriceRow } from '@repo/ui/price-bar';
import { type Dispatch, useId } from 'react';

import { CATALOG } from '../model/catalog';
import { formatWon } from '../model/format';
import { paintOf } from '../model/paint-map';
import type { Quote } from '../model/quote';
import {
  effectivePackages,
  findItem,
  getAvailability,
  isIncludedByPackage,
  packageRef,
  singleRef,
} from '../model/selection';
import type {
  AccessoryId,
  CatalogItem,
  ColorId,
  PackageId,
  RegionId,
  Selection,
  SingleSlot,
  TaxType,
} from '../model/types';
import type { WizardAction, WizardState } from '../model/wizard';

interface PanelProps {
  state: WizardState;
  dispatch: Dispatch<WizardAction>;
}

/** 옵션 가격을 한 줄로: 0원은 "기본 포함", 그 밖에는 부호를 붙인다. */
export function priceLabel(price: number) {
  return price === 0 ? '기본 포함' : `+${formatWon(price)}`;
}

function setIntent(slot: SingleSlot, id: string) {
  return { type: 'intent', intent: { type: 'set', slot, id } } as WizardAction;
}

/** 한 슬롯의 후보를 라디오 행으로 보인다. 고를 수 없는 항목은 사유를 행 안에 항상 보이고, 눌러 보면 이유를 알려 준다. */
function SlotOptions({
  slot,
  legend,
  state,
  dispatch,
}: PanelProps & { slot: SingleSlot; legend: string }) {
  const items = CATALOG[slot] as readonly CatalogItem<string>[];
  return (
    <OptionGroup legend={legend}>
      {items.map((item) => {
        const availability = getAvailability(state.selection, singleRef(slot, item.id));
        return (
          <OptionRow
            key={item.id}
            name={slot}
            value={item.id}
            checked={state.selection[slot] === item.id}
            label={item.label}
            description={item.description}
            price={priceLabel(item.price)}
            unavailableReason={availability.available ? undefined : availability.reason}
            onChange={() => {
              dispatch(setIntent(slot, item.id));
            }}
          />
        );
      })}
    </OptionGroup>
  );
}

export function ModelStep(props: PanelProps) {
  return (
    <div className="flex flex-col gap-8">
      <SlotOptions {...props} slot="powertrain" legend="파워트레인" />
      <SlotOptions {...props} slot="trim" legend="트림" />
    </div>
  );
}

export function ExteriorStep({ state, dispatch }: PanelProps) {
  return (
    <ColorSwatchGroup
      legend="외장 색상"
      name="color"
      value={state.selection.color}
      onValueChange={(value) => {
        dispatch(setIntent('color', value));
      }}
      options={CATALOG.color.map((item) => {
        const availability = getAvailability(state.selection, singleRef('color', item.id));
        return {
          value: item.id,
          label: item.label,
          color: paintOf(item.id as ColorId).hex,
          group: item.group,
          price: priceLabel(item.price),
          unavailableReason: availability.available ? undefined : availability.reason,
        };
      })}
    />
  );
}

export function WheelStep(props: PanelProps) {
  return <SlotOptions {...props} slot="wheel" legend="휠" />;
}

export function SeatStep(props: PanelProps) {
  return <SlotOptions {...props} slot="seat" legend="시트" />;
}

export function InteriorStep(props: PanelProps) {
  return (
    <div className="flex flex-col gap-8">
      <SlotOptions {...props} slot="interior" legend="내장 색상" />
      <SlotOptions {...props} slot="garnish" legend="가니쉬" />
    </div>
  );
}

function ownedItems(selection: Selection) {
  return effectivePackages(selection);
}

export function OptionsStep({ state, dispatch }: PanelProps) {
  const owned = ownedItems(state.selection);
  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
      <legend className="text-foreground mb-3 p-0 font-sans text-sm font-semibold">
        선택 품목
      </legend>
      {CATALOG.package.map((item) => {
        const owner = isIncludedByPackage(state.selection, item.id);
        const checked = owned.has(item.id);
        const includes = (item.includes ?? []).map((id) => findItem(packageRef(id)).label);
        const availability = getAvailability(state.selection, packageRef(item.id));
        return (
          <PackageRow
            key={item.id}
            checked={checked}
            label={item.label}
            description={availability.available ? item.description : availability.reason}
            price={owner ? '포함' : priceLabel(item.price)}
            includedIn={owner ? `${findItem(packageRef(owner)).label}에 포함` : undefined}
            items={includes.length > 0 ? includes : undefined}
            onChange={() => {
              dispatch({
                type: 'intent',
                intent: {
                  type: checked ? 'remove' : 'add',
                  slot: 'packages',
                  id: item.id as PackageId,
                },
              });
            }}
          />
        );
      })}
    </fieldset>
  );
}

export function AccessoriesStep({ state, dispatch }: PanelProps) {
  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
      <legend className="text-foreground mb-3 p-0 font-sans text-sm font-semibold">액세서리</legend>
      {CATALOG.accessory.map((item) => {
        const checked = state.selection.accessories.includes(item.id);
        return (
          <PackageRow
            key={item.id}
            checked={checked}
            label={item.label}
            description={item.description}
            price={priceLabel(item.price)}
            onChange={() => {
              dispatch({
                type: 'intent',
                intent: {
                  type: checked ? 'remove' : 'add',
                  slot: 'accessories',
                  id: item.id as AccessoryId,
                },
              });
            }}
          />
        );
      })}
    </fieldset>
  );
}

const TAX_OPTIONS: { value: TaxType; label: string; description: string }[] = [
  { value: 'taxable', label: '과세', description: '차량 가격에 부가세가 포함됩니다.' },
  {
    value: 'exempt',
    label: '면세',
    description: '부가세를 뺀 가격으로 계산합니다. 취득세는 같은 기준으로 붙습니다.',
  },
];

export function ResultStep({
  state,
  dispatch,
  quote,
  shareUrl,
}: PanelProps & { quote: Quote; shareUrl: string }) {
  const regionId = useId();
  return (
    <div className="flex flex-col gap-8">
      <OptionGroup legend="과세 구분">
        {TAX_OPTIONS.map((option) => (
          <OptionRow
            key={option.value}
            name="tax"
            value={option.value}
            checked={state.quoteOptions.taxType === option.value}
            label={option.label}
            description={option.description}
            onChange={() => {
              dispatch({ type: 'quote-options', options: { taxType: option.value } });
            }}
          />
        ))}
      </OptionGroup>

      <div className="flex flex-col gap-2">
        <Label htmlFor={regionId}>등록 지역</Label>
        <NativeSelect
          id={regionId}
          value={state.quoteOptions.region}
          onChange={(event) => {
            dispatch({
              type: 'quote-options',
              options: { region: event.target.value as RegionId },
            });
          }}
        >
          {CATALOG.regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.label} (탁송료 {formatWon(region.delivery)})
            </option>
          ))}
        </NativeSelect>
      </div>

      <PriceBreakdown title="견적 합계">
        <PriceRow label="소비자가 합계" amount={quote.listPrice} />
        {quote.vatExemption > 0 ? (
          <PriceRow label="면세로 빠지는 부가세" amount={-quote.vatExemption} signed />
        ) : null}
        <PriceRow label="차량 가격" amount={quote.vehiclePrice} />
        <PriceRow label="취득세" amount={quote.acquisitionTax} signed />
        <PriceRow label="탁송료" amount={quote.fees.delivery} signed />
        <PriceRow
          label="증지대·번호판·대행 수수료"
          amount={quote.fees.stampDuty + quote.fees.plate + quote.fees.agency}
          signed
        />
        <PriceRow label="예상 총 비용" amount={quote.total} total />
      </PriceBreakdown>

      <CopyButton value={shareUrl} label="견적 링크 복사" />
    </div>
  );
}
