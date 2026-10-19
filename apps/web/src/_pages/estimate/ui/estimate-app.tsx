'use client';

import { Button } from '@repo/ui/button';
import { ArrowLeftIcon } from '@repo/ui/icons/arrow-left';
import { ArrowRightIcon } from '@repo/ui/icons/arrow-right';
import { CheckIcon } from '@repo/ui/icons/check';
import { ReceiptTextIcon } from '@repo/ui/icons/receipt-text';
import { XIcon } from '@repo/ui/icons/x';
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
import { ToastProvider } from '@repo/ui/toast';
import {
  type UIEvent,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { CATALOG } from '../model/catalog';
import { encodeEstimate } from '../model/codec';
import { describeEffect } from '../model/describe';
import { calculateQuote } from '../model/quote';
import { hasSunroof } from '../model/roof-map';
import { neighborStep, type StepId, STEPS } from '../model/steps';
import { type WizardAction, wizardReducer, type WizardState } from '../model/wizard';
import { BlockedDialog, ConfirmChangeDialog, SuggestionDialog } from './change-dialogs';
import { EstimateHeader } from './estimate-header';
import { ResultStep } from './result-step';
import {
  AccessoriesStep,
  ExteriorStep,
  InteriorStep,
  ModelStep,
  OptionsStep,
  SeatStep,
  WheelStep,
} from './step-panels';
import { SummaryList } from './summary';
import { StageNotes, VehicleStage } from './vehicle-stage';

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
  const scrollRef = useRef<HTMLDivElement>(null);
  // 좁은 화면에서 차량 영역의 크기. 패널을 아래로 내리면 줄고(compact), 직접 키울 수도 있다(large).
  const [stageCompact, setStageCompact] = useState(false);
  const [stageLarge, setStageLarge] = useState(false);
  // 선택을 시도한 요소(눌렀던 라디오). 고를 수 없다는 안내 창이 닫히면 초점을 여기로 돌려보내, 방향키로 이어서 움직일 수 있게 한다.
  const openerRef = useRef<HTMLElement | null>(null);
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
    // 새 단계는 늘 맨 위에서 시작한다. 패널만 스크롤하므로 스크롤 위치가 이전 단계에서 이어지지 않게 한다.
    scrollRef.current?.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
  }, [state.step]);

  const stepIndex = STEPS.findIndex((step) => step.id === state.step);
  const previous = neighborStep(state.step, -1);
  const next = neighborStep(state.step, 1);
  const currentLabel = STEPS[stepIndex]?.label ?? '';
  const panelProps = {
    state,
    dispatch: (action: WizardAction) => {
      if (action.type === 'intent') {
        openerRef.current =
          document.activeElement instanceof HTMLElement ? document.activeElement : null;
      }
      dispatch(action);
    },
  };

  const isSplit = useIsSplit();
  // 좌우로 나누는 화면으로 바뀌면 줄여 둔 상태를 푼다(스크롤이 없어 되돌릴 이벤트가 오지 않는다).
  if (isSplit && stageCompact) {
    setStageCompact(false);
  }

  /**
   * 좁은 화면에서 패널을 내리면 차량 영역을 줄이고, 맨 위로 돌아오면 다시 키운다. 줄이면 패널이 그만큼 커져서
   * 스크롤할 수 있는 길이가 짧아지는데, 그 길이가 남지 않으면 줄였다 늘렸다 하며 깜빡이므로 줄인 뒤에도
   * 충분히 남을 때만 줄인다. 줄이고 키우는 기준을 다르게 둬서(64px/8px) 경계에서 흔들리지 않게 한다.
   */
  function handleScroll(event: UIEvent<HTMLDivElement>) {
    if (isSplit || stageLarge) return;
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const gain = window.innerHeight * 0.18;
    setStageCompact((compact) =>
      compact ? scrollTop > 8 : scrollTop > 64 && scrollHeight - clientHeight - gain > 96,
    );
  }
  usePrintLight();
  const colorLabel = CATALOG.color.find((item) => item.id === state.selection.color)!.label;

  const summaryTrigger = (
    <Sheet open={summaryOpen} onOpenChange={setSummaryOpen}>
      <SheetTrigger asChild>
        <Button size="small" variant="secondary">
          <ReceiptTextIcon data-icon="inline-start" />
          견적 요약
        </Button>
      </SheetTrigger>
      <SheetContent
        side={isSplit ? 'right' : 'bottom'}
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
  );

  return (
    <ToastProvider>
      <div className="bg-background text-foreground flex h-dvh flex-col overflow-hidden font-sans print:block print:h-auto print:min-h-0 print:overflow-visible">
        <EstimateHeader
          dispatch={dispatch}
          query={query}
          step={state.step}
          stepIndex={stepIndex}
          summary={summaryTrigger}
        />

        <main className="split:flex-row flex min-h-0 flex-1 flex-col print:block">
          <div className="split:flex split:min-h-0 split:flex-1 split:flex-col split:overflow-hidden split:max-lg:p-3 min-w-0 shrink-0 lg:p-6 print:hidden!">
            <VehicleStage
              caliper={state.selection.caliper}
              color={state.selection.color}
              colorLabel={colorLabel}
              interior={state.selection.interior}
              large={stageLarge}
              compact={stageCompact}
              onToggleLarge={() => {
                setStageLarge((large) => !large);
                setStageCompact(false);
              }}
              rimFinish={state.selection.rimFinish}
              step={state.step}
              sunroof={hasSunroof(state.selection.packages)}
              wheel={state.selection.wheel}
            />
          </div>

          <section
            aria-labelledby="step-title"
            className="border-border split:w-[min(30rem,56vw)] split:flex-none split:shrink-0 split:border-t-0 split:border-l flex min-h-0 min-w-0 flex-1 flex-col border-t 2xl:w-136"
          >
            <div
              ref={scrollRef}
              className="relative flex min-h-0 flex-1 scrollbar-gutter-stable flex-col overflow-y-auto overscroll-contain print:overflow-visible"
              onScroll={handleScroll}
            >
              <div className="flex-1 p-4 lg:p-8 print:p-0">
                <div className="flex flex-col gap-6">
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
                      <NoticeDescription>
                        읽을 수 없는 값은 기본 선택으로 되돌렸습니다.
                      </NoticeDescription>
                      <div>
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() => {
                            setIssuesOpen(false);
                          }}
                        >
                          <XIcon data-icon="inline-start" />
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
                          <CheckIcon data-icon="inline-start" />
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
                </div>
                {/* 좁은 화면에서는 차량 아래에 둘 자리가 없어 패널 맨 끝에 둔다(모델 출처 고지는 차량을 보여 주는 곳에 늘 있어야 한다). */}
                <StageNotes className="text-muted-foreground text-caption mt-8 flex flex-col gap-1 lg:hidden print:hidden" />
              </div>

              <PriceBar
                aria-label="견적 금액과 단계 이동"
                className="split:max-lg:flex-wrap split:max-lg:gap-y-2 sticky bottom-0 z-10 mt-auto flex-nowrap gap-x-3 gap-y-0 lg:flex-wrap lg:gap-y-4 lg:px-8 lg:py-5 print:hidden"
              >
                {state.step === 'result' ? (
                  <PriceBarTotal
                    amount={quote.total}
                    label="예상 총 비용"
                    note={
                      <span className="hidden lg:inline">
                        취득세와 부대비용을 포함한 금액입니다
                      </span>
                    }
                  />
                ) : (
                  <PriceBarTotal
                    amount={quote.listPrice}
                    note={<span className="hidden lg:inline">취득세와 부대비용은 별도입니다</span>}
                  />
                )}
                <PriceBarActions className="ml-auto flex-nowrap lg:ml-0 lg:w-full [&>button]:lg:flex-1">
                  <Button
                    disabled={previous === null}
                    variant="secondary"
                    onClick={() => {
                      if (previous) dispatch({ type: 'go', step: previous });
                    }}
                  >
                    <ArrowLeftIcon data-icon="inline-start" />
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
                      <ArrowRightIcon data-icon="inline-end" />
                    </Button>
                  ) : null}
                </PriceBarActions>
              </PriceBar>
            </div>
          </section>
        </main>

        <ConfirmChangeDialog {...panelProps} returnFocusRef={headingRef} />
        <BlockedDialog {...panelProps} fallbackFocusRef={headingRef} returnFocusRef={openerRef} />
        <SuggestionDialog {...panelProps} returnFocusRef={headingRef} />
      </div>
    </ToastProvider>
  );
}

