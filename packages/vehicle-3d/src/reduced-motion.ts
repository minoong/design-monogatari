/** 감소 모션 설정인지. 움직임을 시작할 때마다 읽어서, 켠 채로 설정을 바꿔도 따라간다. */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
