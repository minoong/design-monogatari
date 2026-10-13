'use client';

import { useState } from 'react';

export const PAINT_CHECK = '#3EC6E8';

export const PAINT_SWATCHES = [
  {
    id: 'red',
    label: '레드',
    hex: '#6B1D22',
    bumperHex: '#141416',
    metalness: 0.84,
    roughness: 0.22,
  },
  {
    id: 'black',
    label: '블랙',
    hex: '#1C1C1E',
    bumperHex: '#2A2A2C',
    metalness: 0.72,
    roughness: 0.28,
  },
  {
    id: 'charcoal',
    label: '차콜',
    hex: '#3E4145',
    bumperHex: '#1A1B1D',
    metalness: 0.86,
    roughness: 0.24,
  },
  {
    id: 'taupe',
    label: '토프',
    hex: '#9A9084',
    bumperHex: '#2A2622',
    metalness: 0.78,
    roughness: 0.26,
  },
  {
    id: 'silver',
    label: '실버',
    hex: '#8B9096',
    bumperHex: '#2C3036',
    metalness: 0.9,
    roughness: 0.2,
  },
  {
    id: 'green',
    label: '그린',
    hex: '#1A2822',
    bumperHex: '#121614',
    metalness: 0.8,
    roughness: 0.26,
  },
  {
    id: 'white',
    label: '화이트',
    hex: '#F2F2F0',
    bumperHex: '#1A1A1C',
    metalness: 0.38,
    roughness: 0.16,
  },
  {
    id: 'navy',
    label: '네이비',
    hex: '#152048',
    bumperHex: '#10141C',
    metalness: 0.7,
    roughness: 0.24,
  },
  {
    id: 'anthracite',
    label: '앤트러사이트',
    hex: '#3A3C3E',
    bumperHex: '#1A1B1D',
    metalness: 0.74,
    roughness: 0.3,
  },
] as const;

export type PaintId = (typeof PAINT_SWATCHES)[number]['id'];
export type PaintSwatch = (typeof PAINT_SWATCHES)[number];

export function paintById(id: PaintId) {
  return PAINT_SWATCHES.find((item) => item.id === id) ?? PAINT_SWATCHES[0];
}

export function usePaintSelection() {
  const [paintId, setPaintId] = useState<PaintId>('red');
  const paint = paintById(paintId);

  return { paintId, setPaintId, paint };
}