/**
 * 인쇄하는 동안만 다크 테마를 풀어 흰 바탕에 어두운 글자로 나오게 한다. 다크 토큰 그대로 인쇄하면 검은 배경이거나
 * (배경 인쇄를 끄면) 흰 종이에 연한 글자라 읽을 수 없다. 인쇄가 끝나면 원래 테마로 돌린다.
 */
function usePrintLight() {
  useEffect(() => {
    let wasDark = false;
    const before = () => {
      // beforeprint가 afterprint 없이 두 번 오면 두 번째에는 이미 클래스가 없으므로, 처음에 어두웠다는 기억을 덮어쓰지 않는다.
      if (document.documentElement.classList.contains('dark')) {
        wasDark = true;
        document.documentElement.classList.remove('dark');
      }
    };
    const after = () => {
      if (wasDark) document.documentElement.classList.add('dark');
      wasDark = false;
    };
    window.addEventListener('beforeprint', before);
    window.addEventListener('afterprint', after);
    return () => {
      window.removeEventListener('beforeprint', before);
      window.removeEventListener('afterprint', after);
    };
  }, []);
}

/** 차량과 패널을 좌우로 나누는 조건. globals.css의 `split` 변형과 같은 값이다. */
const SPLIT_QUERY =
  '(min-width: 64rem), (orientation: landscape) and (min-width: 36rem) and (max-height: 32rem)';

function subscribeSplit(onChange: () => void) {
  const media = window.matchMedia(SPLIT_QUERY);
  media.addEventListener('change', onChange);
  return () => {
    media.removeEventListener('change', onChange);
  };
}

/** 차량과 패널을 좌우로 나누는 화면인지. 요약 시트가 오른쪽에서 열릴지 아래에서 열릴지, 차량 영역을 줄일지 정한다. 서버에서는 false다. */
function useIsSplit() {
  return useSyncExternalStore(
    subscribeSplit,
    () => window.matchMedia(SPLIT_QUERY).matches,
    () => false,
  );
}
