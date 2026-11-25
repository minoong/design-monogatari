'use client';

import { ColorSwatchGroup } from '@repo/ui/color-swatch-group';
import { Notice, NoticeDescription, NoticeTitle } from '@repo/ui/notice';
import { OptionGroup, OptionRow } from '@repo/ui/option-row';
import { PriceBreakdown, PriceRow } from '@repo/ui/price-bar';
import { useRef } from 'react';

import {
  CATALOG,
  type CatalogItem,
  type ColorId,
  formatWon,
  getAvailability,
  paintSwatchOf,
  type Quote,
  type Selection,
  singleRef,
} from '@/_pages/estimate/index.model';

import type { IntroSlot } from '../model/intro-selection';
import Counter from './react-bits/Counter';

/** 옵션 가격을 한 줄로: 0원은 "기본 포함", 그 밖에는 부호를 붙인다. */
function priceText(price: number) {
  return price === 0 ? '기본 포함' : `+${formatWon(price)}`;
}

/** 방금 한 선택이 가져온 결과. 막혔으면 이유, 함께 바뀐 항목이 있으면 그 문장들이다. */
export interface IntroNotice {
  blocked: boolean;
  lines: readonly string[];
}

/** 구역마다 자기 알림을 따로 갖는다. 다른 구역을 고른다고 이전 구역의 알림이 사라져 그 아래 구역이 밀리지 않게 하려는 것이다. */
export type IntroNotices = Partial<Record<IntroSlot, IntroNotice>>;

/**
 * 선택 결과를 알리는 자리. 알림 영역(`role="status"`)은 처음부터 있어야 스크린 리더가 내용이 생길 때 읽는다.
 * 선택지 아래에 두어서, 알림이 나타나도 위의 선택지는 밀리지 않는다.
 */
export function IntroNoticeSlot({ notice }: { notice: IntroNotice | undefined }) {
  return (
    <div role="status">
      {notice && notice.lines.length > 0 ? (
        <Notice role="note">
          <NoticeTitle>{notice.blocked ? '선택할 수 없습니다' : '함께 바뀐 항목'}</NoticeTitle>
          {notice.lines.map((line) => (
            <NoticeDescription key={line}>{line}</NoticeDescription>
          ))}
        </Notice>
      ) : null}
    </div>
  );
}

/**
 * 방향키로 라디오 사이를 지나는 것도 브라우저는 선택(change)으로 알린다. 고를 수 없는 항목을 지날 때마다 안내가 뜨지 않게,
 * 방향키로 생긴 변경 중 고를 수 없는 것은 무시한다. 눌러서(포인터) 고른 것은 그대로 안내한다.
 */
function useArrowNavigation() {
  const arrow = useRef(false);
  return {
    /** 방향키 입력을 기록한다. */
    onKeyDown: (key: string) => {
      arrow.current = key.startsWith('Arrow');
    },
    /** 포인터로 누르면 방향키 기록을 지운다(방향키 뒤에 change가 오지 않았을 때 남은 값이 마우스 선택을 막지 않게). */
    onPointer: () => {
      arrow.current = false;
    },
    /** 이번 변경이 방향키로 생긴 것인지 읽고 기록을 지운다. */
    take: () => {
      const byArrow = arrow.current;
      arrow.current = false;
      return byArrow;
    },
  };
}

/** 한 자리의 후보를 라디오 행으로 보인다. 고를 수 없는 항목은 이유를 행 안에 보이고, 눌러 보면 결과를 알린다. */
export function IntroChoiceGroup({
  slot,
  legend,
  selection,
  onChoose,
}: {
  slot: IntroSlot;
  legend: string;
  selection: Selection;
  onChoose: (slot: IntroSlot, id: string) => void;
}) {
  const items = CATALOG[slot] as readonly CatalogItem<string>[];
  const navigation = useArrowNavigation();

  return (
    <OptionGroup legend={legend}>
      {items.map((item) => {
        const availability = getAvailability(selection, singleRef(slot, item.id));
        return (
          <OptionRow
            key={item.id}
            name={`intro-${slot}`}
            value={item.id}
            checked={selection[slot] === item.id}
            label={item.label}
            description={item.description}
            price={priceText(item.price)}
            unavailableReason={availability.available ? undefined : availability.reason}
            onKeyDown={(event) => navigation.onKeyDown(event.key)}
            onPointerDown={navigation.onPointer}
            onChange={() => {
              if (navigation.take() && !availability.available) return;
              onChoose(slot, item.id);
            }}
          />
        );
      })}
    </OptionGroup>
  );
}

export function IntroColorGroup({
  selection,
  onChoose,
}: {
  selection: Selection;
  onChoose: (slot: IntroSlot, id: string) => void;
}) {
  const navigation = useArrowNavigation();

  return (
    // `ColorSwatchGroup`은 키 입력을 밖으로 내보내지 않으므로, 캡처 단계에서 방향키와 포인터 입력을 기록한다.
    <div
      onKeyDownCapture={(event) => navigation.onKeyDown(event.key)}
      onPointerDownCapture={navigation.onPointer}
    >
      <ColorSwatchGroup
        legend="외장 색상"
        name="intro-color"
        value={selection.color}
        onValueChange={(value) => {
          const available = getAvailability(selection, singleRef('color', value)).available;
          if (navigation.take() && !available) return;
          onChoose('color', value);
        }}
        unavailableHint="사선이 그어진 색은 트림을 바꾸면 선택할 수 있습니다."
        options={CATALOG.color.map((item) => {
          const availability = getAvailability(selection, singleRef('color', item.id));
          return {
            value: item.id,
            label: item.label,
            color: paintSwatchOf(item.id as ColorId).hex,
            group: item.group,
            price: priceText(item.price),
            unavailableReason: availability.available ? undefined : availability.reason,
          };
        })}
      />
    </div>
  );
}

/** 선택 내역과 취득세·부대비용을 더한 총액. 견적 화면의 요약과 같은 계산 결과를 보여 준다. */
export function IntroPrice({ quote }: { quote: Quote }) {
  return (
    <>
      {/* 큰 금액은 화면용이다. 같은 금액은 아래 내역의 마지막 줄과 `IntroApp`의 상태 영역이 읽어 준다. */}
      <div aria-hidden className="text-6xl font-semibold tracking-tight">
        <Counter value={quote.total} prefix="₩" locale="ko-KR" fontSize="1em" fontWeight={600} />
      </div>
      <PriceBreakdown title="선택 내역">
        {quote.lines.map((line) => {
          const isBase = line.item.slot === 'base';
          return (
            <PriceRow
              key={`${line.item.slot}-${line.item.id}`}
              label={line.label}
              amount={line.amount === 0 ? '기본 포함' : line.amount}
              signed={!isBase}
            />
          );
        })}
        <PriceRow label="소비자가 합계" amount={quote.listPrice} />
        <PriceRow label="취득세" amount={quote.acquisitionTax} signed />
        <PriceRow label="부대비용" amount={quote.feesTotal} signed />
        <PriceRow label="총 예상 금액" amount={quote.total} total />
      </PriceBreakdown>
    </>
  );
}

/** 지금 고른 사양을 한 줄로. 차량 칸의 이름과 요약에서 같이 쓴다. */
export function describeChoice(selection: Selection) {
  const label = (slot: IntroSlot) =>
    (CATALOG[slot] as readonly CatalogItem<string>[]).find((item) => item.id === selection[slot])
      ?.label ?? '';
  return [label('trim'), label('color'), label('wheel'), `${label('interior')} 내장`].join(' · ');
}
