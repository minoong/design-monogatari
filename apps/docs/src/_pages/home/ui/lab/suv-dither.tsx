'use client';

import { useEffect, useRef } from 'react';

import { bayer8, GRID_H, GRID_W, paintSuvMap } from './suv-map';
import { observeTheme, readInk } from './theme-ink';

/**
 * 표현 ②: 디더링. SUV의 밝기 지도를 한 번 그려 두고, 칸마다 Bayer 8×8 문턱값과 비교해
 * 점을 찍는다(2D 캔버스, 움직임 없음). 테마가 바뀔 때만 다시 찍는다.
 * 어두운 배경에서는 밝은 곳에 점이 몰리고, 밝은 배경에서는 어두운 곳에 몰린다.
 */
export function SuvDither({
  tone,
  wheels = true,
}: {
  tone?: 'light' | 'dark';
  /** false면 바퀴를 빼고 그린다(바퀴를 따로 굴릴 때). */
  wheels?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;

    const map = document.createElement('canvas');
    map.width = GRID_W;
    map.height = GRID_H;
    const mapCtx = map.getContext('2d', { willReadFrequently: true });
    if (!mapCtx) return;
    paintSuvMap(mapCtx, GRID_W, GRID_H, { wheels });
    const source = mapCtx.getImageData(0, 0, GRID_W, GRID_H).data;

    const draw = () => {
      const theme = readInk(canvas);
      const { rgb } = theme;
      const dark = tone ? tone === 'dark' : theme.dark;
      const out = ctx.createImageData(GRID_W, GRID_H);
      for (let y = 0; y < GRID_H; y += 1) {
        for (let x = 0; x < GRID_W; x += 1) {
          const i = (y * GRID_W + x) * 4;
          const lum = (source[i] ?? 0) / 255;
          const alpha = (source[i + 3] ?? 0) / 255;
          const ink = (dark ? lum : 1 - lum) * alpha;
          if (ink > bayer8(x, y)) {
            out.data[i] = rgb[0];
            out.data[i + 1] = rgb[1];
            out.data[i + 2] = rgb[2];
            out.data[i + 3] = 255;
          }
        }
      }
      ctx.putImageData(out, 0, 0);
    };

    draw();
    return observeTheme(draw);
  }, [tone, wheels]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="text-foreground block h-auto w-full [image-rendering:pixelated]"
      height={GRID_H}
      width={GRID_W}
    />
  );
}
