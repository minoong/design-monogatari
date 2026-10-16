'use client';

import { Badge } from '@repo/ui/badge';
import { Stepper, StepperItem } from '@repo/ui/stepper';
import type { Dispatch, ReactNode } from 'react';

import { type StepId, STEPS } from '../model/steps';
import type { WizardAction } from '../model/wizard';
import { ThemeToggle } from './theme-toggle';

/**
 * 위쪽 고정 막대. 큰 화면에서는 한 줄(브랜드, 단계, 요약·테마)이고, 좁은 화면에서는 두 줄(브랜드와 도구, 그 아래 단계)이다.
 * 가운데 폭 제한 없이 화면 끝까지 쓴다.
 */
export function EstimateHeader({
  step,
  stepIndex,
  query,
  dispatch,
  summary,
}: {
  step: StepId;
  stepIndex: number;
  query: string;
  dispatch: Dispatch<WizardAction>;
  /** 견적 요약을 여는 버튼(시트 트리거) */
  summary: ReactNode;
}) {
  return (
    <header className="border-border bg-background sticky top-0 z-30 flex flex-wrap items-center gap-x-4 border-b px-4 lg:h-16 lg:flex-nowrap lg:px-6 print:hidden">
      <div className="flex h-14 min-w-0 flex-1 items-center gap-3 lg:h-auto lg:flex-none">
        <h1 className="text-body shrink-0 font-semibold tracking-tight">X5 견적</h1>
        <Badge
          className="hidden xl:inline-flex"
          variant="secondary"
          title="비공식 포트폴리오입니다. BMW와 무관하며 가격과 사양은 모두 가상의 값입니다."
        >
          비공식 · 가상 데이터
        </Badge>
      </div>

      <div className="order-3 -mx-4 w-[calc(100%+2rem)] min-w-0 lg:order-0 lg:mx-0 lg:w-auto lg:flex-1">
        <Stepper aria-label="견적 단계" value={step} className="lg:mx-auto lg:max-w-4xl">
          {STEPS.map((item, index) => (
            <StepperItem
              key={item.id}
              value={item.id}
              className="px-2 xl:px-3"
              completed={index < stepIndex}
              href={`?${query}&step=${item.id}`}
              onClick={(event) => {
                event.preventDefault();
                dispatch({ type: 'go', step: item.id });
              }}
            >
              {item.label}
            </StepperItem>
          ))}
        </Stepper>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {summary}
        <ThemeToggle />
      </div>
    </header>
  );
}
