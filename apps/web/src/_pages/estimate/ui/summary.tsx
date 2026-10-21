'use client';

import { Button } from '@repo/ui/button';
import { PriceBreakdown, PriceRow } from '@repo/ui/price-bar';
import { type Dispatch, useId } from 'react';

import { describeEffect } from '../model/describe';
import type { Quote } from '../model/quote';
import { stepOf } from '../model/steps';
import type { Effect } from '../model/types';
import type { WizardAction } from '../model/wizard';

/** 지금까지 고른 항목과 금액. 항목마다 그 단계로 돌아가는 "변경" 버튼이 있다. */
export function SummaryList({
  quote,
  autoChanges = [],
  dispatch,
  onNavigate,
  readOnly = false,
}: {
  quote: Quote;
  /** 마지막 선택에서 자동으로 바뀐 항목. 차량 위의 안내는 사라지므로 여기서 다시 볼 수 있다. */
  autoChanges?: readonly Effect[];
  dispatch: Dispatch<WizardAction>;
  /** 단계로 이동한 뒤 호출한다 (시트를 닫는 데 쓴다). */
  onNavigate?: () => void;
  /** 인쇄용: "변경" 버튼을 그리지 않는다. */
  readOnly?: boolean;
}) {
  const autoChangesId = useId();
  return (
    <>
      {autoChanges.length > 0 && !readOnly ? (
        <section aria-labelledby={autoChangesId} className="mb-4">
          <h3 id={autoChangesId} className="text-sm font-semibold">
            자동으로 바뀐 항목
          </h3>
          <ul className="text-muted-foreground text-caption mt-1 flex list-disc flex-col gap-1 pl-5">
            {autoChanges.map((effect, index) => (
              <li key={index}>{describeEffect(effect)}</li>
            ))}
          </ul>
        </section>
      ) : null}
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
                  <Button
                    aria-label={`${line.label} 변경`}
                    className="-my-1.5 underline underline-offset-2"
                    radius="md"
                    size="small"
                    variant="clear"
                    onClick={() => {
                      if (line.item.slot !== 'base') {
                        dispatch({ type: 'go', step: stepOf(line.item.slot) });
                        onNavigate?.();
                      }
                    }}
                  >
                    변경
                  </Button>
                )
              }
            />
          );
        })}
        <PriceRow label="소비자가 합계" amount={quote.listPrice} total />
      </PriceBreakdown>
    </>
  );
}
