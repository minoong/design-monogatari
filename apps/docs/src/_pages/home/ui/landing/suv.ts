/**
 * 랜딩용 가상의 SUV 옆모습. 특정 차종이 아니라 이 저장소에서 직접 그린 도형이다.
 * 오른쪽을 보고 서 있고, 좌표는 모두 `SUV_VIEW_BOX`(640 × 250) 기준이다.
 * 격자(SVG), 디더링(2D 캔버스), WebGL이 같은 도형을 읽으므로 모양을 바꾸려면 여기만 고친다.
 */

export const SUV_W = 640;
export const SUV_H = 250;
export const SUV_VIEW_BOX = `0 0 ${SUV_W} ${SUV_H}`;

/** 차체. 앞뒤 휠 아치(반지름 48)가 바닥선(y=188)에서 파여 있다. */
export const BODY_PATH =
  'M36 188 L36 148 Q36 134 50 130 L82 124 L120 80 Q128 68 146 66 L388 66 Q404 66 414 78 ' +
  'L462 116 L556 124 Q590 128 598 144 L604 170 Q606 186 592 188 L528 188 ' +
  'A48 48 0 0 0 432 188 L218 188 A48 48 0 0 0 122 188 Z';

/** 뒤쪽 창, 앞쪽 창. 차체 안쪽에 있어 evenodd로 합치면 구멍이 된다. */
export const WINDOW_PATHS = [
  'M112 118 L132 84 Q134 80 140 80 L262 80 L262 118 Z',
  'M274 80 L386 80 Q391 80 394 84 L436 118 L274 118 Z',
] as const;

export const HEADLIGHT_PATH = 'M574 132 L592 137 L595 146 L572 143 Z';
export const TAILLIGHT_PATH = 'M36 138 L49 134 L49 151 L36 151 Z';

/** 아래쪽 검은 플라스틱 보호대 */
export const CLADDING_PATH = 'M36 176 L592 176 L592 188 L36 188 Z';

export const WHEELS = [
  { cx: 170, cy: 190, r: 40 },
  { cx: 480, cy: 190, r: 40 },
] as const;

/** 문 이음선 x 좌표 (y 118 → 176) */
export const DOOR_SEAMS = [156, 266, 372] as const;

/** 손잡이 [x, y, 너비] */
export const DOOR_HANDLES = [
  [232, 130, 22],
  [334, 130, 22],
] as const;

/** 지붕 레일 [x1, x2, y] */
export const ROOF_RAIL = [156, 380, 60] as const;

export const GROUND_Y = 230;

/** 격자 표현에서 실루엣으로 쓸 하나의 경로(차체에서 창을 뺀 것 + 바퀴). */
export const SILHOUETTE_PATH = [
  BODY_PATH,
  ...WINDOW_PATHS,
  ...WHEELS.map(
    ({ cx, cy, r }) =>
      `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0 Z`,
  ),
].join(' ');
