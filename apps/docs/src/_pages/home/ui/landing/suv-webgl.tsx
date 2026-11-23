'use client';

import { useEffect, useRef, useState } from 'react';

import { SuvDither } from './suv-dither';
import { GRID_H, GRID_W, paintSuvMap } from './suv-map';
import { legibleInk, observeReducedMotion, observeTheme, readInk, resolveCss } from './theme-ink';

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

/** 한 조각이 한 칸이다. 밝기 지도에 광택 띠와 커서 불빛을 더한 뒤 Bayer 문턱값과 비교한다. */
const FRAG = `#version 300 es
precision highp float;
precision highp int;
in vec2 vUv;
out vec4 o;
uniform sampler2D uMap;
uniform vec2 uGrid;
uniform float uTime;
uniform vec2 uLight;
uniform float uLightOn;
uniform vec3 uInk;
uniform float uDark;
uniform vec3 uPaint;
uniform float uPaintOn;

float bayer8(ivec2 p) {
  int x = p.x & 7;
  int y = p.y & 7;
  int v = 0;
  for (int i = 0; i < 3; i++) {
    int xb = (x >> i) & 1;
    int yb = (y >> i) & 1;
    v += (2 * (xb ^ yb) + yb) * (1 << (2 * (2 - i)));
  }
  return (float(v) + 0.5) / 64.0;
}

void main() {
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  vec4 m = texture(uMap, uv);
  float aspect = uGrid.x / uGrid.y;
  float sweep = fract(uv.x * 0.9 - uv.y * 0.45 - uTime * 0.07);
  float band = exp(-pow((sweep - 0.5) * 9.0, 2.0));
  float d = distance(uv * vec2(aspect, 1.0), uLight * vec2(aspect, 1.0));
  float glow = exp(-d * d * 14.0) * uLightOn;
  float lum = clamp(m.r + m.g * (band * 0.5 + glow * 0.55), 0.0, 1.0);
  float ink = (uDark > 0.5 ? lum : 1.0 - lum) * m.a;
  float on = step(bayer8(ivec2(gl_FragCoord.xy)), ink);
  vec3 ink3 = mix(uInk, uPaint, m.b * uPaintOn);
  o = vec4(ink3 * on, on);
}`;

type Gl = {
  render: (time: number) => void;
  setInk: (rgb: [number, number, number], dark: boolean) => void;
  setLight: (x: number, y: number, on: number) => void;
  setPaint: (rgb: [number, number, number] | null) => void;
  dispose: () => void;
};

