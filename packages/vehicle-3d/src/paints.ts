export const PAINT_SWATCHES = [
  {
    id: 'red',
    label: '레드',
    hex: '#6B1D22',
    bumperHex: '#141416',
    metalness: 0.84,
    roughness: 0.22,
    clearcoat: 1,
  },
  {
    id: 'black',
    label: '블랙',
    hex: '#1C1C1E',
    bumperHex: '#2A2A2C',
    metalness: 0.72,
    roughness: 0.28,
    clearcoat: 1,
  },
  {
    id: 'charcoal',
    label: '차콜',
    hex: '#3E4145',
    bumperHex: '#1A1B1D',
    metalness: 0.86,
    roughness: 0.24,
    clearcoat: 1,
  },
  {
    id: 'taupe',
    label: '토프',
    hex: '#9A9084',
    bumperHex: '#2A2622',
    metalness: 0.78,
    roughness: 0.26,
    clearcoat: 1,
  },
  {
    id: 'silver',
    label: '실버',
    hex: '#8B9096',
    bumperHex: '#2C3036',
    metalness: 0.9,
    roughness: 0.2,
    clearcoat: 1,
  },
  {
    id: 'green',
    label: '그린',
    hex: '#1A2822',
    bumperHex: '#121614',
    metalness: 0.8,
    roughness: 0.26,
    clearcoat: 1,
  },
  {
    id: 'white',
    label: '화이트',
    hex: '#F2F2F0',
    bumperHex: '#1A1A1C',
    metalness: 0.38,
    roughness: 0.16,
    clearcoat: 1,
  },
  {
    id: 'navy',
    label: '네이비',
    hex: '#152048',
    bumperHex: '#10141C',
    metalness: 0.7,
    roughness: 0.24,
    clearcoat: 1,
  },
  {
    id: 'anthracite',
    label: '앤트러사이트',
    hex: '#3A3C3E',
    bumperHex: '#1A1B1D',
    metalness: 0.74,
    roughness: 0.3,
    clearcoat: 1,
  },
  {
    // 따뜻한 흰색 진주빛. 화이트보다 살짝 어둡고 금속감이 있어 둘이 나란히 놓여도 구분된다.
    id: 'pearl',
    label: '펄 화이트',
    hex: '#E6DFCF',
    bumperHex: '#1A1A1C',
    metalness: 0.55,
    roughness: 0.22,
    clearcoat: 1,
  },
  {
    // 광택층 없이 거친 무광 마감. 앤트러사이트(광택)와 구분된다.
    id: 'matte-gray',
    label: '무광 그레이',
    hex: '#5B5F64',
    bumperHex: '#1A1B1D',
    metalness: 0.18,
    roughness: 0.8,
    clearcoat: 0,
  },
] as const;

export type PaintId = (typeof PAINT_SWATCHES)[number]['id'];
export type PaintSwatch = (typeof PAINT_SWATCHES)[number];

export function paintById(id: PaintId) {
  return PAINT_SWATCHES.find((item) => item.id === id) ?? PAINT_SWATCHES[0];
}
