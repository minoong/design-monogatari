/** 이 비율(가로/세로) 이상이면 시야각을 그대로 쓴다. */
const WIDE_ASPECT = 1.5;

/**
 * 캔버스가 세로로 길어지면(가로/세로 비율이 낮아지면) 세로 시야각을 넓혀 차의 가로 폭이 잘리지 않게 한다.
 * 가로 시야는 비율 1.5일 때와 같게 유지한다. `baseFov`는 시점마다 정한 세로 시야각(도)이다.
 */
export function fovForAspect(baseFov: number, aspect: number) {
  if (aspect <= 0) return baseFov;
  const base = (baseFov * Math.PI) / 360;
  const scale = Math.max(1, WIDE_ASPECT / aspect);
  return (2 * Math.atan(Math.tan(base) * scale) * 180) / Math.PI;
}
