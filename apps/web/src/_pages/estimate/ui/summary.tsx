'use client';

import { PriceBreakdown, PriceRow } from '@repo/ui/price-bar';
import type { Dispatch } from 'react';

import type { Quote } from '../model/quote';
import { stepOf } from '../model/steps';
import type { WizardAction } from '../model/wizard';

/** 지금까지 고른 항목과 금액. 항목마다 그 단계로 돌아가는 "변경" 버튼이 있다. */
export function SummaryList({
  quote,
  dispatch,
  onNavigate,
  readOnly = false,
}: {
  quote: Quote;
  dispatch: Dispatch<WizardAction>;
  /** 단계로 이동한 뒤 호출한다 (시트를 닫는 데 쓴다). */
  onNavigate?: () => void;
  /** 인쇄용: "변경" 버튼을 그리지 않는다. */
  readOnly?: boolean;
}) {
  return (
    <PriceBreakdown title="선택 내역">
      {quote.lines.map((line) => {
        const isBase = line.item.slot === 'base';
        return (
          <PriceRow
            key={`${line.item.slot}-${line.item.id}`}
            label={line.label}
            amount={line.amount === 0 ? '기본 포함' : line.amount}
            signed={!isBase}
            action={
              isBase || readOnly ? undefined : (
                <button
                  type="button"
                  aria-label={`${line.label} 변경`}
                  className="text-foreground focus-visible:ring-ring text-caption rounded-sm underline underline-offset-2 focus-visible:ring-2 focus-visible:outline-none"
                  onClick={() => {
                    if (line.item.slot !== 'base') {
                      dispatch({ type: 'go', step: stepOf(line.item.slot) });
                      onNavigate?.();
                    }
                  }}
                >
                  변경
                </button>
              )
            }
          />
        );
      })}
      <PriceRow label="소비자가 합계" amount={quote.listPrice} total />
    </PriceBreakdown>
  );
}
