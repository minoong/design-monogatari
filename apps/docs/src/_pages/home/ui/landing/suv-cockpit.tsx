'use client';

import { useEffect, useRef } from 'react';

import { COCKPIT_H, COCKPIT_W, paintCockpitMap } from './cockpit-map';
import { bayer8 } from './suv-map';
import { observeTheme, readInk } from './theme-ink';

/**
 * 창 안 계기판 그림. SUV 창 모양으로 잘려 차 위에 얹힌다(자르기는 바깥에서 한다).
 * `suv-dither.tsx`와 같은 방식(밝기 지도 → Bayer 8×8)이고 해상도만 더 곱다. 테마가 바뀔 때만 다시 찍는다.
 */
export function SuvCockpit({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;

    const map = document.createElement('canvas');
    map.width = COCKPIT_W;
    map.height = COCKPIT_H;
    const mapCtx = map.getContext('2d', { willReadFrequently: true });
    if (!mapCtx) return;
    paintCockpitMap(mapCtx, COCKPIT_W, COCKPIT_H);
    const source = mapCtx.getImageData(0, 0, COCKPIT_W, COCKPIT_H).data;

    const draw = () => {
      const { rgb, dark } = readInk(canvas);
      const out = ctx.createImageData(COCKPIT_W, COCKPIT_H);
      for (let y = 0; y < COCKPIT_H; y += 1) {
        for (let x = 0; x < COCKPIT_W; x += 1) {
          const i = (y * COCKPIT_W + x) * 4;
          const value = (source[i] ?? 0) / 255;
          const alpha = (source[i + 3] ?? 0) / 255;
          if ((dark ? value : 1 - value) * alpha > bayer8(x, y)) {
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
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`text-foreground block size-full [image-rendering:pixelated] ${className}`}
      height={COCKPIT_H}
      width={COCKPIT_W}
    />
  );
}
