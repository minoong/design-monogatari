import { describe, expect, it } from 'vitest';

import { calculateQuote } from '../../estimate/index.model';
import { chooseInIntro, createIntroSelection } from './intro-selection';

describe('chooseInIntro', () => {
  it('고를 수 있는 항목은 그대로 반영하고 문장은 없다', () => {
    const result = chooseInIntro(createIntroSelection(), 'color', 'blue');
    expect(result.selection.color).toBe('blue');
    expect(result.sentences).toEqual([]);
    expect(result.blockedReason).toBeNull();
  });

  it('컴포트 트림에서 스포트 전용 색은 이유와 함께 막고 선택을 그대로 둔다', () => {
    const before = createIntroSelection();
    const result = chooseInIntro(before, 'color', 'bronze');
    expect(result.selection).toBe(before);
    expect(result.blockedReason).toBe('스포트 트림에서만 선택할 수 있습니다.');
  });

  it('스포트에서 컴포트로 돌아가면 함께 바뀐 항목을 문장으로 알린다', () => {
    const sport = chooseInIntro(createIntroSelection(), 'trim', 'sport').selection;
    const sportWheel = chooseInIntro(sport, 'wheel', 'w20').selection;
    const sportBronze = chooseInIntro(sportWheel, 'color', 'bronze').selection;

    const back = chooseInIntro(sportBronze, 'trim', 'comfort');
    expect(back.selection.trim).toBe('comfort');
    expect(back.selection.wheel).toBe('w19');
    expect(back.selection.color).toBe('white');
    expect(back.sentences.length).toBeGreaterThan(0);
    expect(back.blockedReason).toBeNull();
  });

  it('같은 선택을 다시 고르면 아무것도 바뀌지 않는다', () => {
    const before = createIntroSelection();
    const result = chooseInIntro(before, 'trim', 'comfort');
    expect(result.selection).toBe(before);
    expect(result.sentences).toEqual([]);
  });

  it('고른 사양의 가격이 견적 합계에 반영된다', () => {
    const base = createIntroSelection();
    const sport = chooseInIntro(base, 'trim', 'sport').selection;
    const options = { taxType: 'taxable', region: 'seoul' } as const;
    expect(calculateQuote(sport, options).total).toBeGreaterThan(
      calculateQuote(base, options).total,
    );
  });
});
