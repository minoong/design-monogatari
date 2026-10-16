import { describe, expect, it } from 'vitest';

import { decodeEstimate } from './codec';
import { defaults } from './helpers.test-util';
import { calculateQuote } from './quote';
import { createWizardState, wizardReducer } from './wizard';

const start = () => createWizardState(null);
const set = (slot: 'trim' | 'wheel' | 'seat' | 'color' | 'powertrain', id: string) =>
  ({ type: 'intent', intent: { type: 'set', slot, id } }) as never;

describe('wizardReducer', () => {
  it('규칙에 걸리지 않는 변경은 바로 반영한다', () => {
    const next = wizardReducer(start(), set('color', 'blue'));
    expect(next.selection.color).toBe('blue');
    expect(next.pending).toBeNull();
    expect(next.blocked).toBeNull();
  });

  it('확인이 필요한 변경은 확인 전까지 선택과 가격을 바꾸지 않는다', () => {
    let state = wizardReducer(start(), set('trim', 'sport'));
    state = wizardReducer(state, set('wheel', 'w20'));
    const before = calculateQuote(state.selection, state.quoteOptions).listPrice;

    const asked = wizardReducer(state, set('trim', 'comfort'));
    expect(asked.pending).not.toBeNull();
    expect(asked.selection).toEqual(state.selection);
    expect(calculateQuote(asked.selection, asked.quoteOptions).listPrice).toBe(before);

    const confirmed = wizardReducer(asked, { type: 'confirm' });
    expect(confirmed.pending).toBeNull();
    expect(confirmed.selection.trim).toBe('comfort');
    expect(confirmed.selection.wheel).toBe('w19');
    expect(confirmed.notices).toEqual([]);
  });

  it('취소하면 선택이 그대로다', () => {
    let state = wizardReducer(start(), set('trim', 'sport'));
    state = wizardReducer(state, set('wheel', 'w20'));
    const asked = wizardReducer(state, set('trim', 'comfort'));
    const cancelled = wizardReducer(asked, { type: 'cancel' });
    expect(cancelled.pending).toBeNull();
    expect(cancelled.selection).toEqual(state.selection);
  });

  it('고를 수 없는 항목은 막고 이유를 남긴다', () => {
    const state = wizardReducer(start(), set('color', 'bronze'));
    expect(state.selection).toEqual(start().selection);
    expect(state.blocked?.map((effect) => effect.kind)).toEqual(['unavailable-reason']);
    expect(wizardReducer(state, { type: 'dismiss-blocked' }).blocked).toBeNull();
  });

  it('필수 동반 품목이 자동으로 담기면 알림으로 남긴다', () => {
    const state = wizardReducer(start(), set('seat', 'four'));
    expect(state.blocked).toBeNull();
    const auto = state.pending ?? { resolution: { effects: state.notices } };
    expect(auto.resolution.effects.some((effect) => effect.kind === 'auto-added')).toBe(true);
  });

  it('제안은 수락하면 그 변경을 실행한다', () => {
    let state = start();
    for (const id of ['driving-assist', 'hud'] as const) {
      state = wizardReducer(state, {
        type: 'intent',
        intent: { type: 'add', slot: 'packages', id },
      });
      state = state.pending ? wizardReducer(state, { type: 'confirm' }) : state;
    }
    expect(state.suggestion).not.toBeNull();
    const accepted = wizardReducer(state, { type: 'accept-suggestion' });
    expect(accepted.suggestion).toBeNull();
    // 제안한 패키지가 기존 항목을 포함하므로 바뀌는 내용을 확인받는다.
    expect(accepted.pending).not.toBeNull();
    expect(accepted.selection.packages).toEqual(['driving-assist', 'hud']);
    const confirmed = wizardReducer(accepted, { type: 'confirm' });
    expect(confirmed.selection.packages).toEqual(['popular']);
  });

  it('주소에서 복원하며 조정한 내용은 알림으로 시작한다', () => {
    const decoded = decodeEstimate('v=1&c=GCW95KC&p=hd');
    const state = createWizardState(decoded, 'options');
    expect(state.step).toBe('options');
    expect(state.notices).toEqual(decoded.effects);
  });

  it('단계 이동과 견적 옵션 변경', () => {
    let state = wizardReducer(start(), { type: 'go', step: 'wheel' });
    state = wizardReducer(state, { type: 'quote-options', options: { region: 'jeju' } });
    expect(state.step).toBe('wheel');
    expect(state.quoteOptions).toEqual({ taxType: 'taxable', region: 'jeju' });
    expect(state.selection).toEqual(defaults());
  });
});
