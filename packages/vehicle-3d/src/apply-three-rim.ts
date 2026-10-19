import type { Object3D } from 'three';

import { applyThreePartSurface } from './apply-three-part-surface';
import type { RimFinishSwatch } from './rim-finishes';

/** 휠 림(`Wheel_Rim`)의 마감 색을 입힌다. 허브, 볼트, 브레이크 디스크는 그대로다. */
export function applyThreeRim(root: Object3D, finish: RimFinishSwatch) {
  applyThreePartSurface(root, /wheel_rim/i, 'originalRimMaterials', finish.surface);
}
