'use client';

import { Button } from '@repo/ui/button';
import { Notice, NoticeDescription, NoticeTitle } from '@repo/ui/notice';
import { PriceBar, PriceBarActions, PriceBarTotal } from '@repo/ui/price-bar';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@repo/ui/sheet';
import { Stepper, StepperItem } from '@repo/ui/stepper';
import { useEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore } from 'react';

import { CATALOG } from '../model/catalog';
import { encodeEstimate } from '../model/codec';
import { describeEffect } from '../model/describe';
import { calculateQuote } from '../model/quote';
import { neighborStep, type StepId, STEPS } from '../model/steps';
import { wizardReducer, type WizardState } from '../model/wizard';
import { BlockedDialog, ConfirmChangeDialog, SuggestionDialog } from './change-dialogs';
import {
  AccessoriesStep,
  ExteriorStep,
  InteriorStep,
  ModelStep,
  OptionsStep,
  ResultStep,
  SeatStep,
  WheelStep,
} from './step-panels';
import { SummaryList } from './summary';
import { ThemeToggle } from './theme-toggle';
import { VehicleStage } from './vehicle-stage';

const STEP_INTRO: Record<StepId, string> = {
  model: '파워트레인과 트림을 고릅니다. 트림에 따라 고를 수 있는 외장 색상과 휠이 달라집니다.',
  exterior: '외장 색상을 고릅니다. 무광과 일부 메탈릭은 가격이 더해집니다.',
  wheel: '휠을 고릅니다. 일부 휠은 트림이나 패키지 조건이 있습니다.',
  seat: '시트 구성을 고릅니다.',
  interior:
    '내장 색상과 가니쉬를 고릅니다. 내장 색상은 외장 색상과 어울리는 조합만 고를 수 있습니다.',
  options:
    '선택 품목을 고릅니다. 다른 품목이 필요하거나 함께 고를 수 없는 경우에는 이유를 알려 드립니다.',
  accessories: '액세서리를 고릅니다.',
  result: '선택한 구성의 견적입니다. 과세 구분과 등록 지역에 따라 취득세와 부대비용이 달라집니다.',
};

const subscribeNone = () => () => {};

/** 선택 전체를 주소에 담은 공유 링크. 서버에서는 주소를 알 수 없어 빈 문자열이다. */
function useShareUrl(query: string) {
  const origin = useSyncExternalStore(
    subscribeNone,
    () => `${window.location.origin}${window.location.pathname}`,
    () => '',
  );
  return origin ? `${origin}?${query}` : '';
}

