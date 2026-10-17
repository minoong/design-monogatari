/**
 * 실내 색. 모델의 실내에는 텍스처가 없고 음영이 정점 색에 구워져 있다. 재질 기본색만 바꾸면 그 음영 위에 색이 입혀진다.
 * 실내 재질은 `metalness`가 1이라 그대로 칠하면 구리처럼 번들거리므로 금속성을 0으로 내리고, 장면 조명이 밝아
 * 견본보다 밝게 나오므로 `color`는 보이고 싶은 색보다 어둡게 둔다(그래서 `hex`와 `color`가 다르다).
 * 칠하는 곳은 시트 가죽(`seat`), 도어 안쪽과 실내 색 라이닝(`panel`), 지붕·기둥 쪽 껍데기(`shell`)다. 대시보드와 핸들은
 * 원래대로 둔다. `shell`은 룸미러 하우징까지 칠해져서 쓰지 않는다(지붕 안감은 검정 그대로).
 */
export type InteriorSurface = {
  color: string;
  roughness: number;
  metalness: number;
  /** 반사 세기(0~1). 낮출수록 가죽처럼 무광에 가깝다. 높으면 장면 조명의 흰 반사가 색 위에 덧씌워져 색이 바랜다. */
  specular: number;
};

/** seat 시트 가죽, panel 도어 안쪽과 실내 색 라이닝, shell 지붕 안감과 기둥(A·B·C), wheel 핸들, dash 대시보드 */
export type InteriorRole = 'seat' | 'panel' | 'shell' | 'wheel' | 'dash';

export type InteriorSwatch = {
  id: string;
  label: string;
  /** 칩이나 목록에 보이는 색. 3D에 칠하는 `color`와 다르다. */
  hex: string;
  /** null 이면 모델 원래 실내(검정)로 둔다. */
  surfaces: Partial<Record<InteriorRole, InteriorSurface>> | null;
  /**
   * 실내에 들어갔을 때 더하는 조명. 검정은 모델 원래 재질(금속성 1)이라 환경광을 올려야 형태가 보이지만, 밝은 가죽에는
   * 같은 조명이 그대로 곱해져 전부 하얗게 날아간다. 그래서 실내 색마다 따로 둔다.
   */
  cabinLight: { intensity: number; environment: number };
};

export const INTERIOR_SWATCHES = [
  {
    id: 'black',
    label: '블랙',
    hex: '#1d1d1f',
    // 시트와 대시보드는 모델 원래 검정이다. 도어 안쪽과 지붕 안감은 원래 밝은 회색이라 검은 실내에서 흰색으로 날아가므로
    // 어둡게 칠하고, 그만큼 실내 조명도 줄인다(조명이 세면 안감이 회색으로 떠 보인다).
    surfaces: { panel: { color: '#111113', roughness: 0.9, metalness: 0, specular: 0.1 } },
    cabinLight: { intensity: 1.5, environment: 1.3 },
  },
  {
    id: 'cream',
    label: '크림',
    hex: '#d9cdb4',
    // 아이보리·베이지 실내처럼 시트, 도어, 지붕 안감, 기둥을 밝게 두고 대시보드와 핸들은 검게 둔다. 실내 환경광을 강하게 주면
    // 색이 하얗게 날아가고 푸른 기가 돌아서, 환경광을 줄이고 색은 따뜻한 쪽으로 잡았다(보이는 색이 `hex`에 가깝다).
    surfaces: {
      seat: { color: '#e0c89a', roughness: 0.9, metalness: 0, specular: 0.1 },
      panel: { color: '#d4bf92', roughness: 0.9, metalness: 0, specular: 0.1 },
      shell: { color: '#e0c89a', roughness: 0.95, metalness: 0, specular: 0.1 },
    },
    cabinLight: { intensity: 0, environment: 0.75 },
  },
  {
    id: 'brown',
    label: '브라운',
    hex: '#6e4b33',
    // 코냑·모카 실내처럼 시트와 도어를 갈색으로, 핸들과 기둥은 어두운 갈색으로, 대시보드는 검게 둔다.
    surfaces: {
      seat: { color: '#7a4a2c', roughness: 0.9, metalness: 0, specular: 0.2 },
      panel: { color: '#6b4128', roughness: 0.9, metalness: 0, specular: 0.2 },
      wheel: { color: '#2b1a10', roughness: 0.6, metalness: 0, specular: 0.3 },
      shell: { color: '#2a2018', roughness: 0.95, metalness: 0, specular: 0.1 },
    },
    cabinLight: { intensity: 0, environment: 0.9 },
  },
] as const satisfies readonly InteriorSwatch[];

export type InteriorId = (typeof INTERIOR_SWATCHES)[number]['id'];

export function interiorById(id: InteriorId) {
  return INTERIOR_SWATCHES.find((swatch) => swatch.id === id) ?? INTERIOR_SWATCHES[0];
}
