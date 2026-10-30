'use client';

import { Button } from '@repo/ui/button';
import { ChangeDiff } from '@repo/ui/change-diff';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/dialog';
import { ArrowRightIcon } from '@repo/ui/icons/arrow-right';
import { CheckIcon } from '@repo/ui/icons/check';
import { XIcon } from '@repo/ui/icons/x';
import type { Dispatch, RefObject } from 'react';

import { describeEffect } from '../model/describe';
import { diffSelections } from '../model/diff';
import { formatWon, josa } from '../model/format';
import type { WizardAction, WizardState } from '../model/wizard';
import { AlertGlyph } from './alert-glyph';

function signedWon(amount: number) {
  if (amount === 0) return '변동 없음';
  return `${amount > 0 ? '+' : ''}${formatWon(amount)}`;
}

interface DialogProps {
  state: WizardState;
  dispatch: Dispatch<WizardAction>;
  /** 창이 닫힌 뒤 초점을 보낼 곳. 눌렀던 요소로 돌려보내고, 그것이 사라졌으면 `fallbackFocusRef`(단계 제목)로 보낸다. */
  returnFocusRef?: RefObject<HTMLElement | null>;
  /** `returnFocusRef`의 요소가 이미 사라졌을 때 대신 초점을 보낼 곳 */
  fallbackFocusRef?: RefObject<HTMLElement | null>;
}

/**
 * 첫 번째로 아직 화면에 있는 요소로 초점을 보낸다. 없으면 Radix의 기본 동작에 맡긴다. 초점을 옮기며 패널이 스크롤되지 않게
 * `preventScroll`을 준다(단계 제목은 패널 맨 위라서 그냥 초점을 주면 창을 닫을 때마다 스크롤이 맨 위로 돌아갔다).
 */
function returnFocus(
  ref?: RefObject<HTMLElement | null>,
  fallback?: RefObject<HTMLElement | null>,
) {
  return (event: Event) => {
    const target = [ref?.current, fallback?.current].find((element) => element?.isConnected);
    if (target) {
      event.preventDefault();
      target.focus({ preventScroll: true });
    }
  };
}

/** 확인이 필요한 변경: 이전 선택과 변경 후를 나란히 보이고, 확인하기 전까지 선택과 가격은 그대로다. */
export function ConfirmChangeDialog({
  state,
  dispatch,
  returnFocusRef,
  fallbackFocusRef,
}: DialogProps) {
  const pending = state.pending;
  const diff = pending
    ? diffSelections(state.selection, pending.resolution.next, state.quoteOptions)
    : null;

  return (
    <Dialog
      open={pending !== null}
      onOpenChange={(open) => {
        if (!open) dispatch({ type: 'cancel' });
      }}
    >
      <DialogContent
        className="max-w-xl"
        onCloseAutoFocus={returnFocus(returnFocusRef, fallbackFocusRef)}
      >
        <DialogHeader>
          <DialogTitle>다른 선택도 함께 바뀝니다</DialogTitle>
          <DialogDescription>
            확인하기 전까지는 선택과 견적 금액이 바뀌지 않습니다.
          </DialogDescription>
        </DialogHeader>
        {pending && diff ? (
          <>
            <ul className="text-muted-foreground text-caption flex list-disc flex-col gap-1 pl-5">
              {pending.resolution.effects
                .filter((effect) => effect.kind !== 'suggestion')
                .map((effect, index) => (
                  <li key={index}>{describeEffect(effect, undefined, 'pending')}</li>
                ))}
            </ul>
            <ChangeDiff rows={diff.rows} summary={signedWon(diff.priceDelta)} />
          </>
        ) : null}
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
              dispatch({ type: 'confirm' });
            }}
          >
            <CheckIcon data-icon="inline-start" />
            변경 확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** 막힌 변경: 왜 선택할 수 없는지 알리고, 대안 트림이 있으면 바꾸도록 제안한다. */
export function BlockedDialog({ state, dispatch, returnFocusRef, fallbackFocusRef }: DialogProps) {
  const effects = state.blocked ?? [];
  const alternativeTrim = effects.find(
    (effect) => effect.kind === 'unavailable-reason' && effect.alternativeTrim,
  );

  return (
    <Dialog
      open={state.blocked !== null}
      onOpenChange={(open) => {
        if (!open) dispatch({ type: 'dismiss-blocked' });
      }}
    >
      <DialogContent onCloseAutoFocus={returnFocus(returnFocusRef, fallbackFocusRef)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertGlyph />
            지금은 선택할 수 없습니다
          </DialogTitle>
          <DialogDescription>선택은 그대로이고, 견적 금액도 바뀌지 않았습니다.</DialogDescription>
        </DialogHeader>
        <ul className="text-foreground flex list-disc flex-col gap-1 pl-5 text-sm">
          {effects.map((effect, index) => (
            <li key={index}>{describeEffect(effect)}</li>
          ))}
        </ul>
        <DialogFooter>
          <DialogClose asChild>
            <Button iconMotion="mount" variant="secondary">
              <XIcon data-icon="inline-start" />
              닫기
            </Button>
          </DialogClose>
          {alternativeTrim?.kind === 'unavailable-reason' && alternativeTrim.alternativeTrim ? (
            <Button
              iconMotion="mount"
              variant="primary"
              onClick={() => {
                dispatch({ type: 'dismiss-blocked' });
                dispatch({
                  type: 'intent',
                  intent: { type: 'set', slot: 'trim', id: alternativeTrim.alternativeTrim! },
                });
              }}
            >
              {alternativeTrim.alternativeTrim === 'sport' ? '스포트' : '컴포트'} 트림으로 바꾸기
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** 더 알맞은 구성 제안. 받아들이면 그 변경을 실행하고, 거절하면 지금 선택을 그대로 둔다. */
export function SuggestionDialog({
  state,
  dispatch,
  returnFocusRef,
  fallbackFocusRef,
}: DialogProps) {
  const suggestion = state.suggestion;

  return (
    <Dialog
      open={suggestion !== null}
      onOpenChange={(open) => {
        if (!open) dispatch({ type: 'dismiss-suggestion' });
      }}
    >
      <DialogContent onCloseAutoFocus={returnFocus(returnFocusRef, fallbackFocusRef)}>
        <DialogHeader>
          <DialogTitle>더 알맞은 구성이 있습니다</DialogTitle>
          <DialogDescription>{suggestion?.message}</DialogDescription>
        </DialogHeader>
        {suggestion ? (
          <p className="text-foreground text-sm font-medium">
            제안을 받아들이면 {josa(formatWon(suggestion.savings), '을/를')} 절약합니다.
          </p>
        ) : null}
        <DialogFooter>
          <DialogClose asChild>
            <Button iconMotion="mount" variant="secondary">
              <XIcon data-icon="inline-start" />
              그대로 진행
            </Button>
          </DialogClose>
          <Button
            iconMotion="mount"
            variant="primary"
            onClick={() => {
              dispatch({ type: 'accept-suggestion' });
            }}
          >
            <CheckIcon data-icon="inline-start" />
            제안 받아들이기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
