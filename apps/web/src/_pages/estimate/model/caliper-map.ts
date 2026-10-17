import { caliperById } from '@repo/vehicle-3d/calipers';

import type { CaliperId } from './types';

/** 카탈로그의 브레이크 캘리퍼를 3D 캘리퍼 색과 짝짓는다. id가 같고, 색 값은 캘리퍼 정의가 가진다. */
export function caliperSwatchOf(caliper: CaliperId) {
  return caliperById(caliper);
}
