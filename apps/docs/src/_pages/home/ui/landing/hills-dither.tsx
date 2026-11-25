'use client';

import { useEffect, useRef } from 'react';

import { bayer8 } from './suv-map';
import { observeTheme, readInk } from './theme-ink';

const W = 480;
const H = 140;

/** 멀리 있는 언덕(옅음)과 가까운 언덕(진함). 같은 Bayer 문턱값으로 찍는다. */
function paint(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, W, H);
  const layers = [
    { base: 70, amp: 18, freq: 0.012, phase: 0.6, value: 0.28 },
    { base: 96, amp: 14, freq: 0.02, phase: 2.1, value: 0.5 },
    { base: 122, amp: 8, freq: 0.035, phase: 4.2, value: 0.78 },
  ];
  for (const layer of layers) {
    ctx.fillStyle = `rgba(${Math.round(layer.value * 255)},0,0,1)`;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 4) {
      const y =
        layer.base +
        Math.sin(x * layer.freq + layer.phase) * layer.amp +
        Math.sin(x * layer.freq * 2.3 + layer.phase) * layer.amp * 0.3;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();
  }
}

/** 닫는 구역의 먼 풍경. 카메라가 물러날 때 차보다 천천히 줄어들어 깊이를 만든다. */
export function HillsDither({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;
    const map = document.createElement('canvas');
    map.width = W;
    map.height = H;
    const mapCtx = map.getContext('2d', { willReadFrequently: true });
    if (!mapCtx) return;
    paint(mapCtx);
    const source = mapCtx.getImageData(0, 0, W, H).data;

    const draw = () => {
      const { rgb, dark } = readInk(canvas);
      const out = ctx.createImageData(W, H);
      for (let y = 0; y < H; y += 1) {
        for (let x = 0; x < W; x += 1) {
          const i = (y * W + x) * 4;
          const value = (source[i] ?? 0) / 255;
          const alpha = (source[i + 3] ?? 0) / 255;
          const ink = (dark ? value : 1 - value * 0.75) * alpha;
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
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`text-foreground/70 block h-auto w-full [image-rendering:pixelated] ${className}`}
      height={H}
      width={W}
    />
  );
}
