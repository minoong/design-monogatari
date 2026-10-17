/**
 * 브레이크 캘리퍼 색. 모델의 캘리퍼(`Brake_Caliper`)는 도장 재질 하나라 재질 기본색만 바꾸면 된다. 실제 제조사 관행(BMW 파랑·빨강, 아우디·AMG·렉서스 빨강,
 * 포르쉐 노랑·검정, 폴스타·BMW 카본 세라믹 금색)에서 고른 색이다. 휠 시점에서 림 살 사이로
 * 보이는 작은 부품이라 채도를 높게 잡았다.
 */
export type CaliperSwatch = {
  id: string;
  label: string;
  /** 칩이나 목록에 보이는 색 */
  hex: string;
  /** null 이면 모델 원래 캘리퍼로 둔다(모델 원래 캘리퍼는 거의 검정). */
  surface: { color: string; roughness: number; metalness: number } | null;
};

export const CALIPER_SWATCHES = [
  // 모델 원래 캘리퍼는 기본색이 거의 검정이고 거칠기 0의 금속이라 거울처럼 까맣게 보였다. 실제 차의 기본 캘리퍼(무도장 회색)처럼
  // 보이도록 은회색 도장으로 칠한다. 칩 색과 3D가 같아야 한다.
  {
    id: 'standard',
    label: '기본',
    hex: '#8a8d91',
    surface: { color: '#8a8d91', roughness: 0.45, metalness: 0.5 },
  },
  {
    id: 'blue',
    label: '블루',
    hex: '#1f55c8',
    surface: { color: '#1f55c8', roughness: 0.35, metalness: 0.2 },
  },
  {
    id: 'red',
    label: '레드',
    hex: '#c8102e',
    surface: { color: '#c8102e', roughness: 0.35, metalness: 0.2 },
  },
  {
    id: 'black',
    label: '블랙',
    hex: '#1a1a1c',
    surface: { color: '#222225', roughness: 0.4, metalness: 0.3 },
  },
  {
    id: 'yellow',
    label: '옐로',
    hex: '#f2c200',
    // 금속성을 낮추고 색을 더 진하게 잡는다. 같은 값이면 환경 반사의 푸른 기가 섞여 겨자색으로 탁해졌다.
    surface: { color: '#ffd400', roughness: 0.3, metalness: 0.05 },
  },
  {
    id: 'gold',
    label: '골드',
    hex: '#b8963e',
    surface: { color: '#b8963e', roughness: 0.3, metalness: 0.6 },
  },
] as const satisfies readonly CaliperSwatch[];

export type CaliperId = (typeof CALIPER_SWATCHES)[number]['id'];

export function caliperById(id: CaliperId) {
  return CALIPER_SWATCHES.find((swatch) => swatch.id === id) ?? CALIPER_SWATCHES[0];
}
