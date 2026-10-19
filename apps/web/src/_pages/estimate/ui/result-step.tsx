'use client';

import { Button } from '@repo/ui/button';
import { CopyButton } from '@repo/ui/copy-button';
import { DataTable, type DataTableColumn } from '@repo/ui/data-table';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/dialog';
import { PrinterIcon } from '@repo/ui/icons/printer';
import { RotateCCWIcon } from '@repo/ui/icons/rotate-ccw';
import { XIcon } from '@repo/ui/icons/x';
import { Label } from '@repo/ui/label';
import { NativeSelect } from '@repo/ui/native-select';
import { Notice, NoticeDescription, NoticeTitle } from '@repo/ui/notice';
import { OptionGroup, OptionRow } from '@repo/ui/option-row';
import { PriceBreakdown, PriceRow } from '@repo/ui/price-bar';
import { useToast } from '@repo/ui/toast';
import { type Dispatch, useId, useRef, useState } from 'react';

import { CATALOG } from '../model/catalog';
import { formatWon } from '../model/format';
import type { Quote } from '../model/quote';
import { explainTax, type FeeRow, feeRows } from '../model/tax-explain';
import type { RegionId, TaxType } from '../model/types';
import type { WizardAction, WizardState } from '../model/wizard';
import { SummaryList } from './summary';

const TAX_OPTIONS: { value: TaxType; label: string; description: string }[] = [
  { value: 'taxable', label: '과세', description: '차량 가격에 부가세가 포함됩니다.' },
  {
    value: 'exempt',
    label: '면세',
    description: '부가세를 뺀 가격으로 계산합니다. 취득세는 같은 기준으로 붙습니다.',
  },
];

function signedWon(amount: number) {
  return `${amount < 0 ? '−' : ''}${formatWon(Math.abs(amount))}`;
}

const DISCLAIMER =
  '이 견적은 비공식 포트폴리오용입니다. BMW와 무관하며 차종, 가격, 사양, 세율은 모두 가상의 값입니다. 세금 계산식은 실제 세법과 다르게 단순화했고, 차량 이미지는 참고용이어서 실제와 다를 수 있습니다.';

/** 견적 결과: 합계, 세금 계산 설명, 지역별 비용 표, 선택 내역, 링크 복사, 인쇄. 인쇄하면 조작 부분은 빠지고 견적서만 나온다. */
export function ResultStep({
  state,
  dispatch,
  quote,
  shareUrl,
}: {
  state: WizardState;
  dispatch: Dispatch<WizardAction>;
  quote: Quote;
  shareUrl: string;
}) {
  const regionId = useId();
  const { toast } = useToast();
  const [resetOpen, setResetOpen] = useState(false);
  const resetButtonRef = useRef<HTMLButtonElement>(null);
  const steps = explainTax(state.selection, state.quoteOptions);
  const selectedRegion = state.quoteOptions.region;

  const feeColumns: readonly DataTableColumn<FeeRow>[] = [
    {
      key: 'label',
      header: '등록 지역',
      rowHeader: true,
      cell: (row) => (row.region === selectedRegion ? `${row.label} (선택)` : row.label),
    },
    { key: 'delivery', header: '탁송료', numeric: true, cell: (row) => formatWon(row.delivery) },
    { key: 'fixed', header: '공통 비용', numeric: true, cell: (row) => formatWon(row.fixed) },
    { key: 'total', header: '합계', numeric: true, cell: (row) => formatWon(row.total) },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* 인쇄할 때만 보이는 견적서 머리말 */}
      <div className="hidden print:block">
        <h2 className="text-title font-semibold">X5 견적서 (비공식)</h2>
        <p className="text-caption mt-1 break-all">{shareUrl}</p>
      </div>

      <div className="flex flex-col gap-8 print:hidden">
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
            value={selectedRegion}
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

      <section aria-labelledby="tax-title" className="flex flex-col gap-3">
        <h3 id="tax-title" className="text-sm font-semibold">
          세금은 이렇게 계산했습니다
        </h3>
        <ol className="flex list-none flex-col gap-3 p-0">
          {steps.map((step) => (
            <li
              key={step.label}
              className="border-border flex items-baseline justify-between gap-4 border-b pb-3 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">{step.label}</p>
                <p className="text-muted-foreground text-caption">{step.formula}</p>
              </div>
              <p className="shrink-0 text-sm font-medium tabular-nums">{signedWon(step.amount)}</p>
            </li>
          ))}
        </ol>
      </section>

      <DataTable
        caption="지역별 탁송료와 공통 비용"
        className="print:break-inside-avoid"
        columns={feeColumns}
        rows={feeRows()}
        getRowKey={(row) => row.region}
      />

      <section aria-labelledby="items-title" className="flex flex-col gap-3">
        <h3 id="items-title" className="sr-only">
          선택 내역
        </h3>
        <div className="print:hidden">
          <SummaryList quote={quote} dispatch={dispatch} />
        </div>
        <div className="hidden print:block">
          <SummaryList quote={quote} dispatch={dispatch} readOnly />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2 print:hidden">
        <CopyButton
          className="w-full"
          label="견적 링크 복사"
          value={shareUrl}
          variant="primary"
          onCopy={() => {
            toast({
              title: '링크를 복사했습니다',
              description: '붙여 넣으면 같은 견적을 다시 열 수 있습니다.',
            });
          }}
          onCopyError={() => {
            toast({
              title: '링크를 복사하지 못했습니다',
              description: '주소창의 주소를 직접 복사해 주십시오.',
              variant: 'error',
            });
          }}
        />
        <Button
          className="w-full"
          variant="secondary"
          onClick={() => {
            window.print();
          }}
        >
          <PrinterIcon data-icon="inline-start" />
          인쇄 · PDF 저장
        </Button>
        <Button
          ref={resetButtonRef}
          className="col-span-2 w-full"
          variant="clear"
          onClick={() => {
            setResetOpen(true);
          }}
        >
          <RotateCCWIcon data-icon="inline-start" />
          처음부터 다시 견적
        </Button>
      </div>

      <Notice className="print:break-inside-avoid" role="note">
        <NoticeTitle>안내</NoticeTitle>
        <NoticeDescription>{DISCLAIMER}</NoticeDescription>
      </Notice>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent
          onCloseAutoFocus={(event) => {
            // 취소나 Esc로 닫으면 눌렀던 버튼으로 돌아간다. 다시 시작해 버튼이 사라졌으면 단계 제목이 초점을 받는다.
            if (resetButtonRef.current) {
              event.preventDefault();
              resetButtonRef.current.focus();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>처음부터 다시 견적을 내시겠습니까?</DialogTitle>
            <DialogDescription>
              지금까지 고른 선택이 모두 기본값으로 돌아갑니다. 링크를 복사해 두면 이 견적을 다시 열
              수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button iconMotion="mount" variant="secondary">
                <XIcon data-icon="inline-start" />
                취소
              </Button>
            </DialogClose>
            <Button
              iconMotion="mount"
              variant="primary"
              onClick={() => {
                setResetOpen(false);
                dispatch({ type: 'reset' });
              }}
            >
              <RotateCCWIcon data-icon="inline-start" />
              처음부터 다시
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