function createGl(canvas: HTMLCanvasElement): Gl | null {
  const gl = canvas.getContext('webgl2', {
    antialias: false,
    depth: false,
    powerPreference: 'low-power',
  });
  if (!gl) return null;

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
  };
  const vert = compile(gl.VERTEX_SHADER, VERT);
  const frag = compile(gl.FRAGMENT_SHADER, FRAG);
  const program = gl.createProgram();
  if (!vert || !frag || !program) return null;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const map = document.createElement('canvas');
  map.width = GRID_W;
  map.height = GRID_H;
  const mapCtx = map.getContext('2d');
  if (!mapCtx) return null;
  paintSuvMap(mapCtx, GRID_W, GRID_H);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, map);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const uTime = gl.getUniformLocation(program, 'uTime');
  const uLight = gl.getUniformLocation(program, 'uLight');
  const uLightOn = gl.getUniformLocation(program, 'uLightOn');
  const uInk = gl.getUniformLocation(program, 'uInk');
  const uDark = gl.getUniformLocation(program, 'uDark');
  const uPaint = gl.getUniformLocation(program, 'uPaint');
  const uPaintOn = gl.getUniformLocation(program, 'uPaintOn');
  gl.uniform1i(gl.getUniformLocation(program, 'uMap'), 0);
  gl.uniform2f(gl.getUniformLocation(program, 'uGrid'), GRID_W, GRID_H);
  gl.viewport(0, 0, GRID_W, GRID_H);

  return {
    render(time) {
      gl.uniform1f(uTime, time);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    setInk([r, g, b], dark) {
      gl.uniform3f(uInk, r / 255, g / 255, b / 255);
      gl.uniform1f(uDark, dark ? 1 : 0);
    },
    setPaint(rgb) {
      gl.uniform1f(uPaintOn, rgb ? 1 : 0);
      if (rgb) gl.uniform3f(uPaint, rgb[0] / 255, rgb[1] / 255, rgb[2] / 255);
    },
    setLight(x, y, on) {
      gl.uniform2f(uLight, x, y);
      gl.uniform1f(uLightOn, on);
    },
    // 컨텍스트를 일부러 잃게 하지 않는다. 개발 모드의 Strict Mode가 같은 캔버스에 효과를 두 번
    // 걸어서, 잃어버린 컨텍스트가 돌아오면 두 번째 `getContext`가 실패한다. 자원만 지운다.
    dispose() {
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}

/**
 * 표현 ③: WebGL2 디더링. 밝기 지도를 텍스처로 올리고 셰이더가 칸마다 점을 찍는다.
 * 빛 띠가 천천히 차체를 쓸고 지나가며, 커서가 가까우면 그 둘레가 밝아진다.
 * 화면에 보일 때만 그리고(30fps), 감소 모션이면 한 장만 그린다. WebGL2가 없으면 ②로 바꾼다.
 *
 * 모션 규칙 예외(결정): 상시 도는 빛 띠와 커서 반응은 `.claude/rules/animation.md`의 "상태 변화에만 모션,
 * 상시 장식·커서 추적 금지"에 어긋나지만, 랜딩 히어로·색 고르기 장면·닫는 구역 한정으로 허용한다(규칙 파일에 예외로
 * 적었다). 견적 흐름에는 쓰지 않는다. 셰이더의 0.07(빛 띠 속도), 9.0(띠 폭), 14.0(커서 반경), 0.55(커서 세기)와
 * 보간 계수 0.18/0.12, 33ms는 `@repo/ui/motion` 토큰이 아닌 값이다.
 */
export function SuvWebgl({
  onFallback,
  paint,
}: {
  onFallback?: () => void;
  /** 차체 점에 칠할 CSS 색. 없으면 다른 부분과 같은 잉크색이다. */
  paint?: string | null;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  const live = useRef({ paint: paint ?? null });
  const control = useRef<{ refresh: () => void } | null>(null);

  useEffect(() => {
    live.current = { paint: paint ?? null };
    control.current?.refresh();
  }, [paint]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = createGl(canvas);
    if (!gl) {
      setFailed(true);
      onFallback?.();
      return;
    }

    let raf = 0;
    let last = 0;
    let visible = false;
    let reduced = false;
    const still = () => reduced;
    let lightOn = 0;
    let targetOn = 0;
    const light = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const clock = performance.now();

    const draw = () => {
      light.x += (light.tx - light.x) * 0.18;
      light.y += (light.ty - light.y) * 0.18;
      if (still()) lightOn = 0;
      else lightOn += (targetOn - lightOn) * 0.12;
      gl.setLight(light.x, light.y, lightOn);
      gl.render(still() ? 8 : (performance.now() - clock) / 1000);
    };
    const frame = (now: number) => {
      raf = 0;
      if (!visible || still() || document.hidden) return;
      if (now - last >= 33) {
        last = now;
        draw();
      }
      raf = requestAnimationFrame(frame);
    };
    const sync = () => {
      if (visible && !still() && !document.hidden) {
        if (!raf) raf = requestAnimationFrame(frame);
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const paintInk = () => {
      const { rgb, dark } = readInk(canvas);
      gl.setInk(rgb, dark);
      const color = live.current.paint;
      gl.setPaint(color ? legibleInk(resolveCss(color), dark) : null);
      draw();
    };
    control.current = {
      refresh: () => {
        paintInk();
        sync();
      },
    };

    const stage = canvas.closest<HTMLElement>('[data-lp-stage]') ?? canvas;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const rect = canvas.getBoundingClientRect();
      light.tx = (event.clientX - rect.left) / rect.width;
      light.ty = (event.clientY - rect.top) / rect.height;
      targetOn = 1;
    };
    const onLeave = () => {
      targetOn = 0;
    };
    stage.addEventListener('pointermove', onMove, { passive: true });
    stage.addEventListener('pointerleave', onLeave);

    const io = new IntersectionObserver((entries) => {
      visible = entries[entries.length - 1]?.isIntersecting ?? false;
      sync();
    });
    io.observe(canvas);
    document.addEventListener('visibilitychange', sync);

    const lost = (event: Event) => {
      event.preventDefault();
      setFailed(true);
      onFallback?.();
    };
    canvas.addEventListener('webglcontextlost', lost);

    paintInk();
    const stopTheme = observeTheme(paintInk);
    const stopReduced = observeReducedMotion((value) => {
      reduced = value;
      draw();
      sync();
    });

    return () => {
      control.current = null;
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
      canvas.removeEventListener('webglcontextlost', lost);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerleave', onLeave);
      stopTheme();
      stopReduced();
      gl.dispose();
    };
  }, [onFallback]);

  if (failed) return <SuvDither />;

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
