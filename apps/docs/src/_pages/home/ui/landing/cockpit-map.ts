/** 창틀 안 계기판 그림의 칸 수. SUV 앞뒤 창(x 112~436, y 80~118)의 가로세로와 같아서 1칸이 도형 좌표 1이다. */
export const COCKPIT_W = 324;
export const COCKPIT_H = 38;

/** 채널 약속은 `suv-map.ts`와 같다(R = 밝기, A = 있는 곳). 여기서는 밝기만 쓴다. */
function lum(value: number, alpha = 1) {
  const v = Math.round(value * 255);
  return `rgba(${v},${v},${v},${alpha})`;
}

/**
 * 창 안으로 들여다보이는 계기판. 왼쪽 창(0~150)에는 뒷좌석과 화면, 오른쪽 창(162~324)에는 핸들과
 * 계기판 두 개와 견적 합계 표시를 그린다. 점이 어디에 몰리는지만 중요하므로 밝기 값으로만 그린다.
 */
export function paintCockpitMap(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.scale(width / COCKPIT_W, height / COCKPIT_H);

  // 유리 바탕: 아주 옅게 점이 깔린다
  ctx.fillStyle = lum(0.1);
  ctx.fillRect(0, 0, COCKPIT_W, COCKPIT_H);

  // 뒷좌석: 머리받침과 등받이, 옆의 화면
  ctx.fillStyle = lum(0.5);
  ctx.beginPath();
  ctx.roundRect(58, 6, 22, 14, 5);
  ctx.fill();
  ctx.fillStyle = lum(0.36);
  ctx.beginPath();
  ctx.moveTo(52, 38);
  ctx.lineTo(58, 20);
  ctx.lineTo(86, 20);
  ctx.lineTo(96, 38);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = lum(0.7);
  ctx.lineWidth = 1.2;
  ctx.strokeRect(12, 8, 34, 18);
  ctx.beginPath();
  ctx.moveTo(14, 22);
  ctx.lineTo(24, 16);
  ctx.lineTo(32, 20);
  ctx.lineTo(44, 11);
  ctx.stroke();

  // 대시보드: 오른쪽 창 아래쪽이 비스듬히 올라온다
  ctx.fillStyle = lum(0.28);
  ctx.beginPath();
  ctx.moveTo(162, 38);
  ctx.lineTo(162, 30);
  ctx.lineTo(324, 24);
  ctx.lineTo(324, 38);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = lum(0.85);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(162, 30);
  ctx.lineTo(324, 24);
  ctx.stroke();

  // 핸들: 링, 세 개의 살, 가운데 허브
  const wx = 200;
  const wy = 19;
  ctx.strokeStyle = lum(0.9);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(wx, wy, 13, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(wx - 13, wy);
  ctx.lineTo(wx + 13, wy);
  ctx.moveTo(wx, wy);
  ctx.lineTo(wx, wy + 13);
  ctx.stroke();
  ctx.fillStyle = lum(0.65);
  ctx.beginPath();
  ctx.arc(wx, wy, 3.4, 0, Math.PI * 2);
  ctx.fill();

  // 계기판 두 개: 눈금 링과 바늘
  for (const [gx, angle] of [
    [252, -0.9],
    [292, 0.5],
  ] as const) {
    const gy = 15;
    ctx.strokeStyle = lum(0.8);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(gx, gy, 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 9; i += 1) {
      const a = Math.PI * (0.75 + (i / 8) * 1.5);
      ctx.moveTo(gx + Math.cos(a) * 6.4, gy + Math.sin(a) * 6.4);
      ctx.lineTo(gx + Math.cos(a) * 8, gy + Math.sin(a) * 8);
    }
    ctx.stroke();
    ctx.strokeStyle = lum(1);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx + Math.cos(angle - Math.PI / 2) * 6.5, gy + Math.sin(angle - Math.PI / 2) * 6.5);
    ctx.stroke();
  }

  // 견적 합계 표시(작은 숫자판)
  ctx.fillStyle = lum(0.95);
  ctx.font = 'bold 6px monospace';
  ctx.textBaseline = 'top';
  ctx.fillText('93,200,000', 236, 2);

  ctx.restore();
}
