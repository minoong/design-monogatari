/**
 * 휠 림의 마감 색. 모델의 림(`Wheel_Rim`)은 기본색이 거의 검정이고 거칠기 0의 금속이라 거울처럼 까맣게 보인다(그래서 `standard`는
 * 모델 원래 그대로 두고 칩도 어둡게 한다). 휠 모양은 한 가지이고 색만 바꾼다.
 */
export type RimFinishSwatch = {
  id: string;
  label: string;
  /** 칩이나 목록에 보이는 색 */
  hex: string;
  /** null 이면 모델 원래 림(광택 검정)으로 둔다. */
  surface: { color: string; roughness: number; metalness: number } | null;
};

export const RIM_FINISH_SWATCHES = [
  { id: 'standard', label: '기본', hex: '#1a1a1c', surface: null },
  {
    id: 'silver',
    label: '실버',
    hex: '#c4c7cc',
    surface: { color: '#c4c7cc', roughness: 0.25, metalness: 0.9 },
  },
  {
    id: 'gray',
    label: '오빗 그레이',
    hex: '#6f7378',
    surface: { color: '#6f7378', roughness: 0.3, metalness: 0.85 },
  },
  {
    id: 'bronze',
    label: '브론즈',
    hex: '#9a7348',
    surface: { color: '#9a7348', roughness: 0.3, metalness: 0.9 },
  },
] as const satisfies readonly RimFinishSwatch[];

export type RimFinishId = (typeof RIM_FINISH_SWATCHES)[number]['id'];

export function rimFinishById(id: RimFinishId) {
  return RIM_FINISH_SWATCHES.find((swatch) => swatch.id === id) ?? RIM_FINISH_SWATCHES[0];
}
