/** WCAG 2.x 상대 휘도와 대비 비율. 불투명한 #rrggbb 만 다룬다 */

function channel(value: number) {
  const s = value / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));
  return 0.2126 * channel(r!) + 0.7152 * channel(g!) + 0.0722 * channel(b!);
}

export function isOpaqueHex(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value);
}

/** 두 색의 대비 비율. 둘 중 하나라도 불투명 hex 가 아니면 null */
export function contrastRatio(a: string, b: string): number | null {
  if (!isOpaqueHex(a) || !isOpaqueHex(b)) {
    return null;
  }
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light! + 0.05) / (dark! + 0.05);
}
