import type { WheelId } from './types';

/** 카탈로그의 휠을 3D 모델에 반영할 휠 크기(인치)와 짝짓는다. 휠 모양(스포크)은 한 가지뿐이고 림과 타이어 옆면 비율만 달라진다. */
export const WHEEL_INCH: Record<WheelId, number> = {
  w19: 19,
  w20: 20,
  w21: 21,
};
