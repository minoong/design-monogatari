/** 캔버스에 그릴 때 필요한 현재 테마 정보. 토큰은 CSS 변수라 캔버스가 직접 읽지 못한다. */
export type Ink = { rgb: [number, number, number]; dark: boolean };

let probe: CanvasRenderingContext2D | null = null;

/** 요소의 `color`가 `oklch()`든 `rgb()`든 1×1 캔버스에 칠해서 sRGB 값으로 바꾼다. */
export function readInk(el: Element): Ink {
  probe ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const dark = document.documentElement.classList.contains('dark');
  if (!probe) return { rgb: dark ? [255, 255, 255] : [20, 20, 20], dark };
  probe.canvas.width = 1;
  probe.canvas.height = 1;
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = getComputedStyle(el).color;
  probe.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0] = probe.getImageData(0, 0, 1, 1).data;
  return { rgb: [r, g, b], dark };
}

/** `html.light` ↔ `html.dark` 전환(next-themes)을 알려 준다. */
export function observeTheme(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

/** 감소 모션 설정을 실시간으로 따른다. */
export function observeReducedMotion(onChange: (reduced: boolean) => void): () => void {
  const query = matchMedia('(prefers-reduced-motion: reduce)');
  const handle = () => onChange(query.matches);
  handle();
  query.addEventListener('change', handle);
  return () => query.removeEventListener('change', handle);
}

/** CSS 색 문자열을 sRGB 값으로 바꾼다. */
export function resolveCss(color: string): [number, number, number] {
  probe ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  if (!probe) return [128, 128, 128];
  probe.canvas.width = 1;
  probe.canvas.height = 1;
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = color;
  probe.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0] = probe.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}

/**
 * 도장 색을 배경 위에서 점으로 읽을 수 있게 만든다. 어두운 배경에서 검정 도장은 점이 사라지므로 밝기
 * 0.45(밝은 회색)까지만, 밝은 배경에서 흰 도장은 밝기 0.55(어두운 회색)까지만 민다. 검정·흰색까지
 * 밀지 않아야 흰 도장과 검정 도장이 같은 배경에서 계속 서로 다르게 보인다.
 */
export function legibleInk(rgb: [number, number, number], dark: boolean): [number, number, number] {
  const lum = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
  const limit = dark ? 0.45 : 0.55;
  if (dark ? lum >= limit : lum <= limit) return rgb;
  const goal = dark ? 0.6 : 0.4;
  const t = (limit - lum) / (goal - lum);
  const gray = goal * 255;
  return [
    Math.round(rgb[0] + (gray - rgb[0]) * t),
    Math.round(rgb[1] + (gray - rgb[1]) * t),
    Math.round(rgb[2] + (gray - rgb[2]) * t),
  ];
}
