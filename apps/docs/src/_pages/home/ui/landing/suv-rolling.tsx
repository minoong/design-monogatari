'use client';

import { type CSSProperties, useEffect, useRef } from 'react';

import { WHEELS } from './suv';
import { SuvDither } from './suv-dither';
import { bayer8, paintWheelMap, WHEEL_CELLS } from './suv-map';
import { observeTheme, readInk } from './theme-ink';

/** 바퀴 한 개. 밝기 지도를 Bayer로 찍은 정사각형 캔버스이고, 돌리는 것은 바깥(CSS `rotate`)에서 한다. */
function SuvWheel({ className = '', style }: { className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;
    const map = document.createElement('canvas');
    map.width = WHEEL_CELLS;
    map.height = WHEEL_CELLS;
    const mapCtx = map.getContext('2d', { willReadFrequently: true });
    if (!mapCtx) return;
    paintWheelMap(mapCtx, WHEEL_CELLS);
    const source = mapCtx.getImageData(0, 0, WHEEL_CELLS, WHEEL_CELLS).data;

    const draw = () => {
      const { rgb, dark } = readInk(canvas);
      const out = ctx.createImageData(WHEEL_CELLS, WHEEL_CELLS);
      for (let y = 0; y < WHEEL_CELLS; y += 1) {
        for (let x = 0; x < WHEEL_CELLS; x += 1) {
          const i = (y * WHEEL_CELLS + x) * 4;
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
      height={WHEEL_CELLS}
      style={style}
      width={WHEEL_CELLS}
    />
  );
}

/**
 * 바퀴가 따로 도는 SUV. 차체는 바퀴를 뺀 디더링 그림이고, 앞뒤 바퀴는 같은 크기의 캔버스를 휠 중심에 얹어
 * 스크롤에 맞춰 돌린다(`.lp-wheel`, CSS `rotate`). 바퀴가 도는 양은 도로가 차에 대해 흐른 거리와 맞춰져 있다
 * (`scene-motion.tsx`의 `--lp-spin`과 `--lp-road`, `--lp-drive` 참고).
 */
export function SuvRolling() {
  return (
    <div className="relative">
      <SuvDither wheels={false} />
      {WHEELS.map(({ cx, cy, r }) => (
        <div
          key={cx}
          aria-hidden
          className="lp-wheel pointer-events-none absolute"
          style={{
            left: `${((cx - r) / 640) * 100}%`,
            top: `${((cy - r) / 250) * 100}%`,
            width: `${((r * 2) / 640) * 100}%`,
            height: `${((r * 2) / 250) * 100}%`,
          }}
        >
          <SuvWheel />
        </div>
      ))}
    </div>
  );
}
