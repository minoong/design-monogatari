import { interiorById } from '@repo/vehicle-3d/interiors';

import type { InteriorId } from './types';

/** 카탈로그의 내장 색을 3D 실내 색과 짝짓는다. id가 같고, 색 값은 실내 정의가 가진다. */
export function interiorSwatchOf(interior: InteriorId) {
  return interiorById(interior);
}
