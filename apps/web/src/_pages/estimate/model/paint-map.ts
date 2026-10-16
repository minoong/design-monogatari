import { PAINT_SWATCHES, type PaintId } from '@repo/vehicle-3d/paints';

import type { ColorId } from './types';

/** 카탈로그의 외장 색을 3D 모델에 칠하는 도장과 짝짓는다. 색 값(hex)은 도장 정의가 가진다. */
export const COLOR_PAINT: Record<ColorId, PaintId> = {
  white: 'white',
  black: 'black',
  gray: 'charcoal',
  blue: 'navy',
  green: 'green',
  pearl: 'silver',
  bronze: 'taupe',
  'matte-gray': 'anthracite',
};

export function paintOf(color: ColorId) {
  const swatch = PAINT_SWATCHES.find((candidate) => candidate.id === COLOR_PAINT[color]);
  if (!swatch) throw new Error(`도장을 찾을 수 없습니다: ${color}`);
  return swatch;
}
