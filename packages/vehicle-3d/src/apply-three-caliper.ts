import type { Object3D } from 'three';

import { applyThreePartSurface } from './apply-three-part-surface';
import type { CaliperSwatch } from './calipers';

/** 브레이크 캘리퍼(`Brake_Caliper`) 색을 입힌다. */
export function applyThreeCaliper(root: Object3D, caliper: CaliperSwatch) {
  applyThreePartSurface(root, /brake_caliper/i, 'originalCaliperMaterials', caliper.surface);
}
