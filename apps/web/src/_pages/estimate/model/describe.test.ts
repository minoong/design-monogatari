import { describe, expect, it } from 'vitest';

import { describeEffect } from './describe';
import { josa } from './format';
import { defaults } from './helpers.test-util';
import { resolveSelection } from './resolve';

describe('josa', () => {
  it('받침에 맞는 조사를 붙인다', () => {
    expect(josa('휠', '을/를')).toBe('휠을');
    expect(josa('시트', '을/를')).toBe('시트를');
    expect(josa('디스플레이', '이/가')).toBe('디스플레이가');
    expect(josa('패키지', '은/는')).toBe('패키지는');
    expect(josa('휠', '와/과')).toBe('휠과');
    expect(josa('컴포트', '와/과')).toBe('컴포트와');
  });

  it('으로/로는 ㄹ 받침과 받침 없음에 로를 쓴다', () => {
    expect(josa('19인치 기본 휠', '으로/로')).toBe('19인치 기본 휠로');
    expect(josa('스포트', '으로/로')).toBe('스포트로');
    expect(josa('우드', '으로/로')).toBe('우드로');
    expect(josa('블랙 내장', '으로/로')).toBe('블랙 내장으로');
  });

  it('숫자로 끝나는 말은 읽는 소리의 받침을 따른다', () => {
    expect(josa('X5', '이/가')).toBe('X5가');
    expect(josa('옵션1', '이/가')).toBe('옵션1이');
    expect(josa('옵션3', '을/를')).toBe('옵션3을');
  });
});

describe('describeEffect', () => {
  const sport = resolveSelection(defaults(), { type: 'set', slot: 'trim', id: 'sport' }).next;
  const withWheel = resolveSelection(sport, { type: 'set', slot: 'wheel', id: 'w20' }).next;
  const toComfort = resolveSelection(withWheel, { type: 'set', slot: 'trim', id: 'comfort' });

  it('조사 자리표시(을(를), 이(가) 등)가 문장에 남지 않는다', () => {
    const results = [
      resolveSelection(defaults(), { type: 'set', slot: 'seat', id: 'four' }),
      resolveSelection(defaults(), { type: 'add', slot: 'packages', id: 'popular' }),
      toComfort,
    ];
    for (const result of results) {
      for (const effect of result.effects) {
        expect(describeEffect(effect)).not.toMatch(/\(를\)|\(은\)|\(가\)|\(이\)|\(으\)|이\(가\)/);
      }
    }
  });

  it('확인 전 변경은 현재형, 이미 반영된 변경은 과거형이다', () => {
    const effect = toComfort.effects.find((candidate) => candidate.kind === 'remapped')!;
    expect(describeEffect(effect, undefined, 'pending')).toBe(
      '휠을 20인치 알로이 휠에서 19인치 기본 휠로 바꿉니다.',
    );
    expect(describeEffect(effect, undefined, 'done')).toBe(
      '휠을 20인치 알로이 휠에서 19인치 기본 휠로 바꿨습니다.',
    );
  });

  it('패키지를 푸는 문장에서 패키지가 겹쳐 나오지 않는다', () => {
    const popular = resolveSelection(defaults(), {
      type: 'add',
      slot: 'packages',
      id: 'popular',
    }).next;
    const ungroup = resolveSelection(popular, { type: 'remove', slot: 'packages', id: 'hud' });
    const effect = ungroup.effects.find((candidate) => candidate.kind === 'replaced')!;
    expect(describeEffect(effect, undefined, 'pending')).not.toContain('패키지 패키지');
  });
});
