import { CATALOG } from './catalog';
import type { DecodeResult } from './codec';
import { createDefaultSelection, resolveSelection } from './resolve';
import { DEFAULT_STEP, type StepId } from './steps';
import type { Effect, EstimateState, Intent, QuoteOptions, Resolution, Selection } from './types';

const DEFAULT_OPTIONS: QuoteOptions = { taxType: 'taxable', region: 'seoul' };

type SuggestionEffect = Extract<Effect, { kind: 'suggestion' }>;

export interface PendingChange {
  intent: Intent;
  resolution: Resolution;
}

export interface WizardState {
  selection: Selection;
  quoteOptions: QuoteOptions;
  step: StepId;
  /** 적용은 됐지만 사용자가 알아야 하는 자동 변경. 닫을 때까지 보인다. */
  notices: readonly Effect[];
  /** 확인을 기다리는 변경. 확인하기 전에는 선택과 가격이 바뀌지 않는다. */
  pending: PendingChange | null;
  /** 막힌 변경의 이유 */
  blocked: readonly Effect[] | null;
  /** 더 나은 구성 제안 */
  suggestion: SuggestionEffect | null;
}

export type WizardAction =
  | { type: 'intent'; intent: Intent }
  | { type: 'confirm' }
  | { type: 'cancel' }
  | { type: 'dismiss-blocked' }
  | { type: 'dismiss-notices' }
  | { type: 'dismiss-suggestion' }
  | { type: 'accept-suggestion' }
  | { type: 'reset' }
  | { type: 'go'; step: StepId }
  | { type: 'quote-options'; options: Partial<QuoteOptions> };

const isSuggestion = (effect: Effect): effect is SuggestionEffect => effect.kind === 'suggestion';

/** URL에서 복원한 결과로 시작 상태를 만든다. 복원하며 조정한 내용은 알림으로 보여 준다. */
export function createWizardState(
  decoded: Pick<DecodeResult, 'state' | 'effects'> | EstimateState | null,
  step: StepId = DEFAULT_STEP,
): WizardState {
  const state =
    decoded === null
      ? { selection: createDefaultSelection(CATALOG), quoteOptions: DEFAULT_OPTIONS }
      : 'state' in decoded
        ? decoded.state
        : decoded;
  return {
    selection: state.selection,
    quoteOptions: state.quoteOptions,
    step,
    notices: decoded !== null && 'effects' in decoded ? decoded.effects : [],
    pending: null,
    blocked: null,
    suggestion: null,
  };
}

function commit(state: WizardState, resolution: Resolution): WizardState {
  const suggestion = resolution.effects.find(isSuggestion) ?? null;
  return {
    ...state,
    selection: resolution.next,
    notices: resolution.effects.filter((effect) => !isSuggestion(effect)),
    pending: null,
    blocked: null,
    suggestion,
  };
}

/**
 * 견적 화면의 상태 전이. 규칙은 `resolveSelection`이 정하고 여기서는 그 결과를 화면 상태로 옮기기만 한다.
 * - `applied`: 바로 반영한다. 자동 변경은 `notices`로 남긴다.
 * - `needs-confirmation`: `pending`에 두고, 확인(`confirm`)하기 전까지 선택은 그대로다.
 * - `blocked`: 선택은 그대로이고 이유를 `blocked`로 보여 준다.
 */
export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'intent': {
      const resolution = resolveSelection(state.selection, action.intent);
      if (resolution.status === 'blocked') {
        return { ...state, blocked: resolution.effects, pending: null, suggestion: null };
      }
      if (resolution.status === 'needs-confirmation') {
        return { ...state, pending: { intent: action.intent, resolution }, blocked: null };
      }
      return commit(state, resolution);
    }
    case 'confirm': {
      if (!state.pending) return state;
      const { resolution } = state.pending;
      // 사용자가 확인한 변경이라 같은 내용을 다시 알림으로 띄우지 않는다. 제안만 이어서 보여 준다.
      return { ...commit(state, resolution), notices: [] };
    }
    case 'cancel':
      return { ...state, pending: null };
    case 'dismiss-blocked':
      return { ...state, blocked: null };
    case 'dismiss-notices':
      return { ...state, notices: [] };
    case 'dismiss-suggestion':
      return { ...state, suggestion: null };
    case 'accept-suggestion': {
      if (!state.suggestion) return state;
      return wizardReducer(
        { ...state, suggestion: null },
        { type: 'intent', intent: state.suggestion.intent },
      );
    }
    case 'reset':
      return createWizardState(null);
    case 'go':
      return { ...state, step: action.step };
    case 'quote-options':
      return { ...state, quoteOptions: { ...state.quoteOptions, ...action.options } };
  }
}
