import type { Won } from './types';

/** 화면 가장자리에서만 쓰는 원화 표기. 모델 안에서는 정수 그대로 다룬다. */
export function formatWon(amount: Won): string {
  if (!Number.isInteger(amount)) throw new Error(`금액은 정수여야 합니다: ${amount}`);
  const sign = amount < 0 ? '-' : '';
  const digits = String(Math.abs(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${sign}${digits}원`;
}