export function EstimateApp({
  initial,
  restoreIssueCount,
}: {
  initial: WizardState;
  restoreIssueCount: number;
}) {
  const [state, dispatch] = useReducer(wizardReducer, initial);
  const [issuesOpen, setIssuesOpen] = useState(restoreIssueCount > 0);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const shownStep = useRef(initial.step);
  const focusHeadingOnClose = useRef(false);

  const quote = useMemo(
    () => calculateQuote(state.selection, state.quoteOptions),
    [state.selection, state.quoteOptions],
  );
  const query = useMemo(
    () => encodeEstimate({ selection: state.selection, quoteOptions: state.quoteOptions }),
    [state.selection, state.quoteOptions],
  );
  const shareUrl = useShareUrl(`${query}&step=${state.step}`);

  // 선택 전체와 현재 단계를 주소에 담는다. 새로고침하거나 링크를 공유해도 같은 화면으로 돌아온다.
  useEffect(() => {
    window.history.replaceState(null, '', `?${query}&step=${state.step}`);
  }, [query, state.step]);

  // 단계가 바뀌면 제목으로 초점을 옮겨, 키보드와 스크린 리더 사용자가 새 단계의 시작을 알 수 있게 한다.
  useEffect(() => {
    // 처음 그릴 때가 아니라 단계가 실제로 바뀐 경우에만 옮긴다.
    if (shownStep.current === state.step) return;
    shownStep.current = state.step;
    headingRef.current?.focus();
  }, [state.step]);

  const stepIndex = STEPS.findIndex((step) => step.id === state.step);
  const previous = neighborStep(state.step, -1);
  const next = neighborStep(state.step, 1);
  const currentLabel = STEPS[stepIndex]?.label ?? '';
  const panelProps = { state, dispatch };

  return (
    <div className="bg-background text-foreground min-h-dvh pb-52 font-sans lg:pb-32">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 p-4">
        <div className="flex flex-col">
          <h1 className="text-body font-semibold tracking-tight">X5 견적</h1>
          <p className="text-muted-foreground text-caption">
            비공식 포트폴리오입니다. BMW와 무관하며 가격과 사양은 모두 가상의 값입니다.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-6xl px-4">
        <Stepper aria-label="견적 단계" value={state.step} className="mb-6">
          {STEPS.map((step, index) => (
            <StepperItem
              key={step.id}
              value={step.id}
              completed={index < stepIndex}
              href={`?${query}&step=${step.id}`}
              onClick={(event) => {
                event.preventDefault();
                dispatch({ type: 'go', step: step.id });
              }}
            >
              {step.label}
            </StepperItem>
          ))}
        </Stepper>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
          <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-6 lg:max-h-[calc(100dvh-9rem)] lg:self-start lg:overflow-y-auto">
            <VehicleStage
              color={state.selection.color}
              colorLabel={CATALOG.color.find((item) => item.id === state.selection.color)!.label}
            />
            <aside
              aria-label="선택 요약"
              className="border-border bg-card hidden rounded-lg border p-5 lg:block"
            >
              <SummaryList quote={quote} dispatch={dispatch} />
            </aside>
          </div>

          <section aria-labelledby="step-title" className="flex min-w-0 flex-col gap-6">
            <div>
              <h2
                id="step-title"
                ref={headingRef}
                tabIndex={-1}
                className="text-title font-semibold tracking-tight outline-none"
              >
                <span className="sr-only">{stepIndex + 1}단계: </span>
                {currentLabel}
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">{STEP_INTRO[state.step]}</p>
            </div>

            {issuesOpen ? (
              <Notice variant="error">
                <NoticeTitle>주소의 일부를 읽지 못했습니다</NoticeTitle>
                <NoticeDescription>읽을 수 없는 값은 기본 선택으로 되돌렸습니다.</NoticeDescription>
                <div>
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => {
                      setIssuesOpen(false);
                    }}
                  >
                    닫기
                  </Button>
                </div>
              </Notice>
            ) : null}

            {state.notices.length > 0 ? (
              <Notice>
                <NoticeTitle>선택이 자동으로 바뀌었습니다</NoticeTitle>
                <ul className="text-muted-foreground text-caption flex list-disc flex-col gap-1 pl-5">
                  {state.notices.map((effect, index) => (
                    <li key={index}>{describeEffect(effect)}</li>
                  ))}
                </ul>
                <div>
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => {
                      dispatch({ type: 'dismiss-notices' });
                    }}
                  >
                    확인
                  </Button>
                </div>
              </Notice>
            ) : null}

            {state.step === 'model' ? <ModelStep {...panelProps} /> : null}
            {state.step === 'exterior' ? <ExteriorStep {...panelProps} /> : null}
            {state.step === 'wheel' ? <WheelStep {...panelProps} /> : null}
            {state.step === 'seat' ? <SeatStep {...panelProps} /> : null}
            {state.step === 'interior' ? <InteriorStep {...panelProps} /> : null}
            {state.step === 'options' ? <OptionsStep {...panelProps} /> : null}
            {state.step === 'accessories' ? <AccessoriesStep {...panelProps} /> : null}
            {state.step === 'result' ? (
              <ResultStep {...panelProps} quote={quote} shareUrl={shareUrl} />
            ) : null}
          </section>
        </div>
      </main>

      <PriceBar
        fixed
        aria-label="견적 금액과 단계 이동"
        className="px-[max(1rem,calc((100%-72rem)/2+1rem))]"
      >
        {state.step === 'result' ? (
          <PriceBarTotal
            label="예상 총 비용"
            amount={quote.total}
            note="취득세와 부대비용을 포함한 금액입니다"
          />
        ) : (
          <PriceBarTotal amount={quote.listPrice} note="취득세와 부대비용은 별도입니다" />
        )}
        <PriceBarActions className="ml-auto">
          <Sheet open={summaryOpen} onOpenChange={setSummaryOpen}>
            <SheetTrigger asChild>
              <Button variant="secondary" className="lg:hidden">
                견적 요약
              </Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              onCloseAutoFocus={(event) => {
                // 시트의 "변경"으로 단계를 옮겼으면 닫힌 뒤 초점이 트리거로 돌아가지 않고 새 단계 제목으로 간다.
                if (focusHeadingOnClose.current) {
                  event.preventDefault();
                  focusHeadingOnClose.current = false;
                  headingRef.current?.focus();
                }
              }}
            >
              <SheetHeader>
                <SheetTitle>견적 요약</SheetTitle>
                <SheetDescription>선택한 항목과 금액입니다.</SheetDescription>
              </SheetHeader>
              <SummaryList
                quote={quote}
                dispatch={dispatch}
                onNavigate={() => {
                  focusHeadingOnClose.current = true;
                  setSummaryOpen(false);
                }}
              />
            </SheetContent>
          </Sheet>
          <Button
            variant="secondary"
            disabled={previous === null}
            onClick={() => {
              if (previous) dispatch({ type: 'go', step: previous });
            }}
          >
            이전
          </Button>
          {next ? (
            <Button
              variant="primary"
              onClick={() => {
                dispatch({ type: 'go', step: next });
              }}
            >
              다음
            </Button>
          ) : null}
        </PriceBarActions>
      </PriceBar>

      <ConfirmChangeDialog {...panelProps} returnFocusRef={headingRef} />
      <BlockedDialog {...panelProps} returnFocusRef={headingRef} />
      <SuggestionDialog {...panelProps} returnFocusRef={headingRef} />
    </div>
  );
}
