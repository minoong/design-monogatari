import type { Won } from './types';

/** 화면 가장자리에서만 쓰는 원화 표기("₩1,500,000"). 모델 안에서는 정수 그대로 다룬다. */
export function formatWon(amount: Won): string {
  if (!Number.isInteger(amount)) throw new Error(`금액은 정수여야 합니다: ${amount}`);
  const sign = amount < 0 ? '-' : '';
  const digits = String(Math.abs(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${sign}₩${digits}`;
}

const DIGIT_HAS_BATCHIM = [true, true, false, true, false, false, true, true, true, false];

function lastBatchim(word: string): { has: boolean; isRieul: boolean } {
  for (const char of [...word.trim()].reverse()) {
    const code = char.codePointAt(0)!;
    if (code >= 0xac00 && code <= 0xd7a3) {
      const jong = (code - 0xac00) % 28;
      return { has: jong !== 0, isRieul: jong === 8 };
    }
    if (char >= '0' && char <= '9') {
      const digit = Number(char);
      return { has: DIGIT_HAS_BATCHIM[digit]!, isRieul: digit === 1 || digit === 7 || digit === 8 };
    }
    if (/[A-Za-z]/.test(char)) return { has: false, isRieul: false };
  }
  return { has: false, isRieul: false };
}

const JOSA = {
  '은/는': ['은', '는'],
  '이/가': ['이', '가'],
  '을/를': ['을', '를'],
  '와/과': ['과', '와'],
  '으로/로': ['으로', '로'],
} as const;

/** 받침에 맞는 조사를 붙인다 (예: `josa('휠', '을/를')` → `휠을`). 한글과 숫자로 끝나는 말을 다룬다. */
export function josa(word: string, kind: keyof typeof JOSA): string {
  const { has, isRieul } = lastBatchim(word);
  const [withBatchim, withoutBatchim] = JOSA[kind];
  if (kind === '으로/로') return `${word}${has && !isRieul ? withBatchim : withoutBatchim}`;
  return `${word}${has ? withBatchim : withoutBatchim}`;
}
