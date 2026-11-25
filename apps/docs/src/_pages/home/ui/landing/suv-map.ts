import {
  BODY_PATH,
  CLADDING_PATH,
  DOOR_HANDLES,
  DOOR_SEAMS,
  GROUND_Y,
  HEADLIGHT_PATH,
  ROOF_RAIL,
  SUV_H,
  SUV_W,
  TAILLIGHT_PATH,
  WHEELS,
  WINDOW_PATHS,
} from './suv';

/** 디더링이 한 칸으로 읽는 해상도. 화면에서는 CSS로 키우고 `image-rendering: pixelated`로 각지게 둔다. */
export const GRID_W = 320;
export const GRID_H = Math.round((GRID_W * SUV_H) / SUV_W);

/**
 * 8×8 Bayer 문턱값(0~1). 값 하나를 정하는 식이 셰이더의 `bayer8`와 같다.
 * 비트마다 `2*(x^y) + y`를 읽고 낮은 비트일수록 높은 자리에 놓는다.
 */
export function bayer8(x: number, y: number): number {
  let v = 0;
  for (let i = 0; i < 3; i += 1) {
    const xb = (x >> i) & 1;
    const yb = (y >> i) & 1;
    v += (2 * (xb ^ yb) + yb) * 4 ** (2 - i);
  }
  return (v + 0.5) / 64;
}

/** 채널 약속: R = 밝기, G = 광택(빛이 쓸고 지나갈 곳), B = 차체(도장 색이 칠해질 곳), A = 있는 곳 */
function px(lum: number, gloss = 0, alpha = 1, body = 0) {
  return `rgba(${Math.round(lum * 255)},${Math.round(gloss * 255)},${Math.round(body * 255)},${alpha})`;
}

function gradient(
  ctx: CanvasRenderingContext2D,
  y0: number,
  y1: number,
  stops: [number, string][],
) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  for (const [at, color] of stops) g.addColorStop(at, color);
  return g;
}

/**
 * SUV의 밝기 지도를 캔버스에 그린다. 디더링은 이 지도를 문턱값과 비교해 점을 찍는다.
 * 위쪽(지붕)이 가장 밝고 아래로 갈수록 어둡고, 어깨선에 가늘고 밝은 띠가 한 줄 지나간다.
 */
export function paintSuvMap(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  { wheels = true }: { wheels?: boolean } = {},
) {
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.scale(width / SUV_W, height / SUV_H);

  // 바닥 그림자
  ctx.fillStyle = px(0.5, 0, 0.5);
  ctx.beginPath();
  ctx.ellipse(320, GROUND_Y + 2, 292, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // 차체
  const body = new Path2D(BODY_PATH);
  ctx.save();
  ctx.clip(body);
  ctx.fillStyle = gradient(ctx, 66, 188, [
    [0, px(0.95, 1, 1, 1)],
    [0.45, px(0.78, 1, 1, 1)],
    [0.62, px(0.5, 0.9, 1, 1)],
    [1, px(0.3, 0.6, 1, 1)],
  ]);
  ctx.fillRect(0, 0, SUV_W, SUV_H);
  // 어깨선과 보닛 위에 밝은 띠
  ctx.fillStyle = gradient(ctx, 120, 140, [
    [0, px(0.7, 1, 0, 1)],
    [0.5, px(1, 1, 1, 1)],
    [1, px(0.7, 1, 0, 1)],
  ]);
  ctx.fillRect(40, 120, 560, 20);
  // 보호대
  ctx.fillStyle = px(0.16, 0.1);
  ctx.fill(new Path2D(CLADDING_PATH));
  ctx.restore();

  // 창
  for (const d of WINDOW_PATHS) {
    const win = new Path2D(d);
    ctx.fillStyle = px(0.1, 1);
    ctx.fill(win);
    ctx.save();
    ctx.clip(win);
    ctx.fillStyle = px(0.42, 1, 0.9);
    ctx.beginPath();
    ctx.moveTo(150, 120);
    ctx.lineTo(176, 78);
    ctx.lineTo(196, 78);
    ctx.lineTo(170, 120);
    ctx.closePath();
    ctx.moveTo(300, 120);
    ctx.lineTo(326, 78);
    ctx.lineTo(346, 78);
    ctx.lineTo(320, 120);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 등
  ctx.fillStyle = px(1, 1);
  ctx.fill(new Path2D(HEADLIGHT_PATH));
  ctx.fillStyle = px(0.85, 1);
  ctx.fill(new Path2D(TAILLIGHT_PATH));

  // 문 이음선, 손잡이, 지붕 레일
  ctx.strokeStyle = px(0.12);
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  for (const x of DOOR_SEAMS) {
    ctx.moveTo(x, 118);
    ctx.lineTo(x, 176);
  }
  ctx.stroke();
  ctx.fillStyle = px(0.15);
  for (const [x, y, w] of DOOR_HANDLES) ctx.fillRect(x, y, w, 4);
  const [rx1, rx2, ry] = ROOF_RAIL;
  ctx.strokeStyle = px(0.25, 0.4);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(rx1, ry);
  ctx.lineTo(rx2, ry);
  ctx.stroke();

  // 바퀴(따로 굴릴 때는 그리지 않는다)
  for (const { cx, cy, r } of wheels ? WHEELS : []) {
    ctx.fillStyle = px(0.06);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = px(0.75, 0.9);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.66, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < 5; i += 1) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * r * 0.62, cy + Math.sin(a) * r * 0.62);
    }
    ctx.stroke();
    ctx.fillStyle = px(0.9, 1);
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/** 바퀴 한 개의 칸 수. 도형 좌표 2가 한 칸이라 지름 80(반지름 40)이 40칸이다. */
export const WHEEL_CELLS = 40;

/**
 * 따로 굴리는 바퀴의 밝기 지도. 차체 지도의 바퀴와 같은 모양에, 돌아가는 것이 보이도록 타이어 무늬와
 * 밸브 표시 하나(대칭이 아닌 점)를 더했다. 5개 살은 72도마다 같아 보여서 이 표시가 없으면 회전이 안 읽힌다.
 */
export function paintWheelMap(ctx: CanvasRenderingContext2D, size: number) {
  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.scale(size / 80, size / 80);

  ctx.fillStyle = px(0.06);
  ctx.beginPath();
  ctx.arc(0, 0, 40, 0, Math.PI * 2);
  ctx.fill();

  // 타이어 무늬: 가장자리의 짧은 홈 열두 개
  ctx.strokeStyle = px(0.42);
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    ctx.moveTo(Math.cos(a) * 33, Math.sin(a) * 33);
    ctx.lineTo(Math.cos(a) * 38.5, Math.sin(a) * 38.5);
  }
  ctx.stroke();

  ctx.strokeStyle = px(0.75, 0.9);
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 26.4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * 24.8, Math.sin(a) * 24.8);
  }
  ctx.stroke();
  ctx.fillStyle = px(0.9, 1);
  ctx.beginPath();
  ctx.arc(0, 0, 6.4, 0, Math.PI * 2);
  ctx.fill();

  // 밸브 표시: 림 바깥쪽의 밝은 점 하나
  ctx.fillStyle = px(1);
  ctx.beginPath();
  ctx.arc(0, -29.5, 3.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
