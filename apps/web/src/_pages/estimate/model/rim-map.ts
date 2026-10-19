import { rimFinishById } from '@repo/vehicle-3d/rim-finishes';

import type { RimFinishId } from './types';

/** 카탈로그의 휠 마감을 3D 림 마감과 짝짓는다. id가 같고, 색 값은 림 마감 정의가 가진다. */
export function rimFinishSwatchOf(finish: RimFinishId) {
  return rimFinishById(finish);
}
